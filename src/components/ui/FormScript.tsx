import Editor, { EditorProps } from '@monaco-editor/react';
import { Box, Text, Group, Badge } from '@mantine/core';
import { useThemeStore } from '../../store/useThemeStore';

interface FormScriptProps extends EditorProps {
    label?: string;
    description?: string;
    height?: string | number;
    value?: string;
    onChange?: (value: string | undefined) => void;
}

export function FormScript({ label, description, height = "200px", value, onChange, ...props }: FormScriptProps) {
    const { colorScheme } = useThemeStore();

    const renderLabel = () => {
        if (!label) return null;
        const match = label.match(/^(.*?)\s*\((.*?)\)$/);
        if (match) {
            return (
                <Group gap={8} mb={4}>
                    <Text span size="sm" fw={500}>{match[1]}</Text>
                    <Badge size="xs" variant="light" color="gray" style={{ textTransform: 'none' }}>
                        {match[2]}
                    </Badge>
                </Group>
            );
        }
        return <Text size="sm" fw={500} mb={4}>{label}</Text>;
    };

    return (
        <Box>
            {renderLabel()}
            {description && <Text size="xs" c="dimmed" mb={8}>{description}</Text>}
            <Box style={{ border: '1px solid var(--mantine-color-dark-4)', borderRadius: '4px', overflow: 'hidden' }}>
                <Editor
                    height={height}
                    defaultLanguage="ruby"
                    theme={colorScheme === 'dark' ? 'vs-dark' : 'light'}
                    value={value === undefined || value === null ? '' : String(value)}
                    onChange={onChange}
                    options={{
                        minimap: { enabled: false },
                        lineNumbers: 'on',
                        lineNumbersMinChars: 3,
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                        ...props.options
                    }}
                    {...props}
                />
            </Box>
        </Box>
    );
}
