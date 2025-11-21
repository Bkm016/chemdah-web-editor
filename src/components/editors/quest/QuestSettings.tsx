import { Tabs, ScrollArea, Box, Stack, Title } from '@mantine/core';
import { IconInfoCircle, IconAdjustments, IconScript, IconPuzzle } from '@tabler/icons-react';
import { useMemo } from 'react';
import { FormInput, FormCheckbox, FormSection, FormTagsInput } from '../../ui';
import { useProjectStore } from '../../../store/useProjectStore';
import { useApiStore } from '../../../store/useApiStore';
import { parseYaml } from '../../../utils/yaml-utils';
import { AgentEditor } from './AgentEditor';
import { UIAddon } from './addons/UIAddon';
import { TrackAddon } from './addons/TrackAddon';
import { PartyAddon } from './addons/PartyAddon';
import { AutomationAddon } from './addons/AutomationAddon';
import { DynamicComponentRenderer } from './dynamic/DynamicComponentRenderer';

interface QuestSettingsProps {
    fileId?: string;
    questId: string;
    questData: any;
    onUpdate: (newData: any, newId?: string) => void;
}

export function QuestSettings({ fileId, questId, questData, onUpdate }: QuestSettingsProps) {
    const questFiles = useProjectStore((state) => state.questFiles);
    const { apiData } = useApiStore();

    const questMetaComponents = apiData.questMetaComponents || [];

    const allTypes = useMemo(() => {
        const types = new Set<string>([]);
        Object.values(questFiles).forEach(file => {
            try {
                const data = parseYaml(file.content);
                if (data && typeof data === 'object') {
                    Object.entries(data).forEach(([key, quest]: [string, any]) => {
                        if (key === '__option__') return;
                        if (quest?.meta?.type) {
                            if (Array.isArray(quest.meta.type)) {
                                quest.meta.type.forEach((t: string) => types.add(String(t)));
                            } else {
                                types.add(String(quest.meta.type));
                            }
                        }
                    });
                }
            } catch (e) {
                // ignore
            }
        });
        return Array.from(types).sort();
    }, [questFiles]);

    const idError = useMemo(() => {
        if (!fileId) return null;
        let error = null;
        Object.values(questFiles).forEach(file => {
            if (file.id === fileId) return;
            try {
                const data = parseYaml(file.content);
                if (data && typeof data === 'object') {
                    if (Object.keys(data).includes(questId)) {
                        error = `ID '${questId}' 已存在于文件 '${file.name}' 中`;
                    }
                }
            } catch (e) {}
        });
        return error;
    }, [questFiles, fileId, questId]);

    return (
        <Tabs defaultValue="basic" orientation="vertical" variant="pills" style={{ flex: 1, display: 'flex', height: '100%' }}>
            <Tabs.List w={220} bg="var(--mantine-color-dark-7)" p="xs" style={{ borderRight: '1px solid var(--mantine-color-dark-6)' }}>
                <Tabs.Tab value="basic" leftSection={<IconInfoCircle size={14} />} className="hover:bg-white/5 transition-colors">基本信息</Tabs.Tab>
                <Tabs.Tab value="options" leftSection={<IconAdjustments size={14} />} className="hover:bg-white/5 transition-colors">高级选项</Tabs.Tab>
                <Tabs.Tab value="addons" leftSection={<IconPuzzle size={14} />} className="hover:bg-white/5 transition-colors">组件配置</Tabs.Tab>
                <Tabs.Tab value="agent" leftSection={<IconScript size={14} />} className="hover:bg-white/5 transition-colors">脚本代理</Tabs.Tab>
            </Tabs.List>

            <ScrollArea style={{ flex: 1 }}>
                <Box p="xl">
                    <Tabs.Panel value="basic">
                        <Stack gap="md">
                            <Title order={4}>基本信息</Title>
                            <FormSection>
                                <FormInput
                                    label="任务 ID"
                                    description="任务的唯一标识符"
                                    value={questId}
                                    onChange={(e) => onUpdate(questData, e.target.value)}
                                    error={idError}
                                />
                                <FormInput
                                    label="显示名称"
                                    description="显示给玩家的任务名称"
                                    value={questData.meta?.name || ''}
                                    onChange={(e) => onUpdate({ ...questData, meta: { ...questData.meta, name: e.target.value } })}
                                />
                                <FormTagsInput
                                    label="类型"
                                    description="用于分类和筛选的标签，可动态创建"
                                    data={allTypes}
                                    value={Array.isArray(questData.meta?.type) ? questData.meta.type : (questData.meta?.type ? [String(questData.meta.type)] : [])}
                                    onChange={(val) => onUpdate({ ...questData, meta: { ...questData.meta, type: val } })}
                                />
                            </FormSection>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="options">
                        <Stack gap="md">
                            <Title order={4}>高级选项</Title>
                            <FormSection>
                                <FormCheckbox
                                    label="数据隔离 (Data Isolation)"
                                    description="该任务将单独建表，以分担主表压力"
                                    checked={questData['data-isolation'] || false}
                                    onChange={(e) => onUpdate({ 
                                        ...questData, 
                                        'data-isolation': e.currentTarget.checked 
                                    })}
                                />
                                <FormCheckbox
                                    label="记录完成时间 (Record Completed)"
                                    description="是否记录任务（含条目）完成时间（默认启用）"
                                    checked={questData['record-completed'] !== false}
                                    onChange={(e) => onUpdate({ 
                                        ...questData, 
                                        'record-completed': e.currentTarget.checked 
                                    })}
                                />
                            </FormSection>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="addons">
                        <Stack gap="md">
                            <Title order={4}>组件配置</Title>

                            <UIAddon
                                addon={questData.addon}
                                onChange={(newAddon) => onUpdate({ ...questData, addon: newAddon })}
                            />

                            <TrackAddon
                                addon={questData.addon}
                                onChange={(newAddon) => onUpdate({ ...questData, addon: newAddon })}
                                type="quest"
                            />

                            <PartyAddon
                                addon={questData.addon}
                                onChange={(newAddon) => onUpdate({ ...questData, addon: newAddon })}
                            />

                            <AutomationAddon
                                addon={questData.addon}
                                onChange={(newAddon) => onUpdate({ ...questData, addon: newAddon })}
                            />

                            {questMetaComponents.map(component => (
                                <DynamicComponentRenderer
                                    key={component.id}
                                    component={component}
                                    data={questData.meta || {}}
                                    onChange={(newMeta) => onUpdate({ ...questData, meta: newMeta })}
                                />
                            ))}
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="agent">
                        <Stack gap="md">
                            <Title order={4}>脚本代理</Title>
                            <AgentEditor 
                                data={questData.agent} 
                                onUpdate={(newAgent) => onUpdate({ ...questData, agent: newAgent })}
                                types={[
                                    'quest_accept', 
                                    'quest_accepted', 
                                    'quest_accept_cancelled',
                                    'quest_fail',
                                    'quest_failed',
                                    'quest_complete',
                                    'quest_completed',
                                    'quest_restart',
                                    'quest_restarted'
                                ]}
                            />
                        </Stack>
                    </Tabs.Panel>
                </Box>
            </ScrollArea>
        </Tabs>
    );
}
