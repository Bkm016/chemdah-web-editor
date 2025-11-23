import { Stack, TextInput, Text, Box, Divider, Group } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useState, useMemo, useCallback } from 'react';
import { useApiStore } from '@/store/useApiStore';
import { MetaConfigCard } from './MetaConfigCard';
import { AddonConfigCard } from './AddonConfigCard';

interface MetaAddonListProps {
    type: 'meta' | 'addon';
    scope: 'quest' | 'task';
    data: any;
    onChange: (newData: any) => void;
    excludeIds?: string[]; // 要排除的组件 ID 列表
}

export function MetaAddonList({ type, scope, data, onChange, excludeIds = [] }: MetaAddonListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const { searchMetas, searchAddons, getMeta, getAddon } = useApiStore();

    // 获取搜索结果
    const searchResults = useMemo(() => {
        const results = type === 'meta' ? searchMetas(searchQuery) : searchAddons(searchQuery);

        // 过滤出符合 scope 的结果，并排除指定的 ID
        const filtered = results.filter(item => {
            // 排除指定的 ID
            if (excludeIds.includes(item.id)) {
                return false;
            }

            const definition = type === 'meta'
                ? getMeta(item.plugin, item.id)
                : getAddon(item.plugin, item.id);

            if (!definition) {
                return false;
            }

            // 规范化 scope 值
            // quest_only -> quest, task_only -> task, both -> both
            const normalizedDefScope = definition.scope === 'quest_only' ? 'quest'
                : definition.scope === 'task_only' ? 'task'
                : definition.scope;

            const normalizedRequiredScope = scope;

            // 判断是否匹配
            const matches = normalizedDefScope === 'both' || normalizedDefScope === normalizedRequiredScope;

            return matches;
        });

        return filtered;
    }, [searchQuery, type, scope, searchMetas, searchAddons, getMeta, getAddon, excludeIds]);

    const handleItemChange = useCallback((itemId: string, newValue: any) => {
        const newData = { ...data };

        if (newValue === undefined || newValue === null || newValue === '' ||
            (typeof newValue === 'object' && Object.keys(newValue).length === 0)) {
            delete newData[itemId];
        } else {
            newData[itemId] = newValue;
        }

        onChange(newData);
    }, [data, onChange]);

    const typeName = type === 'meta' ? '元数据' : '扩展';
    const scopeName = scope === 'quest' ? '任务' : '条目';

    return (
        <Stack gap="md">
            {/* 分割线和标题 */}
            <Divider
                label={
                    <Group gap="xs">
                        <Text size="sm" fw={600} c="dimmed">
                            API 扩展组件
                        </Text>
                        <Text size="xs" c="dimmed">
                            (通过 JSON 导入)
                        </Text>
                    </Group>
                }
                labelPosition="center"
            />

            <TextInput
                placeholder={`搜索 ${scopeName}${typeName}组件...`}
                leftSection={<IconSearch size={16} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />

            {searchResults.length === 0 ? (
                <Box py="xl">
                    <Text c="dimmed" ta="center" size="sm">
                        {searchQuery ? '未找到匹配的组件' : `暂无可用的 ${scopeName}${typeName}组件`}
                    </Text>
                </Box>
            ) : (
                <Stack gap="sm">
                    {searchResults.map((item) => {
                        const definition = type === 'meta'
                            ? getMeta(item.plugin, item.id)
                            : getAddon(item.plugin, item.id);

                        if (!definition) return null;

                        const itemData = data?.[item.id];

                        return type === 'meta' ? (
                            <MetaConfigCard
                                key={`${item.plugin}:${item.id}`}
                                metaId={item.id}
                                definition={definition}
                                plugin={item.plugin}
                                data={itemData}
                                onChange={handleItemChange}
                            />
                        ) : (
                            <AddonConfigCard
                                key={`${item.plugin}:${item.id}`}
                                addonId={item.id}
                                definition={definition}
                                plugin={item.plugin}
                                data={itemData}
                                onChange={handleItemChange}
                            />
                        );
                    })}
                </Stack>
            )}
        </Stack>
    );
}
