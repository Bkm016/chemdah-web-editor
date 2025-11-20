import { Stack } from '@mantine/core';
import { FormTextarea, FormInput } from '../../../../ui';

interface ScoreboardSettingsProps {
    data: any;
    onChange: (data: any) => void;
}

export function ScoreboardSettings({ data, onChange }: ScoreboardSettingsProps) {
    const update = (key: string, value: any) => {
        onChange({ ...data, [key]: value });
    };

    return (
        <Stack gap="xs">
            <FormInput
                label="长度 (Length)"
                type="number"
                value={data?.length ?? 20}
                onChange={(e) => update('length', parseInt(e.target.value))}
            />
            <FormTextarea
                label="显示内容 (Content)"
                description="支持变量 {name}, {description}"
                value={Array.isArray(data?.content) ? data.content.join('\n') : (data?.content || '')}
                onChange={(e) => update('content', e.target.value.split('\n'))}
                minRows={2}
            />
        </Stack>
    );
}
