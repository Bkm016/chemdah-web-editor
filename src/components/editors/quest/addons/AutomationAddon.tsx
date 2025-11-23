import { FormAddon, FormCheckbox, FormInput, FormSelect, FormSection } from '@/components/ui';
import { Stack, Group } from '@mantine/core';

interface AutomationAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
}

const SCHEDULE_TYPES = [
    { value: 'hour', label: '每小时 (Hourly)' },
    { value: 'day', label: '每天 (Daily)' },
    { value: 'week', label: '每周 (Weekly)' },
];

const TIME_METHODS = [
    { value: 'START_IN_MONDAY', label: '周一作为起点 (Start in Monday)' },
    { value: 'START_IN_SUNDAY', label: '周日作为起点 (Start in Sunday)' },
];

function PlanSettings({ data, onChange }: { data: any, onChange: (data: any) => void }) {
    const update = (key: string, value: any) => {
        onChange({ ...data, [key]: value });
    };

    const parseSchedule = (typeStr: string) => {
        const parts = (typeStr || '').split(' ');
        const type = parts[0];
        if (type === 'hour') {
            return { type: 'hour', minute: parseInt(parts[1]) || 0 };
        }
        if (type === 'day' || type === 'daily') {
            return { 
                type: 'day', 
                interval: parseInt(parts[1]) || 1,
                hour: parseInt(parts[2]) || 6,
                minute: parseInt(parts[3]) || 0
            };
        }
        if (type === 'week' || type === 'weekly') {
            return {
                type: 'week',
                interval: parseInt(parts[1]) || 1,
                day: parseInt(parts[2]) || 1,
                hour: parseInt(parts[3]) || 0,
                minute: parseInt(parts[4]) || 0
            };
        }
        return { type: 'day', interval: 1, hour: 6, minute: 0 };
    };

    const formatSchedule = (schedule: any) => {
        if (schedule.type === 'hour') {
            return `hour ${schedule.minute}`;
        }
        if (schedule.type === 'day') {
            return `day ${schedule.interval} ${schedule.hour} ${schedule.minute}`;
        }
        if (schedule.type === 'week') {
            return `week ${schedule.interval} ${schedule.day} ${schedule.hour} ${schedule.minute}`;
        }
        return 'day 1 6 0';
    };

    const schedule = parseSchedule(data.type || 'day 1 6 0');

    const updateSchedule = (updates: any) => {
        const newSchedule = { ...schedule, ...updates };
        // Reset fields when switching types
        if (updates.type && updates.type !== schedule.type) {
            if (updates.type === 'hour') {
                newSchedule.minute = 0;
                delete newSchedule.interval;
                delete newSchedule.hour;
                delete newSchedule.day;
            } else if (updates.type === 'day') {
                newSchedule.interval = 1;
                newSchedule.hour = 6;
                newSchedule.minute = 0;
                delete newSchedule.day;
            } else if (updates.type === 'week') {
                newSchedule.interval = 1;
                newSchedule.day = 1;
                newSchedule.hour = 6;
                newSchedule.minute = 0;
            }
        }
        update('type', formatSchedule(newSchedule));
    };

    return (
        <Stack gap="xs">
            <FormSelect
                label="计时方式 (Method)"
                description="计算周期的起始点"
                data={TIME_METHODS}
                value={data.method || 'START_IN_MONDAY'}
                onChange={(val) => update('method', val)}
            />
            <Group grow>
                <FormInput
                    label="任务数量 (Count)"
                    description="每次随机选择的任务数"
                    type="number"
                    value={data.count ?? 1}
                    onChange={(e) => update('count', parseInt(e.target.value))}
                />
                <FormInput
                    label="任务组 (Group)"
                    description="共享冷却的任务组名称"
                    value={data.group || ''}
                    onChange={(e) => update('group', e.target.value)}
                />
            </Group>

            <FormSection>
                <FormSelect
                    label="计划类型 (Schedule Type)"
                    data={SCHEDULE_TYPES}
                    value={schedule.type}
                    onChange={(val) => updateSchedule({ type: val })}
                />
                
                {schedule.type === 'hour' && (
                    <FormInput
                        label="分钟 (Minute)"
                        description="每小时的第几分钟执行"
                        type="number"
                        min={0}
                        max={59}
                        value={schedule.minute}
                        onChange={(e) => updateSchedule({ minute: parseInt(e.target.value) })}
                    />
                )}

                {schedule.type === 'day' && (
                    <Group grow>
                        <FormInput
                            label="间隔天数 (Interval)"
                            type="number"
                            min={1}
                            value={schedule.interval}
                            onChange={(e) => updateSchedule({ interval: parseInt(e.target.value) })}
                        />
                        <FormInput
                            label="小时 (Hour)"
                            type="number"
                            min={0}
                            max={23}
                            value={schedule.hour}
                            onChange={(e) => updateSchedule({ hour: parseInt(e.target.value) })}
                        />
                        <FormInput
                            label="分钟 (Minute)"
                            type="number"
                            min={0}
                            max={59}
                            value={schedule.minute}
                            onChange={(e) => updateSchedule({ minute: parseInt(e.target.value) })}
                        />
                    </Group>
                )}

                {schedule.type === 'week' && (
                    <Stack gap="xs">
                        <Group grow>
                            <FormInput
                                label="间隔周数 (Interval)"
                                type="number"
                                min={1}
                                value={schedule.interval}
                                onChange={(e) => updateSchedule({ interval: parseInt(e.target.value) })}
                            />
                            <FormInput
                                label="星期 (Day of Week)"
                                type="number"
                                min={1}
                                max={7}
                                value={schedule.day}
                                onChange={(e) => updateSchedule({ day: parseInt(e.target.value) })}
                            />
                        </Group>
                        <Group grow>
                            <FormInput
                                label="小时 (Hour)"
                                type="number"
                                min={0}
                                max={23}
                                value={schedule.hour}
                                onChange={(e) => updateSchedule({ hour: parseInt(e.target.value) })}
                            />
                            <FormInput
                                label="分钟 (Minute)"
                                type="number"
                                min={0}
                                max={59}
                                value={schedule.minute}
                                onChange={(e) => updateSchedule({ minute: parseInt(e.target.value) })}
                            />
                        </Group>
                    </Stack>
                )}
            </FormSection>
        </Stack>
    );
}

export function AutomationAddon({ addon, onChange }: AutomationAddonProps) {
    const updateAutomation = (key: string, value: any) => {
        onChange({
            ...addon,
            automation: { ...addon?.automation, [key]: value }
        });
    };

    return (
        <FormAddon
            label="自动化 (Automation)"
            description="自动接受与计划任务"
            checked={!!addon?.automation}
            onChange={(checked) => {
                if (checked) {
                    onChange({ ...addon, automation: {} });
                } else {
                    const { automation, ...rest } = addon || {};
                    onChange(rest);
                }
            }}
        >
            <Stack gap="md">
                <FormCheckbox
                    label="自动接受 (Auto Accept)"
                    description="玩家上线时自动接受该任务"
                    checked={addon?.automation?.['auto-accept'] || false}
                    onChange={(e) => updateAutomation('auto-accept', e.currentTarget.checked)}
                />

                <FormAddon
                    label="计划任务 (Plan)"
                    description="定时随机分发任务"
                    checked={!!addon?.automation?.plan}
                    onChange={(checked) => {
                        if (checked) {
                            updateAutomation('plan', {
                                method: 'START_IN_MONDAY',
                                count: 1,
                                type: 'day 1 6 0'
                            });
                        } else {
                            const { plan, ...rest } = addon?.automation || {};
                            onChange({ ...addon, automation: rest });
                        }
                    }}
                >
                    <PlanSettings 
                        data={addon?.automation?.plan || {}} 
                        onChange={(data) => updateAutomation('plan', data)} 
                    />
                </FormAddon>
            </Stack>
        </FormAddon>
    );
}
