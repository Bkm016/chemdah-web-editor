import React, { useEffect, useState } from 'react';
import { Group, ActionIcon, Stack, Text, Button, Popover, Badge, Select } from '@mantine/core';
import { IconPlus, IconTrash, IconSettings } from '@tabler/icons-react';
import { FormTagsInput } from '@/components/ui/FormTagsInput';
import { DebouncedTextInput } from '@/components/ui/DebouncedInput';

interface InferFieldProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
}

interface Property {
    key: string;
    operator: string;
    value: string;
}

const OPERATORS = [
    { value: '=', label: '=' },
    { value: '!=', label: '!=' },
    { value: '>', label: '>' },
    { value: '>=', label: '>=' },
    { value: '<', label: '<' },
    { value: '<=', label: '<=' },
    { value: 'contains', label: 'Contains' },
    { value: 'in', label: 'In' },
];

export const InferField: React.FC<InferFieldProps> = ({ value, onChange, placeholder }) => {
    const [mainValue, setMainValue] = useState('');
    const [properties, setProperties] = useState<Property[]>([]);
    const [opened, setOpened] = useState(false);

    useEffect(() => {
        if (!value) {
            setMainValue('');
            setProperties([]);
            return;
        }

        const strVal = String(value);
        // Parse: material[k=v,k=v]
        const match = strVal.match(/^([^\[]+)(?:\[(.*)\])?$/);
        if (match) {
            setMainValue(match[1]);
            if (match[2]) {
                const props = match[2].split(/,(?![^\[]*\])/).map(p => {
                    // Parse property string
                    const pStr = p.trim();
                    
                    // Check for contains: key(val)
                    const containsMatch = pStr.match(/^([^(]+)\((.*)\)$/);
                    if (containsMatch) {
                        const key = containsMatch[1].trim();
                        const val = containsMatch[2];
                        // Simple heuristic: if it has | or /, it's likely IN, otherwise CONTAINS
                        if (val.includes('|') || val.includes('/')) {
                             return { key, operator: 'in', value: val };
                        }
                        return { key, operator: 'contains', value: val };
                    }

                    // Check for other operators
                    const operators = ['!=', '>=', '<=', '>', '<', '='];
                    for (const op of operators) {
                        const idx = pStr.indexOf(op);
                        if (idx !== -1) {
                            return {
                                key: pStr.substring(0, idx).trim(),
                                operator: op,
                                value: pStr.substring(idx + op.length).trim()
                            };
                        }
                    }

                    // Fallback
                    return { key: pStr, operator: '=', value: '' };
                });
                setProperties(props);
            } else {
                setProperties([]);
            }
        } else {
            setMainValue(value);
            setProperties([]);
        }
    }, [value]);

    const updateValue = (newMain: string, newProps: Property[]) => {
        if (!newMain) {
            onChange('');
            return;
        }
        if (newProps.length === 0) {
            onChange(newMain);
        } else {
            const propsStr = newProps.map(p => {
                if (p.operator === 'contains' || p.operator === 'in') {
                    return `${p.key}(${p.value})`;
                }
                return `${p.key}${p.operator}${p.value}`;
            }).join(',');
            onChange(`${newMain}[${propsStr}]`);
        }
    };

    const handleAddProperty = () => {
        const newProps = [...properties, { key: '', operator: '=', value: '' }];
        setProperties(newProps);
        updateValue(mainValue, newProps);
    };

    const handleRemoveProperty = (index: number) => {
        const newProps = properties.filter((_, i) => i !== index);
        setProperties(newProps);
        updateValue(mainValue, newProps);
    };

    const handlePropertyChange = (index: number, field: keyof Property, val: string) => {
        const newProps = [...properties];
        newProps[index] = { ...newProps[index], [field]: val };
        setProperties(newProps);
        updateValue(mainValue, newProps);
    };

    return (
        <Popover opened={opened} onChange={setOpened} width={450} position="bottom-end" withArrow trapFocus>
            <Popover.Target>
                <DebouncedTextInput
                    placeholder={placeholder || "Value"}
                    value={mainValue}
                    onChange={(val) => {
                        setMainValue(val);
                        updateValue(val, properties);
                    }}
                    style={{ flex: 1 }}
                    size="xs"
                    variant="filled"
                    debounceMs={800}
                    rightSection={
                        <ActionIcon variant={properties.length > 0 ? "light" : "subtle"} color={properties.length > 0 ? "blue" : "gray"} size="xs" onClick={() => setOpened((o) => !o)}>
                            <IconSettings size={12} />
                        </ActionIcon>
                    }
                />
            </Popover.Target>
            <Popover.Dropdown>
                <Stack gap="xs">
                        <Group gap="xs">
                            <Text size="xs" fw={500}>属性</Text>
                            <Badge size="xs" variant="light">Properties</Badge>
                        </Group>
                        {properties.map((prop, index) => (
                            <Group key={index} gap="xs" align="flex-start">
                                <DebouncedTextInput
                                    placeholder="Key"
                                    value={prop.key}
                                    onChange={(val) => handlePropertyChange(index, 'key', val)}
                                    size="xs"
                                    style={{ flex: 1 }}
                                    debounceMs={800}
                                />
                                <Select
                                    data={OPERATORS}
                                    value={prop.operator}
                                    onChange={(val) => handlePropertyChange(index, 'operator', val || '=')}
                                    size="xs"
                                    style={{ width: 100 }}
                                    allowDeselect={false}
                                    comboboxProps={{ withinPortal: false }}
                                />
                                {prop.operator === 'in' ? (
                                    <FormTagsInput
                                        placeholder="Values"
                                        value={prop.value ? prop.value.split('|') : []}
                                        onChange={(tags) => handlePropertyChange(index, 'value', tags.join('|'))}
                                        size="xs"
                                        style={{ flex: 1 }}
                                        comboboxProps={{ withinPortal: false }}
                                        splitChars={['|', ',', '/']}
                                        leftSection={null}
                                    />
                                ) : (
                                    <DebouncedTextInput
                                        placeholder="Value"
                                        value={prop.value}
                                        onChange={(val) => handlePropertyChange(index, 'value', val)}
                                        size="xs"
                                        style={{ flex: 1 }}
                                        debounceMs={800}
                                    />
                                )}
                                <ActionIcon color="red" variant="subtle" size="xs" onClick={() => handleRemoveProperty(index)} mt={4}>
                                    <IconTrash size={12} />
                                </ActionIcon>
                            </Group>
                        ))}
                        <Button size="xs" variant="light" leftSection={<IconPlus size={12} />} onClick={handleAddProperty}>
                            添加属性
                        </Button>
                    </Stack>
                </Popover.Dropdown>
        </Popover>
    );
};
