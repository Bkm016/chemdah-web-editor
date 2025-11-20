import React, { useState, useCallback, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, useDraggable, useDroppable, pointerWithin } from '@dnd-kit/core';
import { IconChevronRight, IconFolder, IconFolderOpen, IconFileText, IconTrash } from '@tabler/icons-react';
import { Text, ActionIcon } from '@mantine/core';

// --- Types ---

export interface TreeItem {
    id: string;
    path: string;
    label: string;
    icon?: React.ReactNode;
    data?: any;
    isFolder?: boolean;
}

interface FileTreeProps {
    items: TreeItem[];
    activeId?: string | null;
    onSelect?: (id: string) => void;
    onDelete?: (id: string) => void;
    onDrop?: (id: string, targetPath: string) => void;
    renderActions?: (item: TreeItem) => React.ReactNode;
    renderLabel?: (item: TreeItem) => React.ReactNode;
    defaultExpanded?: string[];
}

interface TreeNode {
    id: string;
    label: string;
    path: string;
    isFolder: boolean;
    data?: any;
    children?: TreeNode[];
    originalItem?: TreeItem;
}

// --- Components ---

const TreeNodeComponent = ({
    node,
    level,
    onNodeClick,
    selectedNodeId,
    renderLabel,
    renderActions,
    onDelete,
    expandedNodes,
    onToggleExpand,
    draggedNode,
}: {
    node: TreeNode;
    level: number;
    onNodeClick?: (node: TreeNode) => void;
    selectedNodeId?: string | null;
    renderLabel?: (item: TreeItem) => React.ReactNode;
    renderActions?: (item: TreeItem) => React.ReactNode;
    onDelete?: (id: string) => void;
    expandedNodes: Set<string>;
    onToggleExpand: (path: string) => void;
    draggedNode: TreeNode | null;
}) => {
    const isSelected = node.id === selectedNodeId;
    const isExpanded = expandedNodes.has(node.path);
    const hasChildren = node.children && node.children.length > 0;
    
    // --- Drag Logic ---
    // Allow dragging for all nodes (including implicit folders)
    const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
        id: node.id,
        data: node,
    });

    // --- Drop Logic ---
    // Determine if this node is a valid drop target
    // 1. Must be a folder
    // 2. Cannot be the node being dragged (Self)
    // 3. Cannot be a descendant of the node being dragged (Circular)
    const isSelf = draggedNode?.id === node.id;
    const isDescendant = draggedNode && node.path.startsWith(draggedNode.path + '/');
    const isDroppable = node.isFolder && !isSelf && !isDescendant;

    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: node.path, // Use path as drop ID
        data: node,
        disabled: !isDroppable,
    });

    // --- Interaction ---
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (node.isFolder) {
            if (hasChildren) {
                onToggleExpand(node.path);
            }
            return;
        }

        if (onNodeClick) {
            onNodeClick(node);
        }
    };

    // --- Styles ---
    const style: React.CSSProperties = {
        opacity: isDragging ? 0.4 : 1,
        paddingLeft: `${level * 16 + 8}px`,
    };

    let bgClass = "";
    if (isOver && isDroppable) {
        // Strong highlight for valid drop target
        bgClass = "drop-target";
    } else if (isSelected) {
        bgClass = "selected";
    }

    return (
        <>
            <div
                ref={(el) => {
                    setDragRef(el);
                    if (node.isFolder) setDropRef(el);
                }}
                style={style}
                className={`group relative flex items-center py-1.5 pr-2 cursor-pointer select-none text-gray-400 hover:text-gray-200 file-tree-item ${bgClass}`}
                onClick={handleClick}
                {...attributes}
                {...listeners}
            >
                {/* Column 1: Arrow (Folder only) */}
                <div className="w-5 h-5 flex items-center justify-center shrink-0 mr-1">
                    {node.isFolder && hasChildren && (
                        <IconChevronRight
                            size={14}
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        />
                    )}
                </div>

                {/* Column 2: Icon (Folder or File) */}
                <div className="w-5 h-5 flex items-center justify-center shrink-0 mr-2 text-[#dcb67a]">
                    {node.isFolder ? (
                        isExpanded ? <IconFolderOpen size={16} /> : (
                            hasChildren ? <IconFolder size={16} /> : <IconFolder size={16} className="opacity-50" />
                        )
                    ) : (
                        <IconFileText size={16} className="text-gray-400" />
                    )}
                </div>

                {/* Column 3: Label */}
                <div className="flex-1 min-w-0 truncate pr-8">
                    {node.originalItem && renderLabel ? renderLabel(node.originalItem) : <Text size="sm" truncate>{node.label}</Text>}
                </div>

                {/* Actions */}
                <div className={`absolute right-2 z-10 flex items-center rounded file-tree-actions`}>
                    {node.originalItem && (
                        renderActions ? renderActions(node.originalItem) : (
                            onDelete && (
                                <ActionIcon 
                                    size="xs" 
                                    variant="subtle" 
                                    color="red" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if(confirm('Delete ' + node.label + '?')) onDelete(node.id);
                                    }}
                                >
                                    <IconTrash size={12} />
                                </ActionIcon>
                            )
                        )
                    )}
                </div>
            </div>

            {/* Children */}
            {isExpanded && node.children && (
                <div>
                    {node.children.map(child => (
                        <TreeNodeComponent
                            key={child.id}
                            node={child}
                            level={level + 1}
                            onNodeClick={onNodeClick}
                            selectedNodeId={selectedNodeId}
                            renderLabel={renderLabel}
                            renderActions={renderActions}
                            onDelete={onDelete}
                            expandedNodes={expandedNodes}
                            onToggleExpand={onToggleExpand}
                            draggedNode={draggedNode}
                        />
                    ))}
                </div>
            )}
        </>
    );
};

const RootDropZone = ({ text, isDragging }: { text?: string, isDragging: boolean }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: 'root-drop-zone',
        data: { type: 'root' },
        disabled: !isDragging // Only active when dragging
    });

    if (!isDragging) return null;

    return (
        <div
            ref={setNodeRef}
            className={`mx-2 my-2 p-3 border-2 border-dashed rounded-lg transition-all flex items-center justify-center gap-2
                ${isOver ? 'border-blue-500/50 bg-blue-500/10 opacity-100' : 'border-white/10 bg-transparent opacity-50'}`}
        >
            <IconFolderOpen size={16} className="text-gray-500" />
            <span className="text-sm text-gray-500">
                {text || 'Move to Root'}
            </span>
        </div>
    );
};

export function FileTree({ items, activeId, onSelect, onDelete, onDrop, renderActions, renderLabel, defaultExpanded = [] }: FileTreeProps) {
    // Convert flat items to tree structure
    const treeData = useMemo(() => {
        const buildTree = (items: TreeItem[]): TreeNode[] => {
            const levelMap: any = {};

            items.forEach(item => {
                const parts = item.path.split('/');
                let currentLevel = levelMap;
                
                const parentParts = parts.slice(0, -1);
                const itemName = parts[parts.length - 1];

                let currentPath = "";
                parentParts.forEach((part) => {
                    currentPath = currentPath ? `${currentPath}/${part}` : part;
                    if (!currentLevel[part]) {
                        currentLevel[part] = { 
                            __node: {
                                id: `folder-${currentPath}`,
                                label: part,
                                path: currentPath,
                                isFolder: true,
                                children: []
                            },
                            __children: {}
                        };
                    }
                    currentLevel = currentLevel[part].__children;
                });

                if (item.isFolder) {
                    if (!currentLevel[itemName]) {
                        currentLevel[itemName] = { __children: {} };
                    }
                    currentLevel[itemName].__node = {
                        id: item.id,
                        label: item.label,
                        path: item.path,
                        isFolder: true,
                        originalItem: item,
                        children: []
                    };
                } else {
                    if (!currentLevel[itemName]) {
                        currentLevel[itemName] = { __children: {} };
                    }
                    currentLevel[itemName].__node = {
                        id: item.id,
                        label: item.label,
                        path: item.path,
                        isFolder: false,
                        originalItem: item
                    };
                }
            });

            const flatten = (map: any): TreeNode[] => {
                const nodes = Object.keys(map).map(key => {
                    const entry = map[key];
                    const node = entry.__node;
                    if (node) {
                        node.children = flatten(entry.__children);
                        node.children.sort((a: TreeNode, b: TreeNode) => {
                            if (a.isFolder === b.isFolder) return a.label.localeCompare(b.label);
                            return a.isFolder ? -1 : 1;
                        });
                        return node;
                    }
                    return null;
                }).filter(Boolean) as TreeNode[];
                return nodes;
            };

            const result = flatten(levelMap);
            result.sort((a: TreeNode, b: TreeNode) => {
                if (a.isFolder === b.isFolder) return a.label.localeCompare(b.label);
                return a.isFolder ? -1 : 1;
            });
            return result;
        };

        return buildTree(items);
    }, [items]);

    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => new Set(defaultExpanded));
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [draggedNode, setDraggedNode] = useState<TreeNode | null>(null);

    const toggleExpand = useCallback((path: string) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(path)) next.delete(path);
            else next.add(path);
            return next;
        });
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const findNode = (nodes: TreeNode[], id: string): TreeNode | null => {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNode(node.children, id);
                if (found) return found;
            }
        }
        return null;
    };

    const handleDragStart = (event: DragStartEvent) => {
        const id = event.active.id as string;
        setActiveDragId(id);
        const node = findNode(treeData, id);
        setDraggedNode(node);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);
        setDraggedNode(null);

        if (!over) return;

        const sourceId = active.id as string;
        let targetPath = '';

        if (over.id === 'root-drop-zone') {
            targetPath = '';
        } else {
            targetPath = over.id as string;
        }

        if (onDrop) {
            onDrop(sourceId, targetPath);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="select-none pb-10">
                {treeData.map(node => (
                    <TreeNodeComponent
                        key={node.id}
                        node={node}
                        level={0}
                        onNodeClick={(n) => onSelect?.(n.id)}
                        selectedNodeId={activeId}
                        renderLabel={renderLabel}
                        renderActions={renderActions}
                        onDelete={onDelete}
                        expandedNodes={expandedNodes}
                        onToggleExpand={toggleExpand}
                        draggedNode={draggedNode}
                    />
                ))}

                <RootDropZone isDragging={!!activeDragId} />
            </div>

            <DragOverlay>
                {draggedNode && (
                    <div className="px-3 py-1.5 rounded-md shadow-xl bg-zinc-800 border border-zinc-700 opacity-90 flex items-center">
                        <div className="mr-2 text-[#dcb67a]">
                            {draggedNode.isFolder ? <IconFolder size={16} /> : <IconFileText size={16} className="text-gray-400" />}
                        </div>
                        <Text size="sm">{draggedNode.label}</Text>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}

