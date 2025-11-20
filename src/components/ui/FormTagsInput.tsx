import { TagsInput, TagsInputProps, Group, Text, Badge } from '@mantine/core';
import { IconTags } from '@tabler/icons-react';

export function FormTagsInput(props: TagsInputProps) {
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

    return <TagsInput 
        comboboxProps={{ 
            transitionProps: { transition: 'pop', duration: 200 }, 
            shadow: 'md' 
        }}
        leftSection={<IconTags size={16} style={{ opacity: 0.5 }} />}
        styles={{ 
            dropdown: { 
                backgroundColor: 'var(--mantine-color-dark-7)', 
                border: '1px solid var(--mantine-color-dark-4)',
                borderRadius: 'var(--mantine-radius-md)',
            },
            pill: {
                backgroundColor: 'var(--mantine-color-blue-light)',
                color: 'var(--mantine-color-blue-light-color)',
                fontWeight: 600,
                borderRadius: 'var(--mantine-radius-sm)',
                height: '24px',
            },
            input: {
                backgroundColor: 'var(--mantine-color-dark-6)',
            }
        }}
        {...props} 
        label={props.label ? renderLabel() : undefined} 
    />;
}
