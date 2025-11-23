import { FormAddon } from '@/components/ui';

interface OptionalAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
}

export function OptionalAddon({ addon, onChange }: OptionalAddonProps) {
    return (
        <FormAddon
            label="可选任务 (Optional)"
            description="是否为可选任务"
            checked={addon?.optional === true}
            onChange={(checked) => {
                if (checked) {
                    onChange({ ...addon, optional: true });
                } else {
                    const { optional, ...rest } = addon || {};
                    onChange(rest);
                }
            }}
        />
    );
}
