import { Tabs, Box, ScrollArea, Stack, Text, Title, SimpleGrid, Badge, Group } from '@mantine/core';
import { IconTarget, IconPuzzle, IconScript, IconAdjustments } from '@tabler/icons-react';
import { DynamicSection } from './dynamic/DynamicSection';
import { FormSection, AnimatedTabs } from '@/components/ui';
import { AgentEditor } from './AgentEditor';
import { useApiStore } from '@/store/useApiStore';
import { ApiSearchSelect, parseApiValue } from '@/components/common/ApiSearchSelect';
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
import { MetaAddonList } from './meta/MetaAddonList';

interface QuestDetailProps {
    taskId: string;
    taskData: any;
    onUpdate: (newData: any) => void;
}

export function QuestDetail({ taskData, onUpdate }: QuestDetailProps) {
    const { apiData, getObjective, recordUsage } = useApiStore();

    // 从 taskData.objective 中提取 plugin 和 id
    // 如果是旧格式（只有 id），尝试在所有 plugin 中查找
    let currentObjectiveValue: string | undefined = undefined;
    let currentDefinition = null;

    if (taskData.objective) {
        // 检查是否是新格式 "plugin:id"
        const parsed = parseApiValue(taskData.objective);
        if (parsed) {
            // 新格式
            currentObjectiveValue = taskData.objective;
            currentDefinition = getObjective(parsed.plugin, parsed.id);
        } else {
            // 旧格式，只有 id，尝试在所有 plugin 中查找
            for (const [pluginName, pluginApi] of Object.entries(apiData)) {
                if (pluginApi.objective && pluginApi.objective[taskData.objective]) {
                    currentObjectiveValue = `${pluginName}:${taskData.objective}`;
                    currentDefinition = pluginApi.objective[taskData.objective];
                    break;
                }
            }
        }
    }

    // 将 params 信息合并到 condition 和 goal 字段中
    const enrichFieldsWithParams = (fields: any[], params?: any[]) => {
        if (!params || params.length === 0) return fields;

        return fields.map(field => {
            const param = params.find(p => p.name === field.name);
            if (param && param.description) {
                return {
                    ...field,
                    description: param.description
                };
            }
            return field;
        });
    };

    const enrichedCondition = currentDefinition
        ? enrichFieldsWithParams(currentDefinition.condition, currentDefinition.params)
        : [];

    const enrichedGoal = currentDefinition
        ? enrichFieldsWithParams(currentDefinition.goal, currentDefinition.params)
        : [];

    return (
        <AnimatedTabs
            defaultValue="objective"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            tabs={[
                { value: 'objective', label: '目标配置', icon: <IconTarget size={14} /> },
                { value: 'addons', label: '组件配置', icon: <IconPuzzle size={14} /> },
                { value: 'agent', label: '脚本代理', icon: <IconScript size={14} /> },
                { value: 'meta', label: '元数据配置', icon: <IconAdjustments size={14} /> }
            ]}
        >
            <ScrollArea style={{ flex: 1 }}>
                <Box p="md">
                    <Tabs.Panel value="objective" className="animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <Stack gap="md">
                            <FormSection>
                                <Title order={5} mb="sm">目标类型</Title>
                                <ApiSearchSelect
                                    type="objective"
                                    value={currentObjectiveValue}
                                    onChange={(value, item) => {
                                        if (value && item) {
                                            // 记录使用频率
                                            recordUsage(item.plugin, item.id, 'objective');

                                            // 使用 id 作为 objective 值
                                            const objectiveId = item.id;
                                            onUpdate({
                                                ...taskData,
                                                objective: objectiveId,
                                                condition: {},
                                                goal: {}
                                            });
                                        } else {
                                            onUpdate({ ...taskData, objective: undefined, condition: {}, goal: {} });
                                        }
                                    }}
                                    placeholder="搜索任务目标..."
                                />
                            </FormSection>
                            
                            {currentDefinition ? (
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="md">
                                    <FormSection>
                                        <Group mb="sm" gap="xs">
                                            <Title order={5}>条件配置</Title>
                                            <Badge variant="light" color="gray">Conditions</Badge>
                                        </Group>
                                        {enrichedCondition.length > 0 ? (
                                            <DynamicSection
                                                fields={enrichedCondition}
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
                                        {enrichedGoal.length > 0 ? (
                                            <DynamicSection
                                                fields={enrichedGoal}
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
                            <Title order={5}>组件配置</Title>

                            {/* Task 内置 Addon 组件（编程式） */}
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

                            {/* 其他 Task Addon 组件（JSON 动态生成，排除已有专门组件的） */}
                            <MetaAddonList
                                type="addon"
                                scope="task"
                                data={taskData.addon || {}}
                                onChange={(newAddon) => onUpdate({ ...taskData, addon: newAddon })}
                                excludeIds={['ui', 'track', 'stats', 'restart', 'timeout', 'reset-data-on-accepted', 'optional', 'depend', 'party', 'automation']}
                            />
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="agent" className="animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <Stack gap="md">
                            <Title order={5}>脚本代理</Title>
                            <AgentEditor
                                data={taskData.agent}
                                onUpdate={(newAgent) => onUpdate({ ...taskData, agent: newAgent })}
                                types={['task_continued', 'task_restarted', 'task_completed']}
                            />
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="meta" className="animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <Stack gap="md">
                            <Title order={5}>元数据配置</Title>

                            {/* Task Meta 组件列表 */}
                            <MetaAddonList
                                type="meta"
                                scope="task"
                                data={taskData.meta || {}}
                                onChange={(newMeta) => onUpdate({ ...taskData, meta: newMeta })}
                            />
                        </Stack>
                    </Tabs.Panel>
                </Box>
            </ScrollArea>
        </AnimatedTabs>
    );
}

