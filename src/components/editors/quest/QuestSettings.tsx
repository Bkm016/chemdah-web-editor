import { Tabs, ScrollArea, Box, Stack, Title } from '@mantine/core';
import { IconInfoCircle, IconAdjustments, IconScript, IconPuzzle } from '@tabler/icons-react';
import { FormInput, FormSelect, FormCheckbox, FormTextarea, FormSection, FormAddon } from '../../ui';
import { AgentEditor } from './AgentEditor';

interface QuestSettingsProps {
    questId: string;
    questData: any;
    onUpdate: (newData: any, newId?: string) => void;
}

export function QuestSettings({ questId, questData, onUpdate }: QuestSettingsProps) {
    return (
        <Tabs defaultValue="basic" orientation="vertical" variant="pills" style={{ flex: 1, display: 'flex', height: '100%' }}>
            <Tabs.List w={220} bg="var(--mantine-color-dark-7)" p="xs" style={{ borderRight: '1px solid var(--mantine-color-dark-6)' }}>
                <Tabs.Tab value="basic" leftSection={<IconInfoCircle size={14} />}>基本信息</Tabs.Tab>
                <Tabs.Tab value="options" leftSection={<IconAdjustments size={14} />}>高级选项</Tabs.Tab>
                <Tabs.Tab value="addons" leftSection={<IconPuzzle size={14} />}>组件配置</Tabs.Tab>
                <Tabs.Tab value="agent" leftSection={<IconScript size={14} />}>脚本代理</Tabs.Tab>
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
                                />
                                <FormInput
                                    label="显示名称"
                                    description="显示给玩家的任务名称"
                                    value={questData.meta?.name || ''}
                                    onChange={(e) => onUpdate({ ...questData, meta: { ...questData.meta, name: e.target.value } })}
                                />
                                <FormSelect
                                    label="类型"
                                    description="任务的刷新频率或分类"
                                    data={['L1', 'L2', 'L3', 'Daily', 'Weekly']}
                                    value={questData.meta?.type || 'L1'}
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
                                    checked={questData.__option__?.['data-isolation'] || false}
                                    onChange={(e) => onUpdate({ 
                                        ...questData, 
                                        __option__: { ...questData.__option__, 'data-isolation': e.currentTarget.checked } 
                                    })}
                                />
                                <FormCheckbox
                                    label="记录完成时间 (Record Completed)"
                                    description="是否记录任务（含条目）完成时间（默认启用）"
                                    checked={questData.__option__?.['record-completed'] !== false}
                                    onChange={(e) => onUpdate({ 
                                        ...questData, 
                                        __option__: { ...questData.__option__, 'record-completed': e.currentTarget.checked } 
                                    })}
                                />
                            </FormSection>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="addons">
                        <Stack gap="md">
                            <Title order={4}>组件配置</Title>
                            
                            {/* UI Addon */}
                            <FormAddon
                                label="界面 (UI)"
                                description="任务显示图标、描述等"
                                checked={!!questData.addon?.ui}
                                onChange={(checked) => {
                                    if (checked) {
                                        onUpdate({ ...questData, addon: { ...questData.addon, ui: { visible: { start: false, complete: true } } } });
                                    } else {
                                        const { ui, ...rest } = questData.addon || {};
                                        onUpdate({ ...questData, addon: rest });
                                    }
                                }}
                            >
                                <FormInput
                                    label="图标 (Icon)"
                                    value={questData.addon?.ui?.icon || ''}
                                    onChange={(e) => onUpdate({
                                        ...questData,
                                        addon: { ...questData.addon, ui: { ...questData.addon?.ui, icon: e.target.value } }
                                    })}
                                />
                                <FormTextarea
                                    label="描述 (Description)"
                                    value={Array.isArray(questData.addon?.ui?.description) ? questData.addon.ui.description.join('\n') : (questData.addon?.ui?.description || '')}
                                    onChange={(e) => onUpdate({
                                        ...questData,
                                        addon: { ...questData.addon, ui: { ...questData.addon?.ui, description: e.target.value.split('\n') } }
                                    })}
                                />
                                <FormCheckbox
                                    label="开始时可见 (Visible Start)"
                                    checked={questData.addon?.ui?.visible?.start || false}
                                    onChange={(e) => onUpdate({
                                        ...questData,
                                        addon: { ...questData.addon, ui: { ...questData.addon?.ui, visible: { ...questData.addon?.ui?.visible, start: e.currentTarget.checked } } }
                                    })}
                                />
                                <FormCheckbox
                                    label="完成后可见 (Visible Complete)"
                                    checked={questData.addon?.ui?.visible?.complete ?? true}
                                    onChange={(e) => onUpdate({
                                        ...questData,
                                        addon: { ...questData.addon, ui: { ...questData.addon?.ui, visible: { ...questData.addon?.ui?.visible, complete: e.currentTarget.checked } } }
                                    })}
                                />
                            </FormAddon>

                            {/* Track Addon */}
                            <FormAddon
                                label="追踪 (Track)"
                                description="任务追踪设置"
                                checked={!!questData.addon?.track}
                                onChange={(checked) => {
                                    if (checked) {
                                        onUpdate({ ...questData, addon: { ...questData.addon, track: {} } });
                                    } else {
                                        const { track, ...rest } = questData.addon || {};
                                        onUpdate({ ...questData, addon: rest });
                                    }
                                }}
                            >
                                <FormCheckbox
                                    label="启用记分板追踪 (Scoreboard Track)"
                                    checked={questData.addon?.track?.scoreboard || false}
                                    onChange={(e) => onUpdate({ 
                                        ...questData, 
                                        addon: { ...questData.addon, track: { ...questData.addon?.track, scoreboard: e.currentTarget.checked } } 
                                    })}
                                />
                            </FormAddon>

                            {/* Party Addon */}
                            <FormAddon
                                label="组队 (Party)"
                                description="组队共享设置"
                                checked={!!questData.addon?.party}
                                onChange={(checked) => {
                                    if (checked) {
                                        onUpdate({ ...questData, addon: { ...questData.addon, party: {} } });
                                    } else {
                                        const { party, ...rest } = questData.addon || {};
                                        onUpdate({ ...questData, addon: rest });
                                    }
                                }}
                            >
                                <FormCheckbox
                                    label="共享任务 (Share)"
                                    checked={questData.addon?.party?.share || false}
                                    onChange={(e) => onUpdate({
                                        ...questData,
                                        addon: { ...questData.addon, party: { ...questData.addon?.party, share: e.currentTarget.checked } }
                                    })}
                                />
                                <FormCheckbox
                                    label="仅队长共享 (Share Only Leader)"
                                    checked={questData.addon?.party?.['share-only-leader'] || false}
                                    onChange={(e) => onUpdate({
                                        ...questData,
                                        addon: { ...questData.addon, party: { ...questData.addon?.party, 'share-only-leader': e.currentTarget.checked } }
                                    })}
                                />
                                <FormCheckbox
                                    label="允许协助 (Continue)"
                                    checked={questData.addon?.party?.continue || false}
                                    onChange={(e) => onUpdate({
                                        ...questData,
                                        addon: { ...questData.addon, party: { ...questData.addon?.party, continue: e.currentTarget.checked } }
                                    })}
                                />
                                <FormInput
                                    label="最少人数 (Require Members)"
                                    type="number"
                                    value={questData.addon?.party?.['require-members'] || ''}
                                    onChange={(e) => onUpdate({
                                        ...questData,
                                        addon: { ...questData.addon, party: { ...questData.addon?.party, 'require-members': parseInt(e.target.value) || 0 } }
                                    })}
                                />
                            </FormAddon>

                            {/* Automation Addon */}
                            <FormAddon
                                label="自动化 (Automation)"
                                description="自动接受与计划任务"
                                checked={!!questData.addon?.automation}
                                onChange={(checked) => {
                                    if (checked) {
                                        onUpdate({ ...questData, addon: { ...questData.addon, automation: {} } });
                                    } else {
                                        const { automation, ...rest } = questData.addon || {};
                                        onUpdate({ ...questData, addon: rest });
                                    }
                                }}
                            >
                                <FormCheckbox
                                    label="自动接受 (Auto Accept)"
                                    checked={questData.addon?.automation?.['auto-accept'] || false}
                                    onChange={(e) => onUpdate({
                                        ...questData,
                                        addon: { ...questData.addon, automation: { ...questData.addon?.automation, 'auto-accept': e.currentTarget.checked } }
                                    })}
                                />
                            </FormAddon>
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
