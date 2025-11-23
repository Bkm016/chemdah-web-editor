import { FormAddon, FormCheckbox } from '@/components/ui';

interface StatsAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
}

export function StatsAddon({ addon, onChange }: StatsAddonProps) {
    return (
        <FormAddon
            label="统计 (Stats)"
            description="任务统计信息"
            checked={!!addon?.stats}
            onChange={(checked) => {
                if (checked) {
                    onChange({ ...addon, stats: { visible: true } });
                } else {
                    const { stats, ...rest } = addon || {};
                    onChange(rest);
                }
            }}
        >
            <FormCheckbox
                label="可见 (Visible)"
                checked={addon?.stats?.visible || false}
                onChange={(e) => onChange({
                    ...addon,
                    stats: { ...addon?.stats, visible: e.currentTarget.checked }
                })}
            />
        </FormAddon>
    );
}
