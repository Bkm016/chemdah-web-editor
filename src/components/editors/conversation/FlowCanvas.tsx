import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, Connection, Edge, Panel, Node, reconnectEdge, SelectionMode } from 'reactflow';
import { Paper, Button, Group, Tooltip, ActionIcon } from '@mantine/core';
import { useProjectStore } from '../../../store/useProjectStore';
import { IconPlus, IconLayoutDashboard, IconGitBranch, IconHandMove, IconBoxMultiple, IconTrash } from '@tabler/icons-react';
import AgentNode, { AgentNodeData } from './nodes/AgentNode';
import SwitchNode, { SwitchNodeData } from './nodes/SwitchNode';
import { parseConversationToFlow, generateYamlFromFlow, autoLayout } from './conversation-utils';
import { ConversationNodeEditor } from './ConversationNodeEditor';

import 'reactflow/dist/style.css';

export default function FlowCanvas({ fileId }: { fileId: string }) {
  const { conversationFiles, updateFileContent } = useProjectStore();
  const file = conversationFiles[fileId];

  const nodeTypes = useMemo(() => ({ agent: AgentNode, switch: SwitchNode }), []);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Initial load
  useEffect(() => {
    if (file?.content) {
        const { nodes: initialNodes, edges: initialEdges } = parseConversationToFlow(file.content);
        setNodes(initialNodes);
        setEdges(initialEdges);
    }
  }, [fileId]); 

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge({ ...params, animated: true }, eds)),
    [setEdges],
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => setEdges((els) => reconnectEdge(oldEdge, newConnection, els)),
    [setEdges],
  );

  const handleAutoLayout = () => {
    const layouted = autoLayout(nodes, edges);
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
  };

  const handleSave = () => {
    const yaml = generateYamlFromFlow(nodes, edges);
    updateFileContent(fileId, 'conversation', yaml);
  };

  // Auto-save
  useEffect(() => {
      const timer = setTimeout(() => {
          handleSave();
      }, 1000);

      return () => clearTimeout(timer);
  }, [nodes, edges]);

  const handleAddNode = () => {
    const id = `node_${Date.now()}`;
    const newNode: Node<AgentNodeData> = {
        id,
        type: 'agent',
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: {
            label: id,
            npcLines: ['Hello!'],
            playerOptions: [
                { id: `${id}-opt-1`, text: 'Hi there' }
            ]
        }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleAddSwitchNode = () => {
    const id = `switch_${Date.now()}`;
    const newNode: Node<SwitchNodeData> = {
        id,
        type: 'switch',
        position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
        data: {
            label: id,
            branches: [
                { id: `${id}-branch-1`, condition: 'true', actionType: 'run', actionValue: 'tell Hello' }
            ]
        }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleNodeUpdate = (newData: any) => {
    if (!editingNodeId) return;
    setNodes((nds) => nds.map((node) => {
        if (node.id === editingNodeId) {
            return { ...node, data: newData };
        }
        return node;
    }));
  };

  const handleDeleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) => eds.filter((edge) => !edge.selected));
  }, [setNodes, setEdges]);

  const onNodeDoubleClick = (_: React.MouseEvent, node: Node) => {
    setEditingNodeId(node.id);
  };

  const onEdgeDoubleClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      // 双击连线时删除该连线
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
  );

  const editingNode = nodes.find(n => n.id === editingNodeId);
  const hasSelectedNodes = nodes.some(n => n.selected);

  const otherNodeIds = useMemo(() => {
    if (!editingNode) return [];
    return nodes
        .filter(n => n.id !== editingNode.id)
        .map(n => n.data.label);
  }, [nodes, editingNode]);

  return (
    <Paper h="100%" radius={0} style={{ overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: 1, height: '100%', position: 'relative' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onReconnect={onReconnect}
                onNodeDoubleClick={onNodeDoubleClick}
                onEdgeDoubleClick={onEdgeDoubleClick}
                nodeTypes={nodeTypes}
                fitView
                proOptions={{ hideAttribution: true }}
                style={{ width: '100%', height: '100%' }}
                panOnDrag={!isSelectionMode}
                selectionOnDrag={isSelectionMode}
                selectionKeyCode={['Shift']}
                multiSelectionKeyCode={['Control', 'Meta', 'Shift']}
                deleteKeyCode={['Backspace', 'Delete']}
                selectionMode={SelectionMode.Partial}
            >
                <Background color="#333" gap={16} />
                <Controls />
                <MiniMap style={{ backgroundColor: '#1a1b1e' }} nodeColor="#4dabf7" />
                <Panel position="bottom-center">
                    <Group gap="xs" p="xs" bg="rgba(0,0,0,0.7)" style={{ borderRadius: 8 }}>
                        <Tooltip label={isSelectionMode ? "切换到拖拽模式" : "切换到框选模式"}>
                            <ActionIcon 
                                variant={isSelectionMode ? "filled" : "light"} 
                                color="orange" 
                                onClick={() => setIsSelectionMode(!isSelectionMode)}
                                size="lg"
                            >
                                {isSelectionMode ? <IconBoxMultiple size={18} /> : <IconHandMove size={18} />}
                            </ActionIcon>
                        </Tooltip>
                        
                        <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.2)' }} />

                        <Button size="xs" variant="filled" color="blue" leftSection={<IconPlus size={12} />} onClick={handleAddNode}>
                            添加节点
                        </Button>
                        <Button size="xs" variant="filled" color="violet" leftSection={<IconGitBranch size={12} />} onClick={handleAddSwitchNode}>
                            添加 Switch
                        </Button>
                        <Button size="xs" variant="light" color="gray" leftSection={<IconLayoutDashboard size={12} />} onClick={handleAutoLayout}>
                            智能重排
                        </Button>

                        {hasSelectedNodes && (
                            <>
                                <div style={{ width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                                <Button size="xs" variant="filled" color="red" leftSection={<IconTrash size={12} />} onClick={handleDeleteSelected}>
                                    删除选中
                                </Button>
                            </>
                        )}
                    </Group>
                </Panel>
            </ReactFlow>
        </div>
        
        {editingNode && (
            <ConversationNodeEditor
                opened={!!editingNode}
                onClose={() => setEditingNodeId(null)}
                data={editingNode.data}
                type={editingNode.type as 'agent' | 'switch'}
                onUpdate={handleNodeUpdate}
                fileId={fileId}
                existingIds={otherNodeIds}
            />
        )}
    </Paper>
  );
}


