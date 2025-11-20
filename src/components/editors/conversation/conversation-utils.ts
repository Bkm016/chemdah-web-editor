import { Edge, Node } from 'reactflow';
import { parseYaml, toYaml } from '../../../utils/yaml-utils';
import { AgentNodeData } from './nodes/AgentNode';

export const parseConversationToFlow = (yamlContent: string) => {
  const data = parseYaml(yamlContent) || {};
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  let x = 100;
  let y = 100;

  Object.keys(data).forEach((key) => {
    if (key === '__option__') return; // Skip metadata

    const section = data[key];
    
    // Determine node type
    // For now, we treat everything as an AgentNode unless it's clearly a switch (which we haven't implemented yet)
    // But based on example.yml, 'conversation_switch_0' has 'when' instead of 'npc/player'
    
    if (section.npc || section.player) {
        // It's a conversation agent
        const npcLines = Array.isArray(section.npc) ? section.npc : (section.npc ? [section.npc] : []);
        const playerOptions = Array.isArray(section.player) ? section.player : [];
        
        const options = playerOptions.map((opt: any, index: number) => ({
            id: `${key}-opt-${index}`,
            text: opt.reply || '...',
            target: opt.then // Store raw 'then' logic to parse edges later
        }));

        nodes.push({
            id: key,
            type: 'agent',
            position: { x, y },
            data: {
                label: key,
                npcLines,
                playerOptions: options
            }
        });

        // Parse Edges from 'then'
        options.forEach((opt: any) => {
            if (typeof opt.target === 'string') {
                // Simple check for "goto <node>"
                const match = opt.target.match(/goto\s+([a-zA-Z0-9_]+)/);
                if (match && match[1]) {
                    edges.push({
                        id: `e-${opt.id}-${match[1]}`,
                        source: key,
                        sourceHandle: opt.id,
                        target: match[1],
                        type: 'default',
                        animated: true,
                    });
                }
            }
        });

        x += 350;
        if (x > 1000) {
            x = 100;
            y += 400;
        }
    }
  });

  return { nodes, edges };
};

export const generateYamlFromFlow = (nodes: Node<AgentNodeData>[], edges: Edge[]) => {
    const conversationObj: any = {
        '__option__': {
            theme: 'chat',
            title: '{name}'
        }
    };

    nodes.forEach(node => {
        if (node.type === 'agent') {
            const { label, npcLines, playerOptions } = node.data;
            
            const playerSection = playerOptions.map(opt => {
                // Find edge connected to this option
                const edge = edges.find(e => e.source === node.id && e.sourceHandle === opt.id);
                let thenScript = null;
                
                if (edge) {
                    // If connected to another node, generate goto
                    const targetNode = nodes.find(n => n.id === edge.target);
                    if (targetNode) {
                        thenScript = `goto ${targetNode.data.label}`;
                    }
                } else if (opt.target) {
                    // If no edge but has original script, keep it
                    // But only if it's NOT a goto script (because goto implies a connection that was removed)
                    // Actually, if the user removed the connection, we should probably remove the goto.
                    // But if it's a complex script, we keep it.
                    if (!opt.target.trim().startsWith('goto ')) {
                        thenScript = opt.target;
                    }
                }

                const optObj: any = {
                    reply: opt.text
                };
                if (thenScript) {
                    optObj.then = thenScript;
                }
                return optObj;
            });

            conversationObj[label] = {
                npc: npcLines,
                player: playerSection
            };
        }
    });

    return toYaml(conversationObj);
};

