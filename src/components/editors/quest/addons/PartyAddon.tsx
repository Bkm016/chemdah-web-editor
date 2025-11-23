import { FormAddon, FormCheckbox, FormInput } from '@/components/ui';

interface PartyAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
}

export function PartyAddon({ addon, onChange }: PartyAddonProps) {
    return (
        <FormAddon
            label="组队 (Party)"
            description="组队共享设置"
            checked={!!addon?.party}
            onChange={(checked) => {
                if (checked) {
                    onChange({ ...addon, party: {} });
                } else {
                    const { party, ...rest } = addon || {};
                    onChange(rest);
                }
            }}
        >
            <FormCheckbox
                label="共享任务 (Share)"
                checked={addon?.party?.share || false}
                onChange={(e) => onChange({
                    ...addon,
                    party: { ...addon?.party, share: e.currentTarget.checked }
                })}
            />
            <FormCheckbox
                label="仅队长共享 (Share Only Leader)"
                checked={addon?.party?.['share-only-leader'] || false}
                onChange={(e) => onChange({
                    ...addon,
                    party: { ...addon?.party, 'share-only-leader': e.currentTarget.checked }
                })}
            />
            <FormCheckbox
                label="允许协助 (Continue)"
                checked={addon?.party?.continue || false}
                onChange={(e) => onChange({
                    ...addon,
                    party: { ...addon?.party, continue: e.currentTarget.checked }
                })}
            />
            <FormInput
                label="最少人数 (Require Members)"
                type="number"
                value={addon?.party?.['require-members'] || ''}
                onChange={(e) => onChange({
                    ...addon,
                    party: { ...addon?.party, 'require-members': parseInt(e.target.value) || 0 }
                })}
            />
        </FormAddon>
    );
}
