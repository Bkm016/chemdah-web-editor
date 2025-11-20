import React, { useEffect, useState } from 'react';
import { TextInput, NumberInput, Group, Popover, ActionIcon, Stack, Text, Badge } from '@mantine/core';
import { IconSettings, IconCube } from '@tabler/icons-react';

interface IconInputProps {
    value: string;
    onChange: (value: string) => void;
    label?: React.ReactNode;
    description?: string;
}

export function IconInput({ value, onChange, label, description }: IconInputProps) {
    const [material, setMaterial] = useState('');
    const [data, setData] = useState<number | string>('');
    const [customModelData, setCustomModelData] = useState<number | string>('');
    const [opened, setOpened] = useState(false);

    const renderLabel = () => {
        if (typeof label === 'string') {
            const match = label.match(/^(.*?)\s*\((.*?)\)$/);
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
        return label;
    };

    useEffect(() => {
        if (!value) {
            setMaterial('');
            setData('');
            setCustomModelData('');
            return;
        }

        // Parse: Material[d=1,c=2]
        const match = value.match(/^([^\[]+)(?:\[(.*)\])?$/);
        if (match) {
            setMaterial(match[1]);
            if (match[2]) {
                const props = match[2].split(',').reduce((acc, curr) => {
                    const [k, v] = curr.split('=').map(s => s.trim());
                    acc[k] = v;
                    return acc;
                }, {} as Record<string, string>);

                const d = props['d'] || props['data'];
                const c = props['c'] || props['custom_data_model'];

                setData(d ? parseInt(d) : '');
                setCustomModelData(c ? parseInt(c) : '');
            } else {
                setData('');
                setCustomModelData('');
            }
        } else {
            setMaterial(value);
            setData('');
            setCustomModelData('');
        }
    }, [value]);

    const updateValue = (newMaterial: string, newData: number | string, newCmd: number | string) => {
        if (!newMaterial) {
            onChange('');
            return;
        }

        const props: string[] = [];
        if (newData !== '') props.push(`d=${newData}`);
        if (newCmd !== '') props.push(`c=${newCmd}`);

        if (props.length > 0) {
            onChange(`${newMaterial}[${props.join(',')}]`);
        } else {
            onChange(newMaterial);
        }
    };

    return (
        <Popover opened={opened} onChange={setOpened} width={300} position="bottom-start" withArrow trapFocus>
            <Popover.Target>
                <TextInput
                    label={renderLabel()}
                    description={description}
                    placeholder="STONE"
                    value={material}
                    onChange={(e) => {
                        setMaterial(e.target.value);
                        updateValue(e.target.value, data, customModelData);
                    }}
                    rightSection={
                        <ActionIcon 
                            variant={data !== '' || customModelData !== '' ? "light" : "subtle"} 
                            color={data !== '' || customModelData !== '' ? "blue" : "gray"} 
                            onClick={() => setOpened((o) => !o)}
                        >
                            <IconSettings size={16} />
                        </ActionIcon>
                    }
                    leftSection={<IconCube size={16} />}
                />
            </Popover.Target>
            <Popover.Dropdown>
                <Stack gap="xs">
                    <Group justify="space-between">
                        <Text size="sm" fw={500}>图标属性</Text>
                        <Badge size="xs" variant="light">Properties</Badge>
                    </Group>
                    
                    <NumberInput
                        label={
                            <Group gap={8}>
                                <Text span size="sm" fw={500}>耐久度</Text>
                                <Badge size="xs" variant="light" color="gray" style={{ textTransform: 'none' }}>
                                    Data/Durability
                                </Badge>
                            </Group>
                        }
                        placeholder="0"
                        value={data}
                        onChange={(val) => {
                            setData(val);
                            updateValue(material, val, customModelData);
                        }}
                        min={0}
                        allowNegative={false}
                    />
                    
                    <NumberInput
                        label={
                            <Group gap={8}>
                                <Text span size="sm" fw={500}>自定义模型</Text>
                                <Badge size="xs" variant="light" color="gray" style={{ textTransform: 'none' }}>
                                    CustomModelData
                                </Badge>
                            </Group>
                        }
                        placeholder="0"
                        value={customModelData}
                        onChange={(val) => {
                            setCustomModelData(val);
                            updateValue(material, data, val);
                        }}
                        min={0}
                        allowNegative={false}
                    />
                </Stack>
            </Popover.Dropdown>
        </Popover>
    );
}
