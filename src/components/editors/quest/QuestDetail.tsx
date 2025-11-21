import { Tabs, Box, ScrollArea, Stack, Text, Title, SimpleGrid, Badge, Group } from '@mantine/core';
import { IconTarget, IconPuzzle, IconScript } from '@tabler/icons-react';
import { DynamicSection } from './dynamic/DynamicSection';
import { FormSelect, FormSection, AnimatedTabs } from '../../ui';
import { AgentEditor } from './AgentEditor';
import { useApiStore } from '../../../store/useApiStore';
import { UIAddon } from './addons/UIAddon';
import { TrackAddon } from './addons/TrackAddon';
import { StatsAddon } from './addons/StatsAddon';
import { RestartAddon } from './addons/RestartAddon';
import { TimeoutAddon } from './addons/TimeoutAddon';
import { ResetDataAddon } from './addons/ResetDataAddon';
import { OptionalAddon } from './addons/OptionalAddon';
import { DependAddon } from './addons/DependAddon';
import { PartyAddon } from './addons/PartyAddon';
import { AutomationAddon } from './addons/AutomationAddon';
import { DynamicComponentRenderer } from './dynamic/DynamicComponentRenderer';

interface QuestDetailProps {
    taskId: string;
    taskData: any;
    onUpdate: (newData: any) => void;
}

export function QuestDetail({ taskData, onUpdate }: QuestDetailProps) {
    const { apiData } = useApiStore();

    const taskAddonComponents = apiData.taskAddonComponents || [];

    // Prepare options for Select with groups (兼容新旧结构)
    const objectives = apiData.objectives || (apiData as any); // 兼容旧的扁平结构
    const objectiveOptions = Object.entries(objectives)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([group, objectives]) => ({
            group,
            items: Object.keys(objectives as any)
                .sort((a, b) => a.localeCompare(b))
                .map(name => ({ value: name, label: name }))
        }));

    // Find current definition
    let currentDefinition = null;
    if (taskData.objective) {
        for (const group in objectives) {
            const groupObjectives = (objectives as any)[group];
            if (groupObjectives && groupObjectives[taskData.objective]) {
                currentDefinition = groupObjectives[taskData.objective];
                break;
            }
        }
    }

    return (
        <AnimatedTabs
            defaultValue="objective"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            tabs={[
                { value: 'objective', label: '目标配置', icon: <IconTarget size={14} /> },
                { value: 'addons', label: '组件', icon: <IconPuzzle size={14} /> },
                { value: 'agent', label: '脚本代理', icon: <IconScript size={14} /> }
            ]}
        >
            <ScrollArea style={{ flex: 1 }}>
                <Box p="md">
                    <Tabs.Panel value="objective" className="animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <Stack gap="md">
                            <FormSection>
                                <Title order={5} mb="sm">目标类型</Title>
                                <FormSelect
                                    data={objectiveOptions}
                                    value={taskData.objective}
                                    onChange={(val) => onUpdate({ ...taskData, objective: val, condition: {}, goal: {} })}
                                    searchable
                                />
                            </FormSection>
                            
                            {currentDefinition ? (
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="md">
                                    <FormSection>
                                        <Group mb="sm" gap="xs">
                                            <Title order={5}>条件配置</Title>
                                            <Badge variant="light" color="gray">Conditions</Badge>
                                        </Group>
                                        {currentDefinition.condition.length > 0 ? (
                                            <DynamicSection
                                                fields={currentDefinition.condition}
                                                data={taskData.condition || {}}
                                                onChange={(newCondition) => onUpdate({ ...taskData, condition: newCondition })}
                                            />
                                        ) : (
                                            <Text c="dimmed" size="sm">此目标类型没有可配置的条件。</Text>
                                        )}
                                    </FormSection>
                                    <FormSection>
                                        <Group mb="sm" gap="xs">
                                            <Title order={5}>目标配置</Title>
                                            <Badge variant="light" color="gray">Goals</Badge>
                                        </Group>
                                        {currentDefinition.goal.length > 0 ? (
                                            <DynamicSection
                                                fields={currentDefinition.goal}
                                                data={taskData.goal || {}}
                                                onChange={(newGoal) => onUpdate({ ...taskData, goal: newGoal })}
                                            />
                                        ) : (
                                            <Text c="dimmed" size="sm">此目标类型没有可配置的目标。</Text>
                                        )}
                                    </FormSection>
                                </SimpleGrid>
                            ) : (
                                <Text c="dimmed" ta="center" py="xl">请选择一个目标类型以配置详情。</Text>
                            )}
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="addons" className="animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <Stack gap="md">
                            <UIAddon
                                addon={taskData.addon}
                                onChange={(newAddon) => onUpdate({ ...taskData, addon: newAddon })}
                            />

                            <TrackAddon
                                addon={taskData.addon}
                                onChange={(newAddon) => onUpdate({ ...taskData, addon: newAddon })}
                                type="task"
                            />

                            <StatsAddon
                                addon={taskData.addon}
                                onChange={(newAddon) => onUpdate({ ...taskData, addon: newAddon })}
                            />

                            <RestartAddon
                                addon={taskData.addon}
                                onChange={(newAddon) => onUpdate({ ...taskData, addon: newAddon })}
                            />

                            <TimeoutAddon
                                addon={taskData.addon}
                                onChange={(newAddon) => onUpdate({ ...taskData, addon: newAddon })}
                            />

                            <ResetDataAddon
                                addon={taskData.addon}
                                onChange={(newAddon) => onUpdate({ ...taskData, addon: newAddon })}
                            />

                            <OptionalAddon
                                addon={taskData.addon}
                                onChange={(newAddon) => onUpdate({ ...taskData, addon: newAddon })}
                            />

                            <DependAddon
                                addon={taskData.addon}
                                onChange={(newAddon) => onUpdate({ ...taskData, addon: newAddon })}
                            />

                            <PartyAddon
                                addon={taskData.addon}
                                onChange={(newAddon) => onUpdate({ ...taskData, addon: newAddon })}
                            />

                            <AutomationAddon
                                addon={taskData.addon}
                                onChange={(newAddon) => onUpdate({ ...taskData, addon: newAddon })}
                            />

                            {taskAddonComponents.map(component => (
                                <DynamicComponentRenderer
                                    key={component.id}
                                    component={component}
                                    data={taskData.addon || {}}
                                    onChange={(newAddon) => onUpdate({ ...taskData, addon: newAddon })}
                                />
                            ))}
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="agent" className="animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <Stack gap="md">
                            <AgentEditor 
                                data={taskData.agent} 
                                onUpdate={(newAgent) => onUpdate({ ...taskData, agent: newAgent })}
                                types={['task_continued', 'task_restarted', 'task_completed']}
                            />
                        </Stack>
                    </Tabs.Panel>
                </Box>
            </ScrollArea>
        </AnimatedTabs>
    );
}

