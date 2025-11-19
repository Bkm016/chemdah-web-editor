import { Tabs, Box, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { IconTarget, IconPuzzle, IconScript } from '@tabler/icons-react';
import { ObjectiveRegistry } from '../../../registry/quest-objectives';
import { FormSelect, FormCheckbox, FormInput, FormTextarea, FormSection, FormAddon, FormScript } from '../../ui';
import { AgentEditor } from './AgentEditor';

interface QuestDetailProps {
    taskId: string;
    taskData: any;
    onUpdate: (newData: any) => void;
}

export function QuestDetail({ taskId, taskData, onUpdate }: QuestDetailProps) {
    return (
        <Tabs defaultValue="objective" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box p="md" pb="xs" style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}>
                <Tabs.List>
                    <Tabs.Tab value="objective" leftSection={<IconTarget size={14} />}>目标配置</Tabs.Tab>
                    <Tabs.Tab value="addons" leftSection={<IconPuzzle size={14} />}>组件</Tabs.Tab>
                    <Tabs.Tab value="agent" leftSection={<IconScript size={14} />}>脚本代理</Tabs.Tab>
                </Tabs.List>
            </Box>
            
            <ScrollArea style={{ flex: 1 }}>
                <Box p="md">
                    <Tabs.Panel value="objective">
                        <Stack gap="md">
                            <FormSection>
                                <Title order={5} mb="sm">目标类型</Title>
                                <FormSelect
                                    data={Object.keys(ObjectiveRegistry)}
                                    value={taskData.objective}
                                    onChange={(val) => onUpdate({ ...taskData, objective: val })}
                                />
                            </FormSection>
                            
                            {ObjectiveRegistry[taskData.objective] ? (
                                <FormSection>
                                    <Title order={5} mb="sm">目标详情</Title>
                                    {(() => {
                                        const ObjectiveComponent = ObjectiveRegistry[taskData.objective];
                                        return (
                                            <ObjectiveComponent 
                                                data={taskData} 
                                                onChange={(newData) => onUpdate(newData)} 
                                            />
                                        );
                                    })()}
                                </FormSection>
                            ) : (
                                <Text c="dimmed" ta="center" py="xl">请选择一个目标类型以配置详情。</Text>
                            )}
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="addons">
                        <Stack gap="md">
                            {/* UI Addon */}
                            <FormAddon
                                label="界面 (UI)"
                                description="任务显示图标、描述等"
                                checked={!!taskData.addon?.ui}
                                onChange={(checked) => {
                                    if (checked) {
                                        onUpdate({ ...taskData, addon: { ...taskData.addon, ui: { visible: { start: false, complete: true } } } });
                                    } else {
                                        const { ui, ...rest } = taskData.addon || {};
                                        onUpdate({ ...taskData, addon: rest });
                                    }
                                }}
                            >
                                <FormInput
                                    label="图标 (Icon)"
                                    value={taskData.addon?.ui?.icon || ''}
                                    onChange={(e) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, ui: { ...taskData.addon?.ui, icon: e.target.value } }
                                    })}
                                />
                                <FormTextarea
                                    label="描述 (Description)"
                                    value={Array.isArray(taskData.addon?.ui?.description) ? taskData.addon.ui.description.join('\n') : (taskData.addon?.ui?.description || '')}
                                    onChange={(e) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, ui: { ...taskData.addon?.ui, description: e.target.value.split('\n') } }
                                    })}
                                />
                                <FormCheckbox
                                    label="开始时可见 (Visible Start)"
                                    checked={taskData.addon?.ui?.visible?.start || false}
                                    onChange={(e) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, ui: { ...taskData.addon?.ui, visible: { ...taskData.addon?.ui?.visible, start: e.currentTarget.checked } } }
                                    })}
                                />
                                <FormCheckbox
                                    label="完成后可见 (Visible Complete)"
                                    checked={taskData.addon?.ui?.visible?.complete ?? true}
                                    onChange={(e) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, ui: { ...taskData.addon?.ui, visible: { ...taskData.addon?.ui?.visible, complete: e.currentTarget.checked } } }
                                    })}
                                />
                            </FormAddon>

                            {/* Track Addon */}
                            <FormAddon
                                label="追踪 (Track)"
                                description="任务追踪设置"
                                checked={!!taskData.addon?.track}
                                onChange={(checked) => {
                                    if (checked) {
                                        onUpdate({ ...taskData, addon: { ...taskData.addon, track: {} } });
                                    } else {
                                        const { track, ...rest } = taskData.addon || {};
                                        onUpdate({ ...taskData, addon: rest });
                                    }
                                }}
                            >
                                <FormInput
                                    label="追踪名称 (Name)"
                                    value={taskData.addon?.track?.name || ''}
                                    onChange={(e) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, track: { ...taskData.addon?.track, name: e.target.value } }
                                    })}
                                />
                                <FormInput
                                    label="追踪中心 (Center)"
                                    placeholder="world 0 80 0"
                                    value={taskData.addon?.track?.center || ''}
                                    onChange={(e) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, track: { ...taskData.addon?.track, center: e.target.value } }
                                    })}
                                />
                                <FormTextarea
                                    label="追踪描述 (Description)"
                                    value={Array.isArray(taskData.addon?.track?.description) ? taskData.addon.track.description.join('\n') : (taskData.addon?.track?.description || '')}
                                    onChange={(e) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, track: { ...taskData.addon?.track, description: e.target.value.split('\n') } }
                                    })}
                                />
                                <FormCheckbox
                                    label="启用信标 (Beacon)"
                                    checked={taskData.addon?.track?.beacon || false}
                                    onChange={(e) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, track: { ...taskData.addon?.track, beacon: e.currentTarget.checked } }
                                    })}
                                />
                                <FormCheckbox
                                    label="启用导航 (Navigation)"
                                    checked={taskData.addon?.track?.navigation || false}
                                    onChange={(e) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, track: { ...taskData.addon?.track, navigation: e.currentTarget.checked } }
                                    })}
                                />
                            </FormAddon>

                            {/* Stats Addon */}
                            <FormAddon
                                label="统计 (Stats)"
                                description="任务统计信息"
                                checked={!!taskData.addon?.stats}
                                onChange={(checked) => {
                                    if (checked) {
                                        onUpdate({ ...taskData, addon: { ...taskData.addon, stats: { visible: true } } });
                                    } else {
                                        const { stats, ...rest } = taskData.addon || {};
                                        onUpdate({ ...taskData, addon: rest });
                                    }
                                }}
                            >
                                <FormCheckbox
                                    label="可见 (Visible)"
                                    checked={taskData.addon?.stats?.visible || false}
                                    onChange={(e) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, stats: { ...taskData.addon?.stats, visible: e.currentTarget.checked } }
                                    })}
                                />
                            </FormAddon>

                            {/* Restart Addon */}
                            <FormAddon
                                label="重启 (Restart)"
                                description="任务重启条件 (Kether)"
                                checked={!!taskData.addon?.restart}
                                onChange={(checked) => {
                                    if (checked) {
                                        onUpdate({ ...taskData, addon: { ...taskData.addon, restart: [] } });
                                    } else {
                                        const { restart, ...rest } = taskData.addon || {};
                                        onUpdate({ ...taskData, addon: rest });
                                    }
                                }}
                            >
                                <FormScript
                                    value={Array.isArray(taskData.addon?.restart) ? taskData.addon.restart.join('\n') : ''}
                                    onChange={(val) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, restart: (val || '').split('\n') }
                                    })}
                                />
                            </FormAddon>

                            {/* Timeout Addon */}
                            <FormAddon
                                label="超时 (Timeout)"
                                description="任务超时设置"
                                checked={!!taskData.addon?.timeout}
                                onChange={(checked) => {
                                    if (checked) {
                                        onUpdate({ ...taskData, addon: { ...taskData.addon, timeout: '' } });
                                    } else {
                                        const { timeout, ...rest } = taskData.addon || {};
                                        onUpdate({ ...taskData, addon: rest });
                                    }
                                }}
                            >
                                <FormInput
                                    label="超时时间"
                                    placeholder="1h30m 或 day 4 0"
                                    value={taskData.addon?.timeout || ''}
                                    onChange={(e) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, timeout: e.target.value }
                                    })}
                                />
                            </FormAddon>

                            {/* Reset Data Addon */}
                            <FormAddon
                                label="接受时重置数据"
                                description="Reset Data On Accepted"
                                checked={taskData.addon?.['reset-data-on-accepted'] === true}
                                onChange={(checked) => {
                                    if (checked) {
                                        onUpdate({ ...taskData, addon: { ...taskData.addon, 'reset-data-on-accepted': true } });
                                    } else {
                                        const { 'reset-data-on-accepted': _, ...rest } = taskData.addon || {};
                                        onUpdate({ ...taskData, addon: rest });
                                    }
                                }}
                            />

                            {/* Optional Addon */}
                            <FormAddon
                                label="可选任务 (Optional)"
                                description="是否为可选任务"
                                checked={taskData.addon?.optional === true}
                                onChange={(checked) => {
                                    if (checked) {
                                        onUpdate({ ...taskData, addon: { ...taskData.addon, optional: true } });
                                    } else {
                                        const { optional, ...rest } = taskData.addon || {};
                                        onUpdate({ ...taskData, addon: rest });
                                    }
                                }}
                            />

                            {/* Depend Addon */}
                            <FormAddon
                                label="依赖 (Depend)"
                                description="前置任务依赖"
                                checked={!!taskData.addon?.depend}
                                onChange={(checked) => {
                                    if (checked) {
                                        onUpdate({ ...taskData, addon: { ...taskData.addon, depend: [] } });
                                    } else {
                                        const { depend, ...rest } = taskData.addon || {};
                                        onUpdate({ ...taskData, addon: rest });
                                    }
                                }}
                            >
                                <FormTextarea
                                    label="依赖列表 (每行一个)"
                                    placeholder="quest_id 或 group:name"
                                    value={Array.isArray(taskData.addon?.depend) ? taskData.addon.depend.join('\n') : ''}
                                    onChange={(e) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, depend: e.target.value.split('\n') }
                                    })}
                                />
                            </FormAddon>

                            {/* Party Addon */}
                            <FormAddon
                                label="组队 (Party)"
                                description="组队共享设置"
                                checked={!!taskData.addon?.party}
                                onChange={(checked) => {
                                    if (checked) {
                                        onUpdate({ ...taskData, addon: { ...taskData.addon, party: {} } });
                                    } else {
                                        const { party, ...rest } = taskData.addon || {};
                                        onUpdate({ ...taskData, addon: rest });
                                    }
                                }}
                            >
                                <FormCheckbox
                                    label="共享任务 (Share)"
                                    checked={taskData.addon?.party?.share || false}
                                    onChange={(e) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, party: { ...taskData.addon?.party, share: e.currentTarget.checked } }
                                    })}
                                />
                                <FormCheckbox
                                    label="仅队长共享 (Share Only Leader)"
                                    checked={taskData.addon?.party?.['share-only-leader'] || false}
                                    onChange={(e) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, party: { ...taskData.addon?.party, 'share-only-leader': e.currentTarget.checked } }
                                    })}
                                />
                                <FormCheckbox
                                    label="允许协助 (Continue)"
                                    checked={taskData.addon?.party?.continue || false}
                                    onChange={(e) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, party: { ...taskData.addon?.party, continue: e.currentTarget.checked } }
                                    })}
                                />
                                <FormInput
                                    label="最少人数 (Require Members)"
                                    type="number"
                                    value={taskData.addon?.party?.['require-members'] || ''}
                                    onChange={(e) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, party: { ...taskData.addon?.party, 'require-members': parseInt(e.target.value) || 0 } }
                                    })}
                                />
                            </FormAddon>

                            {/* Automation Addon */}
                            <FormAddon
                                label="自动化 (Automation)"
                                description="自动接受与计划任务"
                                checked={!!taskData.addon?.automation}
                                onChange={(checked) => {
                                    if (checked) {
                                        onUpdate({ ...taskData, addon: { ...taskData.addon, automation: {} } });
                                    } else {
                                        const { automation, ...rest } = taskData.addon || {};
                                        onUpdate({ ...taskData, addon: rest });
                                    }
                                }}
                            >
                                <FormCheckbox
                                    label="自动接受 (Auto Accept)"
                                    checked={taskData.addon?.automation?.['auto-accept'] || false}
                                    onChange={(e) => onUpdate({
                                        ...taskData,
                                        addon: { ...taskData.addon, automation: { ...taskData.addon?.automation, 'auto-accept': e.currentTarget.checked } }
                                    })}
                                />
                            </FormAddon>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="agent">
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
        </Tabs>
    );
}

