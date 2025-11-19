import { Checkbox, CheckboxProps, Group, Text, Badge } from '@mantine/core';

export function FormCheckbox(props: CheckboxProps) {
    const renderLabel = () => {
        if (typeof props.label === 'string') {
            const match = props.label.match(/^(.*?)\s*\((.*?)\)$/);
            if (match) {
                return (
                    <Group gap={8} display="inline-flex">
                        <Text span>{match[1]}</Text>
                        <Badge size="xs" variant="light" color="gray" style={{ textTransform: 'none' }}>
                            {match[2]}
                        </Badge>
                    </Group>
                );
            }
        }
        return props.label;
    };

    return <Checkbox {...props} label={renderLabel()} />;
}
