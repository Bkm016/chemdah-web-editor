import { Container, Title, Stack, Text, Group, Badge, Card, Tabs } from '@mantine/core';
import { useState } from 'react';
import { ApiSearchSelect, parseApiValue } from '@/components/common/ApiSearchSelect';
import { useApiStore, SearchResultItem } from '@/store/useApiStore';
import { useApiCenterStore } from '@/store/useApiCenterStore';

export function ApiTestPage() {
  const { apiData, searchIndex } = useApiStore();
  const { sources } = useApiCenterStore();

  const [selectedObjective, setSelectedObjective] = useState<string | undefined>(undefined);
  const [selectedMeta, setSelectedMeta] = useState<string | undefined>(undefined);
  const [selectedAddon, setSelectedAddon] = useState<string | undefined>(undefined);

  const [selectedObjItem, setSelectedObjItem] = useState<SearchResultItem | null>(null);
  const [selectedMetaItem, setSelectedMetaItem] = useState<SearchResultItem | null>(null);
  const [selectedAddonItem, setSelectedAddonItem] = useState<SearchResultItem | null>(null);

  const handleObjectiveChange = (value: string | null, item: SearchResultItem | null) => {
    setSelectedObjective(value || undefined);
    setSelectedObjItem(item);
  };

  const handleMetaChange = (value: string | null, item: SearchResultItem | null) => {
    setSelectedMeta(value || undefined);
    setSelectedMetaItem(item);
  };

  const handleAddonChange = (value: string | null, item: SearchResultItem | null) => {
    setSelectedAddon(value || undefined);
    setSelectedAddonItem(item);
  };

  const getMetaDetail = () => {
    if (!selectedMeta) return null;
    const parsed = parseApiValue(selectedMeta);
    if (!parsed) return null;
    return useApiStore.getState().getMeta(parsed.plugin, parsed.id);
  };

  const getAddonDetail = () => {
    if (!selectedAddon) return null;
    const parsed = parseApiValue(selectedAddon);
    if (!parsed) return null;
    return useApiStore.getState().getAddon(parsed.plugin, parsed.id);
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={2}>🔍 API 搜索功能测试</Title>
          <Text size="sm" c="dimmed" mt={4}>
            测试新的 API 结构导入和模糊搜索功能
          </Text>
        </div>

        {/* 统计信息 */}
        <Card withBorder>
          <Stack gap="md">
            <Title order={4}>📊 数据统计</Title>
            <Group>
              <Badge size="lg" variant="light" color="blue">
                {sources.filter(s => s.enabled && s.status === 'success').length} 个 API 源已加载
              </Badge>
              <Badge size="lg" variant="light" color="green">
                {searchIndex.objectives.length} 个 Objectives
              </Badge>
              <Badge size="lg" variant="light" color="orange">
                {searchIndex.metas.length} 个 Metas
              </Badge>
              <Badge size="lg" variant="light" color="purple">
                {searchIndex.addons.length} 个 Addons
              </Badge>
            </Group>

            <Stack gap="xs">
              <Text size="sm" fw={600}>已加载的插件:</Text>
              <Group gap="xs">
                {Object.keys(apiData).map(plugin => (
                  <Badge key={plugin} variant="dot" color="cyan">
                    {plugin}
                  </Badge>
                ))}
              </Group>
            </Stack>
          </Stack>
        </Card>

        {/* 搜索测试 */}
        <Tabs defaultValue="objective">
          <Tabs.List>
            <Tabs.Tab value="objective">Objective 搜索</Tabs.Tab>
            <Tabs.Tab value="meta">Meta 搜索</Tabs.Tab>
            <Tabs.Tab value="addon">Addon 搜索</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="objective" pt="md">
            <Stack gap="md">
              <ApiSearchSelect
                type="objective"
                value={selectedObjective}
                onChange={handleObjectiveChange}
                label="搜索任务目标"
                description="支持 ID、中文名、别名模糊搜索"
              />

              {selectedObjItem && (
                <Card withBorder>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Title order={5}>{selectedObjItem.name}</Title>
                      <Badge>{selectedObjItem.plugin}</Badge>
                    </Group>
                    <Text size="sm" c="dimmed">ID: {selectedObjItem.id}</Text>
                    {selectedObjItem.alias.length > 0 && (
                      <Text size="sm">
                        <strong>别名:</strong> {selectedObjItem.alias.join(', ')}
                      </Text>
                    )}
                    {selectedObjItem.description.length > 0 && (
                      <Stack gap={4}>
                        <Text size="sm" fw={600}>描述:</Text>
                        {selectedObjItem.description.map((desc, i) => (
                          <Text key={i} size="sm" c="dimmed">• {desc}</Text>
                        ))}
                      </Stack>
                    )}
                    <Text size="sm" c="dimmed">
                      匹配分数: {selectedObjItem.score}
                    </Text>
                  </Stack>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="meta" pt="md">
            <Stack gap="md">
              <ApiSearchSelect
                type="meta"
                value={selectedMeta}
                onChange={handleMetaChange}
                label="搜索 Meta 组件"
                description="支持 ID、中文名、别名模糊搜索"
              />

              {selectedMetaItem && (
                <Card withBorder>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Title order={5}>{selectedMetaItem.name}</Title>
                      <Group gap="xs">
                        <Badge>{selectedMetaItem.plugin}</Badge>
                        {(() => {
                          const detail = getMetaDetail();
                          return detail && (
                            <>
                              <Badge variant="light" color="blue">{detail.scope}</Badge>
                              <Badge variant="light" color="orange">{detail.option_type}</Badge>
                            </>
                          );
                        })()}
                      </Group>
                    </Group>
                    <Text size="sm" c="dimmed">ID: {selectedMetaItem.id}</Text>
                    {selectedMetaItem.alias.length > 0 && (
                      <Text size="sm">
                        <strong>别名:</strong> {selectedMetaItem.alias.join(', ')}
                      </Text>
                    )}
                    {selectedMetaItem.description.length > 0 && (
                      <Stack gap={4}>
                        <Text size="sm" fw={600}>描述:</Text>
                        {selectedMetaItem.description.map((desc, i) => (
                          <Text key={i} size="sm" c="dimmed">• {desc}</Text>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="addon" pt="md">
            <Stack gap="md">
              <ApiSearchSelect
                type="addon"
                value={selectedAddon}
                onChange={handleAddonChange}
                label="搜索 Addon 组件"
                description="支持 ID、中文名、别名模糊搜索"
              />

              {selectedAddonItem && (
                <Card withBorder>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Title order={5}>{selectedAddonItem.name}</Title>
                      <Group gap="xs">
                        <Badge>{selectedAddonItem.plugin}</Badge>
                        {(() => {
                          const detail = getAddonDetail();
                          return detail && (
                            <>
                              <Badge variant="light" color="blue">{detail.scope}</Badge>
                              <Badge variant="light" color="orange">{detail.option_type}</Badge>
                            </>
                          );
                        })()}
                      </Group>
                    </Group>
                    <Text size="sm" c="dimmed">ID: {selectedAddonItem.id}</Text>
                    {selectedAddonItem.alias.length > 0 && (
                      <Text size="sm">
                        <strong>别名:</strong> {selectedAddonItem.alias.join(', ')}
                      </Text>
                    )}
                    {selectedAddonItem.description.length > 0 && (
                      <Stack gap={4}>
                        <Text size="sm" fw={600}>描述:</Text>
                        {selectedAddonItem.description.map((desc, i) => (
                          <Text key={i} size="sm" c="dimmed">• {desc}</Text>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
