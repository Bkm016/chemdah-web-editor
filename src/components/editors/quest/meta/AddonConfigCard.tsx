import { Card, Group, Text, Badge, Stack, Collapse, ActionIcon, Box } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useState, memo, useCallback } from 'react';
import { AddonDefinition } from '../../../../store/useApiStore';
import { DynamicMetaFields } from './DynamicMetaFields';

interface AddonConfigCardProps {
    addonId: string;
    definition: AddonDefinition;
    plugin: string;
    data: any;
    onChange: (addonId: string, newData: any) => void;
}

export const AddonConfigCard = memo(function AddonConfigCard({ addonId, definition, plugin, data, onChange }: AddonConfigCardProps) {
    const [opened, setOpened] = useState(false);

    // 使用 _source 字段作为实际来源，如果没有则回退到 plugin 参数
    const actualSource = definition._source || plugin;
    // 使用 _sourceColor 字段作为颜色，如果没有则使用默认颜色
    const sourceColor = definition._sourceColor || 'gray';

    const handleFieldChange = useCallback((newValue: any) => {
        onChange(addonId, newValue);
    }, [addonId, onChange]);

    return (
        <Card
            shadow="sm"
            padding="md"
            radius="md"
            withBorder
            style={{
                borderColor: opened ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-dark-4)',
                transition: 'all 0.2s'
            }}
        >
            <Group justify="space-between" wrap="nowrap" onClick={() => setOpened(!opened)} style={{ cursor: 'pointer' }}>
                <Box style={{ flex: 1, minWidth: 0 }}>
                    <Group gap="xs" wrap="nowrap">
                        <Text size="sm" fw={600} truncate>
                            {definition.name || addonId}
                        </Text>
                        <Badge
                            size="xs"
                            variant="dot"
                            color={sourceColor}
                            style={{ textTransform: 'uppercase' }}
                        >
                            {actualSource}
                        </Badge>
                        {definition.alias && definition.alias.length > 0 && (
                            <Badge size="xs" variant="light" color="teal">
                                {definition.alias[0]}
                            </Badge>
                        )}
                    </Group>
                    {definition.description && definition.description.length > 0 && (
                        <Text size="xs" c="dimmed" mt={4} lineClamp={1}>
                            {definition.description[0]}
                        </Text>
                    )}
                </Box>
                <ActionIcon variant="subtle" size="sm">
                    {opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                </ActionIcon>
            </Group>

            <Collapse in={opened} transitionDuration={200}>
                <Box mt="md" pt="md" style={{ borderTop: '1px solid var(--mantine-color-dark-4)' }}>
                    {definition.description && definition.description.length > 1 && (
                        <Stack gap={4} mb="md">
                            {definition.description.map((desc, idx) => (
                                <Text key={idx} size="xs" c="dimmed">
                                    {desc}
                                </Text>
                            ))}
                        </Stack>
                    )}

                    <DynamicMetaFields
                        params={definition.params || []}
                        optionType={definition.option_type}
                        value={data}
                        onChange={handleFieldChange}
                    />
                </Box>
            </Collapse>
        </Card>
    );
});
