import { Switch, Paper, Stack, Collapse, Group, Text, Box } from '@mantine/core';
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

    return (
        <Paper withBorder p="md" style={{ 
            borderColor: _checked ? 'var(--mantine-color-blue-8)' : undefined,
            backgroundColor: _checked ? 'rgba(25, 113, 194, 0.05)' : undefined
        }}>
            <Group justify="space-between" mb={_checked && children ? 'md' : 0}>
                <Box>
                    <Text fw={500}>{label}</Text>
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
