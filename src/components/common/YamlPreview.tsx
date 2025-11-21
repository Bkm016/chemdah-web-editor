import Editor from '@monaco-editor/react';
import { Paper, Title, Box } from '@mantine/core';
import { useThemeStore } from '../../store/useThemeStore';

interface YamlPreviewProps {
  value: string;
  title?: string | null;
}

export default function YamlPreview({ value, title = 'Preview' }: YamlPreviewProps) {
  const { colorScheme } = useThemeStore();

  return (
    <Paper p="0" radius="md" withBorder h="100%" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {title && (
        <Box p="xs" bg="var(--mantine-color-dark-6)" style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
            <Title order={5} size="sm">{title}</Title>
        </Box>
      )}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          defaultLanguage="yaml"
          value={value}
          theme={colorScheme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            readOnly: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true
          }}
        />
      </div>
    </Paper>
  );
}
