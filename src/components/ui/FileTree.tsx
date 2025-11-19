import { Text, Collapse, ActionIcon } from '@mantine/core';
import { IconChevronRight, IconFileText, IconFolder, IconFolderOpen, IconTrash } from '@tabler/icons-react';
import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import classes from './FileTree.module.css';

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

export function FileTree({ items, activeId, onSelect, onDelete, onDrop, renderActions, renderLabel, defaultExpanded = [] }: FileTreeProps) {
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        defaultExpanded.forEach(path => initial[path] = true);
        return initial;
    });

    const toggleFolder = (path: string) => {
        setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
    };

    // Group items by path
    const treeData = useMemo(() => {
        const root: any = {};
        
        items.forEach(item => {
            const parts = item.path.split('/');
            let currentLevel = root;
            
            if (item.isFolder) {
                // It's a folder. Walk the path.
                parts.forEach((part, index) => {
                    if (!currentLevel[part]) {
                        currentLevel[part] = { __items: [] };
                    }
                    // If this is the last part, attach metadata
                    if (index === parts.length - 1) {
                        currentLevel[part].__id = item.id;
                        currentLevel[part].__data = item.data;
                        currentLevel[part].__label = item.label;
                    }
                    currentLevel = currentLevel[part];
                });
            } else {
                // It's a file. Walk the path excluding the filename.
                const folderParts = parts.slice(0, -1);
                folderParts.forEach(part => {
                    if (!currentLevel[part]) {
                        currentLevel[part] = { __items: [] };
                    }
                    currentLevel = currentLevel[part];
                });
                
                if (!currentLevel.__items) currentLevel.__items = [];
                currentLevel.__items.push(item);
            }
        });
        
        return root;
    }, [items]);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination || !onDrop) return;
        // If dropped on root, path is empty string
        // If dropped on a folder, path is the folder path
        const targetPath = result.destination.droppableId === 'root' ? '' : result.destination.droppableId;
        onDrop(result.draggableId, targetPath);
    };

    const renderTree = (node: any, path: string = '') => {
        const items = node.__items || [];
        const folders = Object.keys(node).filter(k => !k.startsWith('__'));

        return (
            <Droppable droppableId={path || 'root'} type="FILE">
                {(provided, snapshot) => (
                    <div 
                        ref={provided.innerRef} 
                        {...provided.droppableProps}
                        style={{ 
                            minHeight: items.length === 0 && folders.length === 0 ? (snapshot.isDraggingOver ? 30 : 0) : 5,
                            backgroundColor: snapshot.isDraggingOver ? 'var(--mantine-color-dark-6)' : 'transparent',
                            transition: 'background-color 0.2s',
                            paddingBottom: path === '' && snapshot.isDraggingOver ? 40 : 0, // Add space for root drop
                            position: 'relative'
                        }}
                    >
                        {folders.map(folderKey => {
                            const currentPath = path ? `${path}/${folderKey}` : folderKey;
                            const isExpanded = expandedFolders[currentPath];
                            const folderNode = node[folderKey];
                            const folderId = folderNode.__id;
                            const folderLabel = folderNode.__label || folderKey;

                            return (
                                <div key={currentPath}>
                                    <div className={classes.node} onClick={() => toggleFolder(currentPath)}>
                                        <div className={classes.nodeContent}>
                                            <IconChevronRight
                                                size={14}
                                                style={{ 
                                                    marginRight: 4, 
                                                    transform: isExpanded ? 'rotate(90deg)' : 'none',
                                                    transition: 'transform 200ms ease'
                                                }} 
                                            />
                                            {isExpanded ? <IconFolderOpen size={14} style={{ marginRight: 8, color: '#dcb67a' }} /> : <IconFolder size={14} style={{ marginRight: 8, color: '#dcb67a' }} />}
                                            <Text size="sm" fw={500}>{folderLabel}</Text>
                                        </div>
                                        <div className={classes.actions}>
                                            {folderId && renderActions && renderActions({ 
                                                id: folderId, 
                                                path: currentPath, 
                                                label: folderLabel, 
                                                isFolder: true,
                                                data: folderNode.__data 
                                            })}
                                        </div>
                                    </div>
                                    <Collapse in={isExpanded}>
                                        <div style={{ paddingLeft: 12 }}>
                                            {renderTree(node[folderKey], currentPath)}
                                        </div>
                                    </Collapse>
                                </div>
                            );
                        })}

                        {items.map((item: TreeItem, index: number) => (
                            <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={!onDrop}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{ 
                                            ...provided.draggableProps.style,
                                            opacity: snapshot.isDragging ? 0.5 : 1
                                        }}
                                    >
                                        <div 
                                            className={classes.node} 
                                            data-active={activeId === item.id || undefined} 
                                            onClick={() => onSelect?.(item.id)}
                                        >
                                            <div className={classes.nodeContent}>
                                                <span style={{ width: 18, display: 'inline-block', flexShrink: 0 }} />
                                                {item.icon || <IconFileText size={14} style={{ marginRight: 8 }} />}
                                                {renderLabel ? renderLabel(item) : <Text size="sm" truncate>{item.label}</Text>}
                                            </div>
                                            <div className={classes.actions}>
                                                {renderActions ? renderActions(item) : (
                                                    onDelete && (
                                                        <ActionIcon 
                                                            size="xs" 
                                                            variant="subtle" 
                                                            color="red" 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if(confirm('Delete ' + item.label + '?')) onDelete(item.id);
                                                            }}
                                                        >
                                                            <IconTrash size={12} />
                                                        </ActionIcon>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                        {path === '' && snapshot.isDraggingOver && (
                            <div style={{ 
                                position: 'absolute', 
                                bottom: 0, 
                                left: 0, 
                                right: 0, 
                                height: 40, 
                                border: '2px dashed var(--mantine-color-dimmed)', 
                                borderRadius: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--mantine-color-dimmed)',
                                fontSize: 12,
                                pointerEvents: 'none'
                            }}>
                                拖放到此处移动到根目录
                            </div>
                        )}
                    </div>
                )}
            </Droppable>
        );
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className={classes.tree}>
                {renderTree(treeData)}
            </div>
        </DragDropContext>
    );
}
