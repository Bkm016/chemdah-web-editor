import { useState } from 'react';
import {
  Modal,
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
  Tabs
} from '@mantine/core';
import { IconPlus, IconTrash, IconRefresh, IconGripVertical, IconAlertCircle, IconCheck, IconUpload, IconLink } from '@tabler/icons-react';
import { useApiCenterStore, ApiSource } from '@/store/useApiCenterStore';
import { useApiStore } from '@/store/useApiStore';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { notifications } from '@mantine/notifications';

interface ApiCenterModalProps {
  opened: boolean;
  onClose: () => void;
}

export function ApiCenterModal({ opened, onClose }: ApiCenterModalProps) {
  const { sources, addSource, addLocalSource, removeSource, toggleSource, reorderSources, loadSource, loadAllEnabledSources } = useApiCenterStore();
  const { syncFromApiCenter } = useApiStore();
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('url');

  const sortedSources = [...sources].sort((a, b) => a.order - b.order);

  const handleAdd = () => {
    if (!newName.trim() || !newUrl.trim()) return;
    addSource({
      name: newName.trim(),
      url: newUrl.trim(),
      enabled: true
    });
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(sortedSources);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    reorderSources(items.map(item => item.id));
    // Sync to API Store after reordering
    syncFromApiCenter();
  };

  const handleLoadAll = async () => {
    await loadAllEnabledSources();
    // Sync to API Store after loading
    syncFromApiCenter();
  };

  const handleLoadSingle = async (id: string) => {
    await loadSource(id);
    // Sync to API Store after loading
    syncFromApiCenter();
  };

  const handleToggle = (id: string) => {
    toggleSource(id);
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
    <Modal
      opened={opened}
      onClose={onClose}
      title="API 中心"
      size="lg"
      styles={{
        body: { minHeight: 400 }
      }}
    >
      <Stack gap="md">
        {/* Add New Source */}
        <Paper p="md" withBorder>
          <Stack gap="xs">
            <Text size="sm" fw={600}>添加新的 API 源</Text>

            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.List>
                <Tabs.Tab value="url" leftSection={<IconLink size={14} />}>
                  网络 URL
                </Tabs.Tab>
                <Tabs.Tab value="file" leftSection={<IconUpload size={14} />}>
                  本地文件
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="url" pt="xs">
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
              </Tabs.Panel>

              <Tabs.Panel value="file" pt="xs">
                <Stack gap="xs">
                  <Text size="xs" c="dimmed">
                    上传本地 JSON 格式的 API 定义文件。文件名将作为源名称。
                  </Text>
                  <FileButton onChange={handleFileUpload} accept=".json">
                    {(props) => (
                      <Button {...props} leftSection={<IconUpload size={16} />} fullWidth>
                        选择文件上传
                      </Button>
                    )}
                  </FileButton>
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Paper>

        {/* Load All Button */}
        <Group justify="space-between">
          <Text size="sm" fw={600}>API 源列表</Text>
          <Button
            size="xs"
            variant="light"
            leftSection={<IconRefresh size={14} />}
            onClick={handleLoadAll}
          >
            重新加载所有已启用的源
          </Button>
        </Group>

        {/* API Sources List */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="api-sources">
            {(provided) => (
              <Stack
                gap="xs"
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
                          <Group gap="xs" style={{ flex: 1 }}>
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
                                <Alert icon={<IconAlertCircle size={14} />} color="red" p="xs">
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
                            <Tooltip label="重新加载">
                              <ActionIcon
                                variant="light"
                                color="blue"
                                onClick={() => handleLoadSingle(source.id)}
                                loading={source.status === 'loading'}
                              >
                                <IconRefresh size={16} />
                              </ActionIcon>
                            </Tooltip>
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
    </Modal>
  );
}
