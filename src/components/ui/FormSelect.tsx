import { Select, SelectProps, Group, Text, Badge } from '@mantine/core';

export function FormSelect(props: SelectProps) {
    const renderLabel = () => {
        if (typeof props.label === 'string') {
            const match = props.label.match(/^(.*?)\s*\((.*?)\)$/);
            if (match) {
                return (
                    <Group gap={8}>
                        <Text span size="sm" fw={500}>{match[1]}</Text>
                        <Badge size="xs" variant="light" color="gray" style={{ textTransform: 'none' }}>
                            {match[2]}
                        </Badge>
                    </Group>
                );
            }
        }
        return props.label;
    };

    return <Select searchable allowDeselect={false} nothingFoundMessage="无匹配选项" {...props} label={props.label ? renderLabel() : undefined} />;
}
