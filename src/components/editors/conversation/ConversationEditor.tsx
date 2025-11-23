import { Box, Button, Drawer, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCode } from '@tabler/icons-react';
import { useProjectStore } from '@/store/useProjectStore';
import FlowCanvas from './FlowCanvas';
import YamlPreview from '@/components/common/YamlPreview';

interface ConversationEditorProps {
  fileId: string;
}

export default function ConversationEditor({ fileId }: ConversationEditorProps) {
  // 只订阅当前文件
  const file = useProjectStore((state) => state.conversationFiles[fileId]);
  const [opened, { open, close }] = useDisclosure(false);

  if (!file) return null;

  return (
    <Box h="100%" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <Group p="xs" justify="space-between" bg="var(--mantine-color-dark-7)" style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}>
        <Text size="sm" fw={700}>{file.name}</Text>
        <Button variant="subtle" size="xs" leftSection={<IconCode size={16} />} onClick={open}>
            查看 YAML
        </Button>
      </Group>

      <Box style={{ flex: 1, overflow: 'hidden' }}>
        <FlowCanvas fileId={fileId} />
      </Box>

      <Drawer 
        opened={opened} 
        onClose={close} 
        position="right" 
        size="xl" 
        title="YAML 预览"
        styles={{ body: { height: 'calc(100% - 60px)', padding: 0 } }}
      >
        <YamlPreview value={file.content} />
      </Drawer>
    </Box>
  );
}
