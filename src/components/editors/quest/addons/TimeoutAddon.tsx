import { FormAddon, FormInput } from '@/components/ui';

interface TimeoutAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
}

export function TimeoutAddon({ addon, onChange }: TimeoutAddonProps) {
    return (
        <FormAddon
            label="超时 (Timeout)"
            description="任务超时设置"
            checked={!!addon?.timeout}
            onChange={(checked) => {
                if (checked) {
                    onChange({ ...addon, timeout: '' });
                } else {
                    const { timeout, ...rest } = addon || {};
                    onChange(rest);
                }
            }}
        >
            <FormInput
                label="超时时间"
                placeholder="1h30m 或 day 4 0"
                value={addon?.timeout || ''}
                onChange={(e) => onChange({
                    ...addon,
                    timeout: e.target.value
                })}
            />
        </FormAddon>
    );
}
