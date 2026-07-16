import { Edge, Node } from 'reactflow';
import { parseYaml, toYaml } from '@/utils/yaml-utils';
import { AgentNodeData } from './nodes/AgentNode';
import { SwitchNodeData } from './nodes/SwitchNode';

export interface ConversationOptions {
    theme?: string;
    title?: string;
    'global-flags'?: string[];
}
export const autoLayout = (nodes: Node[], edges: Edge[]) => {
    if (nodes.length === 0) return { nodes, edges };

    const nodeWidth = 320;
    const rankSep = 150; 
    const nodeSep = 60;  
    const branchGap = 150; // 加大分支间的垂直间距

    // 1. 统一高度计算
    const getNodeHeight = (node: Node) => {
        let contentHeight = 70;
        // 兼容 branches 和 playerOptions
        const items = (node.data as any)?.branches || (node.data as any)?.playerOptions;
        
        if (node.type === 'switch') {
            contentHeight += (items?.length || 0) * 42;
        } else {
            const npcLines = (node.data as any)?.npcLines?.length || 1;
            contentHeight += (npcLines * 30) + ((items?.length || 0) * 45);
        }
        return contentHeight + 20;
    };

    // 2. 统一获取子节点顺序
    const getChildrenOrder = (nodeId: string): string[] => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return [];
        const items = (node.data as any)?.branches || (node.data as any)?.playerOptions;
        return items?.map((i: any) => i.next).filter(Boolean) || [];
    };

    // 3. 构建邻接关系
    const adj = new Map<string, string[]>();
    const revAdj = new Map<string, string[]>();
    nodes.forEach(n => { adj.set(n.id, []); revAdj.set(n.id, []); });
    edges.forEach(e => {
        if (adj.has(e.source) && adj.has(e.target)) {
            adj.get(e.source)!.push(e.target);
            revAdj.get(e.target)!.push(e.source);
        }
    });

    // 4. 稳定的层级分配
    const levels = new Map<string, number>();
    nodes.forEach(n => levels.set(n.id, 0));
    const sortedNodeIds = nodes.map(n => n.id).sort();
    for (let i = 0; i < nodes.length; i++) {
        let changed = false;
        sortedNodeIds.forEach(id => {
            const parents = revAdj.get(id) || [];
            let maxPLevel = -1;
            parents.forEach(pId => {
                const pl = levels.get(pId) ?? 0;
                if (pl > maxPLevel) maxPLevel = pl;
            });
            if (maxPLevel !== -1 && levels.get(id) !== maxPLevel + 1) {
                levels.set(id, maxPLevel + 1);
                changed = true;
            }
        });
        if (!changed) break;
    }

    // X轴压缩 (解决层级跳跃导致的水平空隙)
    const usedLevels = Array.from(new Set(levels.values())).sort((a, b) => a - b);
    const compactLevelMap = new Map<number, number>();
    usedLevels.forEach((lv, idx) => compactLevelMap.set(lv, idx));
    nodes.forEach(n => levels.set(n.id, compactLevelMap.get(levels.get(n.id)!)!));

    // 5. 按层级分组并排序
    const rows = new Map<number, Node[]>();
    nodes.forEach(n => {
        const lv = levels.get(n.id)!;
        if (!rows.has(lv)) rows.set(lv, []);
        rows.get(lv)!.push(n);
    });

    const sortedLevelKeys = Array.from(rows.keys()).sort((a, b) => a - b);
    sortedLevelKeys.forEach(lv => {
        const currentRow = rows.get(lv)!;
        if (lv === 0) {
            currentRow.sort((a, b) => a.id.localeCompare(b.id));
        } else {
            const prevRow = rows.get(lv - 1) || [];
            const prevPos = new Map(prevRow.map((n, idx) => [n.id, idx]));
            currentRow.sort((a, b) => {
                const pA = revAdj.get(a.id)?.[0];
                const pB = revAdj.get(b.id)?.[0];
                const posA = pA ? (prevPos.get(pA) ?? 999) : 999;
                const posB = pB ? (prevPos.get(pB) ?? 999) : 999;
                if (posA !== posB) return posA - posB;
                if (pA && pA === pB) {
                    const order = getChildrenOrder(pA);
                    return order.indexOf(a.id) - order.indexOf(b.id);
                }
                return a.id.localeCompare(b.id);
            });
        }
    });

    // 6. 最终坐标计算 (核心改进：多父节点下的 Y 轴分支避让)
    const newNodes: Node[] = [];
    const nodePositions = new Map<string, { x: number; y: number }>();
    const levelNextY = new Map<number, number>();
    sortedLevelKeys.forEach(lv => levelNextY.set(lv, 0));

    sortedLevelKeys.forEach(lv => {
        const currentRow = rows.get(lv)!;

        currentRow.forEach(node => {
            const nextAvailableY = levelNextY.get(lv) || 0;
            const parents = revAdj.get(node.id) || [];
            
            // 计算建议的 Y 坐标
            let suggestedY = nextAvailableY;

            if (parents.length > 0) {
                // 遍历所有父节点，寻找最合适的垂直位置
                let maxBranchOffset = 0;
                let bestParentY = -1;

                parents.forEach(pId => {
                    const pPos = nodePositions.get(pId);
                    if (pPos) {
                        const pChildren = getChildrenOrder(pId);
                        const optionIdx = pChildren.indexOf(node.id);
                        
                        // 如果是父节点的非首个选项，必须增加垂直偏移
                        if (optionIdx > 0) {
                            maxBranchOffset = Math.max(maxBranchOffset, optionIdx * branchGap);
                        }
                        
                        // 记录层级最近的父节点 Y 轴，尝试对齐
                        if (bestParentY === -1 || levels.get(pId) === lv - 1) {
                            bestParentY = pPos.y;
                        }
                    }
                });

                // 目标 Y = 父节点对齐位置 + 分支偏移量
                // 同时不能覆盖已经排好的节点
                suggestedY = Math.max(nextAvailableY, bestParentY + maxBranchOffset);
            }

            const position = { x: lv * (nodeWidth + rankSep), y: suggestedY };
            nodePositions.set(node.id, position);
            newNodes.push({ ...node, position });
            
            // 更新该列的下一个可用起始高度
            levelNextY.set(lv, suggestedY + getNodeHeight(node) + nodeSep);
        });
    });

    return { nodes: newNodes, edges };
};

export const parseConversationToFlow = (yamlContent: string) => {
  const data = parseYaml(yamlContent) || {};
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  let hasCanvasData = false;
  let conversationOptions: ConversationOptions = {
    theme: 'chat',
    title: '{name}'
  };

  // Parse __option__ if it exists
  if (data.__option__) {
    conversationOptions = {
      theme: data.__option__.theme,
      title: data.__option__.title,
      'global-flags': data.__option__['global-flags']
    };
  }

  Object.keys(data).forEach((key) => {
    if (key === '__option__') return; // Skip metadata

    const section = data[key];

    // Determine position
    let position = { x: 0, y: 0 };
    if (section.canvas) {
        position = { x: section.canvas.x, y: section.canvas.y };
        hasCanvasData = true;
    }

    // Check for Switch Node (when property)
    if (section.when && Array.isArray(section.when)) {
        const branches = section.when.map((branch: any, index: number) => {
            let actionType: 'open' | 'run' = 'run';
            let actionValue = '';

            if (branch.open) {
                actionType = 'open';
                actionValue = branch.open;
            } else if (branch.run) {
                actionType = 'run';
                actionValue = branch.run;
            }

            return {
                id: `${key}-branch-${index}`,
                condition: branch.if || 'true',
                actionType,
                actionValue
            };
        });

        nodes.push({
            id: key,
            type: 'switch',
            position,
            data: {
                label: key,
                npcId: section['npc id'],
                branches
            }
        });

        // Parse Edges for Switch
        branches.forEach((branch: any) => {
            if (branch.actionType === 'open') {
                edges.push({
                    id: `e-${branch.id}-${branch.actionValue}`,
                    source: key,
                    sourceHandle: branch.id,
                    target: branch.actionValue,
                    type: 'default',
                    animated: true,
                });
            }
        });

    } else if (section.npc || section.player || section.agent || section.condition || section['npc id']) {
        // Agent Node
        const npcLines = Array.isArray(section.npc) ? section.npc : (section.npc ? [section.npc] : []);
        const playerOptions = Array.isArray(section.player) ? section.player : [];

        const options = playerOptions.map((opt: any, index: number) => {
            let actions = '';
            let next = opt.next || '';

            // 如果有 then 字段，处理其中的 goto 语句
            if (opt.then) {
                const thenStr = typeof opt.then === 'string' ? opt.then : String(opt.then);

                // 如果没有 next 字段，从 then 中解析
                if (!next) {
                    // 匹配 goto 后面的节点ID，支持中文、字母、数字、下划线等字符
                    // 使用 \S+ 匹配非空白字符，这样可以支持各种语言的字符
                    const gotoMatch = thenStr.match(/goto\s+(\S+)/);
                    if (gotoMatch) {
                        next = gotoMatch[1].trim();
                    }
                }

                // 移除 goto 语句，只保留纯脚本部分
                // 使用全局匹配移除所有 goto 语句（支持各种字符的节点ID）
                actions = thenStr
                    .replace(/goto\s+\S+/g, '')
                    .replace(/^\s+|\s+$/g, '')
                    .trim();
            }

            // 提取玩家选项的自定义字段
            const { reply, if: optIf, then, next: nextField, ...optCustomFields } = opt;

            return {
                id: `${key}-opt-${index}`,
                text: opt.reply || '...',
                condition: opt.if,
                actions: actions,  // 纯脚本内容（不包含 goto）
                next: next,  // 使用 YAML 中的 next 或从 then 解析出的 next
                ...optCustomFields  // 包含 dos, dosh, gscript 等自定义字段
            };
        });

        // 提取节点的自定义字段（排除已知字段）
        const { npc, player, agent, condition, canvas, 'npc id': npcIdField, ...nodeCustomFields } = section;

        nodes.push({
            id: key,
            type: 'agent',
            position,
            data: {
                label: key,
                npcLines,
                playerOptions: options,
                npcId: section['npc id'],
                condition: section.condition,
                agent: section.agent,
                ...nodeCustomFields  // 包含 root, self, model 等自定义字段
            }
        });

        // Parse Edges
        options.forEach((opt: any) => {
            if (opt.next) {
                edges.push({
                    id: `e-${opt.id}-${opt.next}`,
                    source: key,
                    sourceHandle: opt.id,
                    target: opt.next,
                    type: 'default',
                    animated: true,
                });
            }
        });
    }
  });

  // Apply auto layout if no canvas data found
  if (!hasCanvasData && nodes.length > 0) {
      const layouted = autoLayout(nodes, edges);
      return { ...layouted, options: conversationOptions };
  }

  return { nodes, edges, options: conversationOptions };
};

export const generateYamlFromFlow = (nodes: Node[], edges: Edge[], options?: ConversationOptions) => {
    const optionObj: any = {};

    // Build __option__ object only with defined values
    if (options?.theme) optionObj.theme = options.theme;
    if (options?.title) optionObj.title = options.title;
    if (options?.['global-flags'] && options['global-flags'].length > 0) {
        optionObj['global-flags'] = options['global-flags'];
    }

    const conversationObj: any = {
        '__option__': Object.keys(optionObj).length > 0 ? optionObj : {
            theme: 'chat',
            title: '{name}'
        }
    };

    nodes.forEach(node => {
        if (node.type === 'switch') {
            const { label, npcId, branches } = node.data as SwitchNodeData;

            const whenSection = branches.map(branch => {
                const edge = edges.find(e => e.source === node.id && e.sourceHandle === branch.id);
                let actionValue = branch.actionValue;

                // If connected, use the connection target
                if (branch.actionType === 'open' && edge) {
                    const targetNode = nodes.find(n => n.id === edge.target);
                    if (targetNode) {
                        actionValue = targetNode.data.label;
                    }
                }

                const branchObj: any = {
                    if: branch.condition
                };

                if (branch.actionType === 'open') {
                    branchObj.open = actionValue;
                } else {
                    branchObj.run = actionValue;
                }

                return branchObj;
            });

            const nodeObj: any = {
                when: whenSection,
                canvas: { x: Math.round(node.position.x), y: Math.round(node.position.y) }
            };

            if (npcId) nodeObj['npc id'] = npcId;

            conversationObj[label] = nodeObj;

        } else if (node.type === 'agent') {
            const { label, npcLines, playerOptions, npcId, condition, agent, ...customFields } = node.data as AgentNodeData;

            const playerSection = playerOptions.map(opt => {
                const edge = edges.find(e => e.source === node.id && e.sourceHandle === opt.id);

                const optObj: any = {
                    reply: opt.text
                };

                if (opt.condition) {
                    optObj.if = opt.condition;
                }

                // 构建 then 脚本：actions + goto
                let thenScript = opt.actions || '';
                if (edge) {
                    const targetNode = nodes.find(n => n.id === edge.target);
                    if (targetNode) {
                        const gotoCmd = `goto ${targetNode.data.label}`;
                        // 将 goto 放在脚本末尾
                        thenScript = thenScript ? `${thenScript}\n${gotoCmd}` : gotoCmd;
                        // 同时设置 next 辅助字段用于编辑器连线
                        optObj.next = targetNode.data.label;
                    }
                } else if (opt.next) {
                    // 即使没有边缘，如果节点数据中有 next，也保留它
                    optObj.next = opt.next;
                }

                if (thenScript) {
                    optObj.then = thenScript;
                }

                // 添加玩家选项的自定义字段 (dos, dosh, gscript 等)
                const { id, text, condition: optCond, actions, next, ...optCustomFields } = opt;
                Object.assign(optObj, optCustomFields);

                return optObj;
            });

            const nodeObj: any = {
                npc: npcLines,
                player: playerSection,
                canvas: { x: Math.round(node.position.x), y: Math.round(node.position.y) }
            };

            if (npcId) nodeObj['npc id'] = npcId;
            if (condition) nodeObj.condition = condition;
            if (agent) nodeObj.agent = agent;

            // 添加节点的自定义字段 (root, self, model 等)
            Object.assign(nodeObj, customFields);

            conversationObj[label] = nodeObj;
        }
    });

    return toYaml(conversationObj);
};

