import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, Connection, Edge, Panel, Node, OnSelectionChangeParams } from 'reactflow';
import { Paper, Text, Button, Stack } from '@mantine/core';
import { useProjectStore } from '../../../store/useProjectStore';
import { IconRefresh, IconPlus, IconDeviceFloppy } from '@tabler/icons-react';
import AgentNode, { AgentNodeData } from './nodes/AgentNode';
import { parseConversationToFlow, generateYamlFromFlow } from './conversation-utils';
import AgentProperties from './AgentProperties';

import 'reactflow/dist/style.css';

export default function FlowCanvas({ fileId }: { fileId: string }) {
  const { conversationFiles, updateFileContent } = useProjectStore();
  const file = conversationFiles[fileId];

  const nodeTypes = useMemo(() => ({ agent: AgentNode }), []);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

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

  const onSelectionChange = useCallback(({ nodes }: OnSelectionChangeParams) => {
    if (nodes.length > 0) {
        setSelectedNodeId(nodes[0].id);
    } else {
        setSelectedNodeId(null);
    }
  }, []);

  const handleReload = () => {
    if (file?.content) {
        const { nodes: initialNodes, edges: initialEdges } = parseConversationToFlow(file.content);
        setNodes(initialNodes);
        setEdges(initialEdges);
    }
  };

  const handleSave = () => {
    const yaml = generateYamlFromFlow(nodes, edges);
    updateFileContent(fileId, 'conversation', yaml);
  };

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

  const handleNodeUpdate = (id: string, newData: AgentNodeData) => {
    setNodes((nds) => nds.map((node) => {
        if (node.id === id) {
            return { ...node, data: newData };
        }
        return node;
    }));
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <Paper h="100%" radius={0} style={{ overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: 1, height: '100%', position: 'relative' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onSelectionChange={onSelectionChange}
                nodeTypes={nodeTypes}
                fitView
                proOptions={{ hideAttribution: true }}
                style={{ width: '100%', height: '100%' }}
            >
                <Background color="#333" gap={16} />
                <Controls />
                <MiniMap style={{ backgroundColor: '#1a1b1e' }} nodeColor="#4dabf7" />
                <Panel position="top-left">
                    <Stack gap="xs" p="xs" bg="rgba(0,0,0,0.7)" style={{ borderRadius: 8 }}>
                        <Text size="xs" fw={700} c="dimmed">工具栏</Text>
                        <Button size="xs" variant="filled" color="blue" leftSection={<IconPlus size={12} />} onClick={handleAddNode}>
                            添加节点
                        </Button>
                        <Button size="xs" variant="light" color="green" leftSection={<IconDeviceFloppy size={12} />} onClick={handleSave}>
                            保存更改
                        </Button>
                        <Button size="xs" variant="subtle" color="gray" leftSection={<IconRefresh size={12} />} onClick={handleReload}>
                            重置画布
                        </Button>
                    </Stack>
                </Panel>
            </ReactFlow>
        </div>
        
        {selectedNode && (
            <Paper 
                w={300} 
                h="100%" 
                style={{ borderLeft: '1px solid var(--mantine-color-dark-6)', zIndex: 10 }}
                bg="var(--mantine-color-dark-8)"
            >
                <AgentProperties 
                    node={selectedNode} 
                    onChange={handleNodeUpdate} 
                />
            </Paper>
        )}
    </Paper>
  );
}


