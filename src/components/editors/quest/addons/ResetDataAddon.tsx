import { FormAddon } from '@/components/ui';

interface ResetDataAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
}

export function ResetDataAddon({ addon, onChange }: ResetDataAddonProps) {
    return (
        <FormAddon
            label="接受时重置数据"
            description="Reset Data On Accepted"
            checked={addon?.['reset-data-on-accepted'] === true}
            onChange={(checked) => {
                if (checked) {
                    onChange({ ...addon, 'reset-data-on-accepted': true });
                } else {
                    const { 'reset-data-on-accepted': _, ...rest } = addon || {};
                    onChange(rest);
                }
            }}
        />
    );
}
