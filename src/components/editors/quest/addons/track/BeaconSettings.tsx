import { Stack, Group } from '@mantine/core';
import { FormInput, FormSelect, FormCheckbox } from '@/components/ui';
import { PARTICLE_TYPES } from '@/utils/particle-types';

interface BeaconSettingsProps {
    data: any;
    onChange: (data: any) => void;
}

export function BeaconSettings({ data, onChange }: BeaconSettingsProps) {
    const update = (key: string, value: any) => {
        onChange({ ...data, [key]: value });
    };

    return (
        <Stack gap="xs">
            <FormSelect
                label="粒子类型 (Type)"
                data={PARTICLE_TYPES}
                value={data?.type || 'FLAME'}
                onChange={(val) => update('type', val)}
                searchable
            />
            <Group grow>
                <FormInput
                    label="大小 (Size)"
                    type="number"
                    value={data?.size ?? 0.5}
                    onChange={(e) => update('size', parseFloat(e.target.value))}
                    step={0.1}
                />
                <FormInput
                    label="数量 (Count)"
                    type="number"
                    value={data?.count ?? 1}
                    onChange={(e) => update('count', parseInt(e.target.value))}
                />
            </Group>
            <Group grow>
                <FormInput
                    label="显示距离 (Distance)"
                    type="number"
                    value={data?.distance ?? 32}
                    onChange={(e) => update('distance', parseFloat(e.target.value))}
                />
                <FormInput
                    label="刷新周期 (Period)"
                    type="number"
                    value={data?.period ?? 20}
                    onChange={(e) => update('period', parseInt(e.target.value))}
                />
            </Group>
            <FormCheckbox
                label="固定位置 (Fixed)"
                checked={data?.fixed || false}
                onChange={(e) => update('fixed', e.currentTarget.checked)}
            />
        </Stack>
    );
}
