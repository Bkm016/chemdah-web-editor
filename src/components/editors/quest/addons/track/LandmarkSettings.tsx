import { Stack } from '@mantine/core';
import { FormCheckbox } from '@/components/ui';
import { DebouncedTextarea, DebouncedNumberInput } from '@/components/ui/DebouncedInput';

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
            <DebouncedNumberInput
                label="显示距离 (Distance)"
                value={data?.distance ?? 128}
                onChange={(val) => update('distance', typeof val === 'number' ? val : parseFloat(String(val)))}
                debounceMs={800}
            />
            <FormCheckbox
                label="靠近隐藏 (Hide Near)"
                checked={data?.['hide-near'] || false}
                onChange={(e) => update('hide-near', e.currentTarget.checked)}
            />
            <DebouncedTextarea
                label="显示内容 (Content)"
                description="支持变量 {distance}, {name}, {description}"
                value={Array.isArray(data?.content) ? data.content.join('\n') : (data?.content || '')}
                onChange={(val) => update('content', val.split('\n'))}
                minRows={2}
                autosize
                debounceMs={800}
            />
        </Stack>
    );
}
