import { FormAddon, FormCheckbox } from '@/components/ui';
import { IconInput } from '@/components/editors/quest/components/IconInput';
import { DebouncedTextarea } from '@/components/ui/DebouncedInput';

interface UIAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
}

export function UIAddon({ addon, onChange }: UIAddonProps) {
    return (
        <FormAddon
            label="界面 (UI)"
            description="任务显示图标、描述等"
            checked={!!addon?.ui}
            onChange={(checked) => {
                if (checked) {
                    onChange({ ...addon, ui: { visible: { start: false, complete: true } } });
                } else {
                    const { ui, ...rest } = addon || {};
                    onChange(rest);
                }
            }}
        >
            <IconInput
                label="图标 (Icon)"
                value={addon?.ui?.icon || ''}
                onChange={(val) => onChange({
                    ...addon,
                    ui: { ...addon?.ui, icon: val }
                })}
            />
            <DebouncedTextarea
                label="描述 (Description)"
                value={Array.isArray(addon?.ui?.description) ? addon.ui.description.join('\n') : (addon?.ui?.description || '')}
                onChange={(val) => onChange({
                    ...addon,
                    ui: { ...addon?.ui, description: val.split('\n') }
                })}
                autosize
                minRows={3}
                debounceMs={800}
            />
            <FormCheckbox
                label="开始时可见 (Visible Start)"
                checked={addon?.ui?.visible?.start || false}
                onChange={(e) => onChange({
                    ...addon,
                    ui: { ...addon?.ui, visible: { ...addon?.ui?.visible, start: e.currentTarget.checked } }
                })}
            />
            <FormCheckbox
                label="完成后可见 (Visible Complete)"
                checked={addon?.ui?.visible?.complete ?? true}
                onChange={(e) => onChange({
                    ...addon,
                    ui: { ...addon?.ui, visible: { ...addon?.ui?.visible, complete: e.currentTarget.checked } }
                })}
            />
        </FormAddon>
    );
}
