import { FormAddon, FormScript } from '@/components/ui';

interface RestartAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
}

export function RestartAddon({ addon, onChange }: RestartAddonProps) {
    return (
        <FormAddon
            label="重启 (Restart)"
            description="任务重启条件 (Kether)"
            checked={!!addon?.restart}
            onChange={(checked) => {
                if (checked) {
                    onChange({ ...addon, restart: [] });
                } else {
                    const { restart, ...rest } = addon || {};
                    onChange(rest);
                }
            }}
        >
            <FormScript
                value={Array.isArray(addon?.restart) ? addon.restart.join('\n') : ''}
                onChange={(val) => onChange({
                    ...addon,
                    restart: (val || '').split('\n')
                })}
            />
        </FormAddon>
    );
}
