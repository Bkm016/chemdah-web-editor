import { Switch, Paper, Stack, Collapse, Group, Text, Box, Badge, Modal, Button } from '@mantine/core';
import { useUncontrolled, useDisclosure } from '@mantine/hooks';

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

    const [opened, { open, close }] = useDisclosure(false);

    const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextChecked = event.currentTarget.checked;
        if (!nextChecked && children) {
            open();
        } else {
            handleChange(nextChecked);
        }
    };

    const handleConfirmClose = () => {
        handleChange(false);
        close();
    };

    const renderLabel = () => {
        if (typeof label === 'string') {
            const match = label.match(/^(.*?)\s*\((.*?)\)$/);
            if (match) {
                return (
                    <Group gap={8}>
                        <Text fw={500} component="span">{match[1]}</Text>
                        <Badge size="sm" variant="light" color="gray" style={{ textTransform: 'none' }}>
                            {match[2]}
                        </Badge>
                    </Group>
                );
            }
        }
        return <Text fw={500} component="div">{label}</Text>;
    };

    return (
        <>
            <Modal opened={opened} onClose={close} title="确认关闭" centered size="sm">
                <Text size="sm" mb="lg">
                    关闭此选项将清除已配置的内容，确定要继续吗？
                </Text>
                <Group justify="flex-end">
                    <Button variant="default" onClick={close}>取消</Button>
                    <Button color="red" onClick={handleConfirmClose}>确认关闭</Button>
                </Group>
            </Modal>
            <Paper withBorder p="md" style={{ 
                borderColor: _checked ? 'var(--mantine-color-blue-8)' : undefined,
                backgroundColor: _checked ? 'rgba(25, 113, 194, 0.05)' : undefined
            }}>
                <Group justify="space-between" mb={_checked && children ? 'md' : 0}>
                    <Box>
                        {renderLabel()}
                        {description && <Text size="xs" c="dimmed" component="div">{description}</Text>}
                    </Box>
                    <Switch checked={_checked} onChange={handleSwitchChange} />
                </Group>
                {children && (
                    <Collapse in={_checked}>
                        <Stack gap="md">
                            {children}
                        </Stack>
                    </Collapse>
                )}
            </Paper>
        </>
    );
}
