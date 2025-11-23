import { Stack, Group, Title } from '@mantine/core';
import { FormSelect, FormInput, FormCheckbox } from '@/components/ui';
import { PARTICLE_TYPES } from '@/utils/particle-types';

interface NavigationSettingsProps {
    data: any;
    onChange: (data: any) => void;
}

export function NavigationSettings({ data, onChange }: NavigationSettingsProps) {
    const update = (key: string, value: any) => {
        onChange({ ...data, [key]: value });
    };

    const updateNested = (parent: string, key: string, value: any) => {
        onChange({
            ...data,
            [parent]: {
                ...(data?.[parent] || {}),
                [key]: value
            }
        });
    };

    const type = data?.type || 'POINT';

    return (
        <Stack gap="xs">
            <Group grow>
                <FormInput
                    label="最大距离 (Distance)"
                    type="number"
                    value={data?.distance ?? 128}
                    onChange={(e) => update('distance', parseFloat(e.target.value))}
                />
                <FormCheckbox
                    label="主线程寻路 (Sync)"
                    checked={data?.sync || false}
                    onChange={(e) => update('sync', e.currentTarget.checked)}
                    mt={24}
                />
            </Group>
            
            <FormSelect
                label="显示类型 (Type)"
                data={['POINT', 'ARROW']}
                value={type}
                onChange={(val) => update('type', val)}
            />

            {type === 'POINT' && (
                <Stack gap="xs" p="xs" bg="var(--mantine-color-dark-6)" style={{ borderRadius: 8 }}>
                    <Title order={6} size="xs" c="dimmed">点状配置 (Point Options)</Title>
                    <Group grow>
                        <FormSelect
                            label="粒子类型"
                            data={PARTICLE_TYPES}
                            value={data?.point?.type || 'CRIT'}
                            onChange={(val) => updateNested('point', 'type', val)}
                            searchable
                        />
                        <FormInput
                            label="Y轴偏移"
                            type="number"
                            value={data?.point?.y ?? 0.5}
                            onChange={(e) => updateNested('point', 'y', parseFloat(e.target.value))}
                            step={0.1}
                        />
                    </Group>
                    <Group grow>
                        <FormInput
                            label="大小 X"
                            type="number"
                            value={data?.point?.size?.x ?? 0.2}
                            onChange={(e) => onChange({
                                ...data,
                                point: {
                                    ...data?.point,
                                    size: { ...data?.point?.size, x: parseFloat(e.target.value) }
                                }
                            })}
                            step={0.1}
                        />
                        <FormInput
                            label="大小 Y"
                            type="number"
                            value={data?.point?.size?.y ?? 0.2}
                            onChange={(e) => onChange({
                                ...data,
                                point: {
                                    ...data?.point,
                                    size: { ...data?.point?.size, y: parseFloat(e.target.value) }
                                }
                            })}
                            step={0.1}
                        />
                    </Group>
                    <Group grow>
                        <FormInput
                            label="数量"
                            type="number"
                            value={data?.point?.count ?? 1}
                            onChange={(e) => updateNested('point', 'count', parseInt(e.target.value))}
                        />
                        <FormInput
                            label="速度"
                            type="number"
                            value={data?.point?.speed ?? 2}
                            onChange={(e) => updateNested('point', 'speed', parseFloat(e.target.value))}
                            step={0.1}
                        />
                        <FormInput
                            label="周期"
                            type="number"
                            value={data?.point?.period ?? 20}
                            onChange={(e) => updateNested('point', 'period', parseInt(e.target.value))}
                        />
                    </Group>
                </Stack>
            )}

            {type === 'ARROW' && (
                <Stack gap="xs" p="xs" bg="var(--mantine-color-dark-6)" style={{ borderRadius: 8 }}>
                    <Title order={6} size="xs" c="dimmed">箭头配置 (Arrow Options)</Title>
                    <Group grow>
                        <FormSelect
                            label="粒子类型"
                            data={PARTICLE_TYPES}
                            value={data?.arrow?.type || 'CRIT'}
                            onChange={(val) => updateNested('arrow', 'type', val)}
                            searchable
                        />
                        <FormInput
                            label="Y轴偏移"
                            type="number"
                            value={data?.arrow?.y ?? 1.0}
                            onChange={(e) => updateNested('arrow', 'y', parseFloat(e.target.value))}
                            step={0.1}
                        />
                    </Group>
                    <Group grow>
                        <FormInput
                            label="密度"
                            type="number"
                            value={data?.arrow?.density ?? 3}
                            onChange={(e) => updateNested('arrow', 'density', parseInt(e.target.value))}
                        />
                        <FormInput
                            label="长度"
                            type="number"
                            value={data?.arrow?.length ?? 0.5}
                            onChange={(e) => updateNested('arrow', 'length', parseFloat(e.target.value))}
                            step={0.1}
                        />
                    </Group>
                    <Group grow>
                        <FormInput
                            label="角度"
                            type="number"
                            value={data?.arrow?.angle ?? 0.5}
                            onChange={(e) => updateNested('arrow', 'angle', parseFloat(e.target.value))}
                            step={0.1}
                        />
                        <FormInput
                            label="速度"
                            type="number"
                            value={data?.arrow?.speed ?? 2}
                            onChange={(e) => updateNested('arrow', 'speed', parseFloat(e.target.value))}
                            step={0.1}
                        />
                        <FormInput
                            label="周期"
                            type="number"
                            value={data?.arrow?.period ?? 20}
                            onChange={(e) => updateNested('arrow', 'period', parseInt(e.target.value))}
                        />
                    </Group>
                </Stack>
            )}
        </Stack>
    );
}
