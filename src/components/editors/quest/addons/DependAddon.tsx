import { FormAddon } from '@/components/ui';
import { DebouncedTextarea } from '@/components/ui/DebouncedInput';

interface DependAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
}

export function DependAddon({ addon, onChange }: DependAddonProps) {
    return (
        <FormAddon
            label="依赖 (Depend)"
            description="前置任务依赖"
            checked={!!addon?.depend}
            onChange={(checked) => {
                if (checked) {
                    onChange({ ...addon, depend: [] });
                } else {
                    const { depend, ...rest } = addon || {};
                    onChange(rest);
                }
            }}
        >
            <DebouncedTextarea
                label="依赖列表 (每行一个)"
                placeholder="quest_id 或 group:name"
                value={Array.isArray(addon?.depend) ? addon.depend.join('\n') : ''}
                onChange={(val) => onChange({
                    ...addon,
                    depend: val.split('\n')
                })}
                autosize
                minRows={3}
                debounceMs={800}
            />
        </FormAddon>
    );
}
