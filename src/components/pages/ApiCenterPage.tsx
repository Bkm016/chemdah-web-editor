import { useState } from 'react';
import {
  Stack,
  Group,
  Text,
  Button,
  TextInput,
  Switch,
  Badge,
  ActionIcon,
  Paper,
  Tooltip,
  Loader,
  Alert,
  FileButton,
  Tabs,
  Title,
  Container
} from '@mantine/core';
import { IconPlus, IconTrash, IconRefresh, IconGripVertical, IconAlertCircle, IconCheck, IconUpload, IconLink } from '@tabler/icons-react';
import { useApiCenterStore, ApiSource } from '../../store/useApiCenterStore';
import { useApiStore } from '../../store/useApiStore';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { notifications } from '@mantine/notifications';

export function ApiCenterPage() {
  const { sources, addSource, addLocalSource, removeSource, toggleSource, reorderSources, loadSource, loadAllEnabledSources } = useApiCenterStore();
  const { syncFromApiCenter } = useApiStore();
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('url');

  const sortedSources = [...sources].sort((a, b) => a.order - b.order);

  const handleAdd = async () => {
    if (!newName.trim() || !newUrl.trim()) return;

    const newSource = {
      name: newName.trim(),
      url: newUrl.trim(),
      enabled: true
    };

    addSource(newSource);

    // Get the newly added source ID (it will be the last one with the highest order)
    const allSources = [...sources];
    const maxOrder = Math.max(...allSources.map(s => s.order), -1);

    // Wait a bit for the source to be added to the store
    setTimeout(async () => {
      const addedSource = sources.find(s => s.order === maxOrder + 1);
      if (addedSource) {
        await loadSource(addedSource.id);
        syncFromApiCenter();

        notifications.show({
          title: '源已添加',
          message: `API 源 "${newSource.name}" 已添加并加载`,
          color: 'green'
        });
      }
    }, 100);

    setNewName('');
    setNewUrl('');
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Use filename without extension as name
      const name = file.name.replace(/\.[^/.]+$/, '');
      addLocalSource(name, data);

      // Sync to API Store
      syncFromApiCenter();

      notifications.show({
        title: '上传成功',
        message: `API 文件 "${name}" 已添加`,
        color: 'green'
      });
    } catch (error: any) {
      notifications.show({
        title: '上传失败',
        message: error.message || '无法解析 JSON 文件',
        color: 'red'
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sortedSources);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    reorderSources(items.map(item => item.id));

    // Reload all enabled sources after reordering to ensure correct priority
    await loadAllEnabledSources();

    // Sync to API Store after reordering and reloading
    syncFromApiCenter();

    notifications.show({
      title: '顺序已更新',
      message: 'API 源顺序已调整并重新加载',
      color: 'blue'
    });
  };

  const handleLoadAll = async () => {
    await loadAllEnabledSources();
    // Sync to API Store after loading
    syncFromApiCenter();

    // Show notification
    const enabledSources = sources.filter(s => s.enabled);
    const successCount = enabledSources.filter(s => s.status === 'success').length;
    const errorCount = enabledSources.filter(s => s.status === 'error').length;

    if (errorCount === 0) {
      notifications.show({
        title: '全部更新成功',
        message: `成功更新 ${successCount} 个 API 源`,
        color: 'green'
      });
    } else if (successCount > 0) {
      notifications.show({
        title: '部分更新成功',
        message: `成功: ${successCount} 个，失败: ${errorCount} 个`,
        color: 'yellow'
      });
    } else {
      notifications.show({
        title: '更新失败',
        message: `${errorCount} 个 API 源更新失败`,
        color: 'red'
      });
    }
  };

  const handleLoadSingle = async (id: string) => {
    await loadSource(id);
    // Sync to API Store after loading
    syncFromApiCenter();

    // Show notification
    const source = sources.find(s => s.id === id);
    if (source) {
      if (source.status === 'success') {
        notifications.show({
          title: '更新成功',
          message: `API 源 "${source.name}" 已更新`,
          color: 'green'
        });
      } else if (source.status === 'error') {
        notifications.show({
          title: '更新失败',
          message: source.error || '无法加载 API',
          color: 'red'
        });
      }
    }
  };

  const handleToggle = async (id: string) => {
    const source = sources.find(s => s.id === id);
    const wasEnabled = source?.enabled;

    toggleSource(id);

    // If we just enabled a source, load it
    if (!wasEnabled) {
      await loadSource(id);
      notifications.show({
        title: '源已启用',
        message: `API 源 "${source?.name}" 已启用并加载`,
        color: 'green'
      });
    } else {
      notifications.show({
        title: '源已禁用',
        message: `API 源 "${source?.name}" 已禁用`,
        color: 'gray'
      });
    }

    // Sync to API Store after toggling
    syncFromApiCenter();
  };

  const getStatusBadge = (source: ApiSource) => {
    switch (source.status) {
      case 'loading':
        return <Badge size="sm" color="blue" leftSection={<Loader size={10} />}>加载中</Badge>;
      case 'success':
        return <Badge size="sm" color="green" leftSection={<IconCheck size={12} />}>成功</Badge>;
      case 'error':
        return <Badge size="sm" color="red" leftSection={<IconAlertCircle size={12} />}>失败</Badge>;
      default:
        return <Badge size="sm" color="gray">未加载</Badge>;
    }
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>API 中心</Title>
            <Text size="sm" c="dimmed" mt={4}>
              管理任务目标和对话组件的 API 定义源
            </Text>
          </div>
          <Button
            size="sm"
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={handleLoadAll}
          >
            更新所有已启用的源
          </Button>
        </Group>

        {/* Add New Source */}
        <Paper p="lg" withBorder>
          <Stack gap="md">
            <Title order={4}>添加新的 API 源</Title>

            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List>
                <Tabs.Tab value="url" leftSection={<IconLink size={14} />}>
                  网络 URL
                </Tabs.Tab>
                <Tabs.Tab value="file" leftSection={<IconUpload size={14} />}>
                  本地文件
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="url" pt="md">
                <Stack gap="sm">
                  <Text size="sm" c="dimmed">
                    从网络 URL 加载 API 定义。支持 HTTP/HTTPS 协议。
                  </Text>
                  <Group align="flex-end">
                    <TextInput
                      label="名称"
                      placeholder="My API"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <TextInput
                      label="URL"
                      placeholder="https://example.com/api.json"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      style={{ flex: 2 }}
                    />
                    <Button
                      leftSection={<IconPlus size={16} />}
                      onClick={handleAdd}
                      disabled={!newName.trim() || !newUrl.trim()}
                    >
                      添加
                    </Button>
                  </Group>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="file" pt="md">
                <Stack gap="sm">
                  <Text size="sm" c="dimmed">
                    上传本地 JSON 格式的 API 定义文件。文件名将作为源名称。上传后的数据会持久化保存在本地浏览器中。
                  </Text>
                  <FileButton onChange={handleFileUpload} accept=".json">
                    {(props) => (
                      <Button {...props} leftSection={<IconUpload size={16} />} size="lg">
                        选择文件上传
                      </Button>
                    )}
                  </FileButton>
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Paper>

        {/* API Sources List */}
        <Paper p="lg" withBorder>
          <Stack gap="md">
            <Title order={4}>API 源列表</Title>
            <Text size="sm" c="dimmed">
              拖拽源来调整加载顺序。后加载的源会覆盖先加载源中的同名定义。
            </Text>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="api-sources">
                {(provided) => (
                  <Stack
                    gap="sm"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {sortedSources.map((source, index) => (
                      <Draggable key={source.id} draggableId={source.id} index={index}>
                        {(provided, snapshot) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            p="md"
                            withBorder
                            style={{
                              ...provided.draggableProps.style,
                              backgroundColor: snapshot.isDragging ? 'var(--mantine-color-dark-6)' : undefined,
                              opacity: source.enabled ? 1 : 0.5
                            }}
                          >
                            <Group justify="space-between" wrap="nowrap">
                              <Group gap="md" style={{ flex: 1 }}>
                                <div {...provided.dragHandleProps}>
                                  <IconGripVertical size={20} style={{ cursor: 'grab', color: 'var(--mantine-color-gray-6)' }} />
                                </div>
                                <Stack gap={4} style={{ flex: 1 }}>
                                  <Group gap="xs">
                                    <Text size="sm" fw={600}>{source.name}</Text>
                                    {getStatusBadge(source)}
                                    {source.id === 'default' && (
                                      <Badge size="xs" variant="outline">默认</Badge>
                                    )}
                                    {source.isLocal && (
                                      <Badge size="xs" variant="light" color="cyan">本地</Badge>
                                    )}
                                  </Group>
                                  {source.url ? (
                                    <Text size="xs" c="dimmed" lineClamp={1}>{source.url}</Text>
                                  ) : (
                                    <Text size="xs" c="dimmed" fs="italic">本地上传的文件</Text>
                                  )}
                                  {source.error && (
                                    <Alert icon={<IconAlertCircle size={14} />} color="red" p="xs" mt="xs">
                                      <Text size="xs">{source.error}</Text>
                                    </Alert>
                                  )}
                                  {source.lastLoaded && (
                                    <Text size="xs" c="dimmed">
                                      最后加载: {new Date(source.lastLoaded).toLocaleString('zh-CN')}
                                    </Text>
                                  )}
                                </Stack>
                              </Group>

                              <Group gap="xs">
                                <Switch
                                  checked={source.enabled}
                                  onChange={() => handleToggle(source.id)}
                                  label={source.enabled ? '启用' : '禁用'}
                                />
                                {!source.isLocal && (
                                  <Tooltip label="更新此源">
                                    <ActionIcon
                                      variant="light"
                                      color="blue"
                                      onClick={() => handleLoadSingle(source.id)}
                                      loading={source.status === 'loading'}
                                    >
                                      <IconRefresh size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                                {source.id !== 'default' && (
                                  <Tooltip label="删除">
                                    <ActionIcon
                                      variant="light"
                                      color="red"
                                      onClick={() => removeSource(source.id)}
                                    >
                                      <IconTrash size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                              </Group>
                            </Group>
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Stack>
                )}
              </Droppable>
            </DragDropContext>

            {sortedSources.length === 0 && (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                暂无 API 源，请添加一个
              </Text>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
