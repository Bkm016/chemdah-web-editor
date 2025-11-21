import React from 'react';
import { ComponentField } from '@/store/useApiStore';
import { FormInput, FormSelect, FormScript } from '@/components/ui';
import { Switch, Stack, TextInput, NumberInput, Group, Text } from '@mantine/core';

interface DynamicComponentFieldProps {
    field: ComponentField;
    value: any;
    onChange: (value: any) => void;
}

export function DynamicComponentField({ field, value, onChange }: DynamicComponentFieldProps) {
    const fieldName = field.name;
    const currentValue = value ?? field.default;

    const renderField = () => {
        switch (field.pattern) {
            case 'Boolean':
                return (
                    <Group justify="space-between">
                        <div>
                            <Text size="sm" fw={500}>{field.label}</Text>
                            {field.description && <Text size="xs" c="dimmed">{field.description}</Text>}
                        </div>
                        <Switch
                            checked={currentValue || false}
                            onChange={(e) => onChange(e.currentTarget.checked)}
                        />
                    </Group>
                );

            case 'Number':
                return (
                    <NumberInput
                        label={field.label}
                        description={field.description}
                        value={currentValue || 0}
                        onChange={onChange}
                    />
                );

            case 'String':
                return (
                    <TextInput
                        label={field.label}
                        description={field.description}
                        value={currentValue || ''}
                        onChange={(e) => onChange(e.currentTarget.value)}
                    />
                );

            case 'Array<String>':
                return (
                    <Stack gap="xs">
                        <Text size="sm" fw={500}>{field.label}</Text>
                        {field.description && <Text size="xs" c="dimmed">{field.description}</Text>}
                        <FormScript
                            value={Array.isArray(currentValue) ? currentValue.join('\n') : ''}
                            onChange={(val) => onChange(val ? val.split('\n').filter(l => l.trim()) : [])}
                            height="120px"
                        />
                    </Stack>
                );

            case 'Script':
                return (
                    <FormScript
                        label={field.label}
                        description={field.description}
                        value={currentValue || ''}
                        onChange={onChange}
                        height="150px"
                    />
                );

            case 'RichTextArray':
                // 富文本数组，暂时用简单文本数组代替
                return (
                    <Stack gap="xs">
                        <Text size="sm" fw={500}>{field.label}</Text>
                        {field.description && <Text size="xs" c="dimmed">{field.description}</Text>}
                        <FormScript
                            value={Array.isArray(currentValue)
                                ? currentValue.map(item =>
                                    typeof item === 'string' ? item : JSON.stringify(item)
                                  ).join('\n')
                                : ''
                            }
                            onChange={(val) => onChange(val ? val.split('\n').filter(l => l.trim()) : [])}
                            height="150px"
                        />
                    </Stack>
                );

            default:
                // 默认使用文本输入
                return (
                    <TextInput
                        label={field.label}
                        description={field.description}
                        value={currentValue || ''}
                        onChange={(e) => onChange(e.currentTarget.value)}
                    />
                );
        }
    };

    return <div>{renderField()}</div>;
}
