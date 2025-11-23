import { Paper, Tabs, Text } from '@mantine/core';
import { useProjectStore } from '../../../store/useProjectStore';
import { parseYaml, toYaml } from '../../../utils/yaml-utils';
import { IconSettings, IconCheckbox } from '@tabler/icons-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DropResult } from '@hello-pangea/dnd';

import { QuestSettings } from './QuestSettings';
import { QuestTaskList } from './QuestTaskList';
import { QuestDetail } from './QuestDetail';
import { AnimatedTabs } from '../../ui';

export default function QuestForm({ fileId }: { fileId: string }) {
  // 只订阅需要的数据
  const file = useProjectStore((state) => state.questFiles[fileId]);
  const updateFileContent = useProjectStore((state) => state.updateFileContent);

  // 缓存 YAML 解析结果,避免每次渲染都重新解析
  const parsedData = useMemo(() => {
    return parseYaml(file.content) || {};
  }, [file.content]);

  const questId = useMemo(() => Object.keys(parsedData)[0] || 'new_quest', [parsedData]);
  const questData = useMemo(() => parsedData[questId] || { meta: {}, task: {} }, [parsedData, questId]);
  
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const isResizing = useRef(false);

  const startResizing = useCallback(() => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    // Calculate new width based on mouse position
    // Assuming sidebar is on the left, so width is roughly e.clientX - sidebarOffset
    // But since we are in a complex layout, we might need to be more careful.
    // However, for a simple left sidebar, e.clientX is often close enough if the sidebar starts at 0.
    // But here the sidebar is inside tabs inside a paper.
    // A safer way is to use movementX, but that accumulates errors.
    // Let's try to just update based on movement for now or use a ref to the container.
    
    setSidebarWidth(prev => {
        const newWidth = prev + e.movementX;
        return Math.max(150, Math.min(600, newWidth));
    });
  }, []);

  // Auto-select first task if available and none selected
  useEffect(() => {
    const taskIds = Object.keys(questData.task || {});
    if (taskIds.length > 0 && !activeTaskId) {
        setActiveTaskId(taskIds[0]);
    }
  }, [questData.task]);

  const handleUpdate = (newData: any, newId?: string) => {
    const idToUse = newId || questId;
    const newYaml = toYaml({ [idToUse]: newData });
    updateFileContent(fileId, 'quest', newYaml);
  };

  const handleTaskUpdate = (taskId: string, taskData: any) => {
    const newTasks = { ...questData.task, [taskId]: taskData };
    handleUpdate({ ...questData, task: newTasks });
  };

  const handleTaskRename = (oldId: string, newId: string) => {
    if (oldId === newId) return;
    if (!newId.trim()) return;
    
    const currentTasks = questData.task || {};
    if (currentTasks[newId]) {
        return;
    }

    const newTasks: any = {};
    Object.keys(currentTasks).forEach(key => {
        if (key === oldId) {
            newTasks[newId] = currentTasks[oldId];
        } else {
            newTasks[key] = currentTasks[key];
        }
    });

    handleUpdate({ ...questData, task: newTasks });
    setActiveTaskId(newId);
  };

  const addTask = () => {
    const currentTasks = questData.task || {};
    let nextIndex = Object.keys(currentTasks).length + 1;
    let nextId = `task_${nextIndex}`;
    while (currentTasks[nextId]) {
        nextIndex++;
        nextId = `task_${nextIndex}`;
    }

    const newTasks = { 
        ...currentTasks, 
        [nextId]: { objective: 'block break', condition: {}, goal: { amount: 1 } } 
    };
    handleUpdate({ ...questData, task: newTasks });
    setActiveTaskId(nextId);
  };

  const duplicateTask = (taskId: string) => {
    const currentTasks = questData.task || {};
    let nextIndex = Object.keys(currentTasks).length + 1;
    let nextId = `${taskId}_copy`;
    while (currentTasks[nextId]) {
        nextIndex++;
        nextId = `${taskId}_copy_${nextIndex}`;
    }

    const newTasks = { 
        ...currentTasks, 
        [nextId]: JSON.parse(JSON.stringify(currentTasks[taskId])) 
    };
    handleUpdate({ ...questData, task: newTasks });
    setActiveTaskId(nextId);
  };

  const deleteTask = (taskId: string) => {
    const newTasks = { ...questData.task };
    delete newTasks[taskId];
    handleUpdate({ ...questData, task: newTasks });
    if (activeTaskId === taskId) {
        setActiveTaskId(null);
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const currentTasks = questData.task || {};
    const keys = Object.keys(currentTasks);
    const [reorderedKey] = keys.splice(result.source.index, 1);
    keys.splice(result.destination.index, 0, reorderedKey);
    
    const newTasks: any = {};
    keys.forEach(key => {
        newTasks[key] = currentTasks[key];
    });
    
    handleUpdate({ ...questData, task: newTasks });
  };

  const activeTask = activeTaskId && questData.task ? questData.task[activeTaskId] : null;

  return (
    <Paper radius={0} h="100%" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--mantine-color-dark-8)' }}>
      <AnimatedTabs
        defaultValue="meta"
        h="100%"
        display="flex"
        style={{ flexDirection: 'column' }}
        tabs={[
            { value: 'meta', label: '全局设置', icon: <IconSettings size={14} /> },
            { value: 'tasks', label: '任务流程', icon: <IconCheckbox size={14} /> }
        ]}
      >
        <Tabs.Panel value="meta" style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
            <QuestSettings 
                fileId={fileId}
                questId={questId} 
                questData={questData} 
                onUpdate={handleUpdate} 
            />
        </Tabs.Panel>

        <Tabs.Panel value="tasks" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <div style={{ display: 'flex', height: '100%' }}>
                <QuestTaskList
                    tasks={questData.task || {}}
                    activeTaskId={activeTaskId}
                    onSelect={setActiveTaskId}
                    onAdd={addTask}
                    onDelete={deleteTask}
                    onDuplicate={duplicateTask}
                    onRename={handleTaskRename}
                    onReorder={onDragEnd}
                    width={sidebarWidth}
                />
                <div
                    onMouseDown={startResizing}
                    style={{
                        width: 4,
                        cursor: 'col-resize',
                        backgroundColor: 'var(--mantine-color-dark-6)',
                        transition: 'background-color 0.2s',
                    }}
                    className="resize-handle"
                />
            </div>

            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {activeTask ? (
                    <QuestDetail
                        taskId={activeTaskId!}
                        taskData={activeTask}
                        onUpdate={(newData) => handleTaskUpdate(activeTaskId!, newData)}
                    />
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Text c="dimmed">请选择一个条目进行编辑，或创建一个新条目。</Text>
                    </div>
                )}
            </div>
        </Tabs.Panel>
      </AnimatedTabs>
    </Paper>
  );
}
