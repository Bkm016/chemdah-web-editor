import { Stack } from '@mantine/core';
import { FormTextarea, FormInput, FormCheckbox } from '../../../../ui';

interface LandmarkSettingsProps {
    data: any;
    onChange: (data: any) => void;
}

export function LandmarkSettings({ data, onChange }: LandmarkSettingsProps) {
    const update = (key: string, value: any) => {
        onChange({ ...data, [key]: value });
    };

    return (
        <Stack gap="xs">
            <FormInput
                label="显示距离 (Distance)"
                type="number"
                value={data?.distance ?? 128}
                onChange={(e) => update('distance', parseFloat(e.target.value))}
            />
            <FormCheckbox
                label="靠近隐藏 (Hide Near)"
                checked={data?.['hide-near'] || false}
                onChange={(e) => update('hide-near', e.currentTarget.checked)}
            />
            <FormTextarea
                label="显示内容 (Content)"
                description="支持变量 {distance}, {name}, {description}"
                value={Array.isArray(data?.content) ? data.content.join('\n') : (data?.content || '')}
                onChange={(e) => update('content', e.target.value.split('\n'))}
                minRows={2}
            />
        </Stack>
    );
}
