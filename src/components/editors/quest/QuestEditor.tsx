import { Box, Button, Drawer, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconCode } from '@tabler/icons-react';
import { useProjectStore } from '../../../store/useProjectStore';
import QuestForm from './QuestForm';
import YamlPreview from '../../common/YamlPreview';

interface QuestEditorProps {
  fileId: string;
}

export default function QuestEditor({ fileId }: QuestEditorProps) {
  // 只订阅当前文件,而不是整个 questFiles 对象
  const file = useProjectStore((state) => state.questFiles[fileId]);
  const [opened, { open, close }] = useDisclosure(false);

  if (!file) return null;

  return (
    <Box h="100%" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <Group p="xs" justify="space-between" bg="var(--mantine-color-dark-7)" style={{ borderBottom: '1px solid var(--mantine-color-dark-6)' }}>
        <Text size="sm" fw={700}>{file.name}</Text>
        <Button variant="subtle" size="xs" leftSection={<IconCode size={16} />} onClick={open}>
            View YAML
        </Button>
      </Group>
      
      <Box style={{ flex: 1, overflow: 'hidden' }}>
        <QuestForm fileId={fileId} />
      </Box>

      <Drawer 
        opened={opened} 
        onClose={close} 
        position="right" 
        size="xl" 
        title="YAML Preview"
        styles={{ body: { height: 'calc(100% - 60px)', padding: 0 } }}
      >
        <YamlPreview value={file.content} title={null} />
      </Drawer>
    </Box>
  );
}
