import { Stack } from '@mantine/core';
import { DebouncedTextarea, DebouncedNumberInput } from '@/components/ui/DebouncedInput';

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
            <DebouncedNumberInput
                label="长度 (Length)"
                value={data?.length ?? 20}
                onChange={(val) => update('length', typeof val === 'number' ? val : parseInt(String(val)))}
                debounceMs={800}
            />
            <DebouncedTextarea
                label="显示内容 (Content)"
                description="支持变量 {name}, {description}"
                value={Array.isArray(data?.content) ? data.content.join('\n') : (data?.content || '')}
                onChange={(val) => update('content', val.split('\n'))}
                minRows={2}
                autosize
                debounceMs={800}
            />
        </Stack>
    );
}
