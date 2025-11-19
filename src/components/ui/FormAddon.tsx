import { Switch, Paper, Stack, Collapse, Group, Text, Box, Badge } from '@mantine/core';
import { useUncontrolled } from '@mantine/hooks';

interface FormAddonProps {
    label: React.ReactNode;
    description?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    children?: React.ReactNode;
}

export function FormAddon({ label, description, checked, defaultChecked, onChange, children }: FormAddonProps) {
    const [_checked, handleChange] = useUncontrolled({
        value: checked,
        defaultValue: defaultChecked,
        finalValue: false,
        onChange,
    });

    const renderLabel = () => {
        if (typeof label === 'string') {
            const match = label.match(/^(.*?)\s*\((.*?)\)$/);
            if (match) {
                return (
                    <Group gap={8}>
                        <Text fw={500}>{match[1]}</Text>
                        <Badge size="sm" variant="light" color="gray" style={{ textTransform: 'none' }}>
                            {match[2]}
                        </Badge>
                    </Group>
                );
            }
        }
        return <Text fw={500}>{label}</Text>;
    };

    return (
        <Paper withBorder p="md" style={{ 
            borderColor: _checked ? 'var(--mantine-color-blue-8)' : undefined,
            backgroundColor: _checked ? 'rgba(25, 113, 194, 0.05)' : undefined
        }}>
            <Group justify="space-between" mb={_checked && children ? 'md' : 0}>
                <Box>
                    {renderLabel()}
                    {description && <Text size="xs" c="dimmed">{description}</Text>}
                </Box>
                <Switch checked={_checked} onChange={(event) => handleChange(event.currentTarget.checked)} />
            </Group>
            {children && (
                <Collapse in={_checked}>
                    <Stack gap="md">
                        {children}
                    </Stack>
                </Collapse>
            )}
        </Paper>
    );
}
