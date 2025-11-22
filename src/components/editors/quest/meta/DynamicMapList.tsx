import { Stack, Button, Card, Group, ActionIcon, Text, Collapse, Box } from '@mantine/core';
import { IconPlus, IconTrash, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useState } from 'react';
import { ParamDefinition } from '../../../../store/useApiStore';
import { DynamicMapItem } from './DynamicMapItem';

interface DynamicMapListProps {
    params: ParamDefinition[];
    value: any[];
    onChange: (value: any[]) => void;
    rootParamName: string; // 例如 "briefing[]" 或 "control[]"
}

/**
 * MAP_LIST 类型的动态编辑器
 *
 * 支持：
 * - 添加/删除列表项
 * - 每个列表项是一个 Map 对象
 * - 折叠/展开每个项
 */
export function DynamicMapList({ params, value, onChange, rootParamName }: DynamicMapListProps) {
    const [openedItems, setOpenedItems] = useState<Set<number>>(new Set([0]));

    // 获取该 Map 对象的所有字段定义（去掉 [] 和前缀）
    const mapFields = params.filter(p =>
        p.name.startsWith(rootParamName.replace('[]', '') + '[].') &&
        !p.name.endsWith('[]')
    );

    const handleAdd = () => {
        const newValue = [...(value || []), {}];
        onChange(newValue);
        // 自动展开新添加的项
        setOpenedItems(prev => new Set([...prev, newValue.length - 1]));
    };

    const handleRemove = (index: number) => {
        const newValue = (value || []).filter((_, i) => i !== index);
        onChange(newValue);
        // 移除展开状态
        setOpenedItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
        });
    };

    const handleItemChange = (index: number, newItem: any) => {
        const newValue = [...(value || [])];
        newValue[index] = newItem;
        onChange(newValue);
    };

    const toggleItem = (index: number) => {
        setOpenedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const items = value || [];

    return (
        <Stack gap="md">
            {items.map((item, index) => (
                <Card
                    key={index}
                    withBorder
                    padding="md"
                    style={{
                        borderColor: openedItems.has(index) ? 'var(--mantine-color-blue-6)' : undefined,
                        transition: 'border-color 0.2s'
                    }}
                >
                    <Stack gap="sm">
                        {/* Header */}
                        <Group justify="space-between" wrap="nowrap">
                            <Group gap="xs" style={{ flex: 1, cursor: 'pointer' }} onClick={() => toggleItem(index)}>
                                <ActionIcon variant="subtle" size="sm">
                                    {openedItems.has(index) ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                                </ActionIcon>
                                <Text size="sm" fw={500}>
                                    项目 #{index + 1}
                                </Text>
                            </Group>
                            <ActionIcon
                                color="red"
                                variant="subtle"
                                onClick={() => handleRemove(index)}
                            >
                                <IconTrash size={16} />
                            </ActionIcon>
                        </Group>

                        {/* Content */}
                        <Collapse in={openedItems.has(index)}>
                            <Box pt="sm">
                                <DynamicMapItem
                                    fields={mapFields}
                                    value={item}
                                    onChange={(newItem) => handleItemChange(index, newItem)}
                                    rootParamName={rootParamName}
                                />
                            </Box>
                        </Collapse>
                    </Stack>
                </Card>
            ))}

            {/* Add Button */}
            <Button
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={handleAdd}
            >
                添加项目
            </Button>
        </Stack>
    );
}
