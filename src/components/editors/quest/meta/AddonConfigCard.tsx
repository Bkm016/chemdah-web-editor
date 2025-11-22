import { Card, Group, Text, Badge, Stack, Collapse, ActionIcon, Box } from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useState } from 'react';
import { AddonDefinition } from '../../../../store/useApiStore';
import { DynamicMetaFields } from './DynamicMetaFields';

interface AddonConfigCardProps {
    addonId: string;
    definition: AddonDefinition;
    plugin: string;
    data: any;
    onChange: (addonId: string, newData: any) => void;
}

export function AddonConfigCard({ addonId, definition, plugin, data, onChange }: AddonConfigCardProps) {
    const [opened, setOpened] = useState(false);

    const handleFieldChange = (newValue: any) => {
        onChange(addonId, newValue);
    };

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
                        <Badge size="xs" variant="light" color="gray">
                            {plugin}
                        </Badge>
                        {definition.alias && definition.alias.length > 0 && (
                            <Badge size="xs" variant="light" color="green">
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
}
