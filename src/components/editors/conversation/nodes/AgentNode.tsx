import { Handle, Position, NodeProps } from 'reactflow';
import { Card, Text, Stack, Box, ThemeIcon, Group } from '@mantine/core';
import { IconMessage } from '@tabler/icons-react';

export type AgentNodeData = {
  label: string;
  npcLines: string[];
  playerOptions: {
    id: string; // internal id for the option (index or uuid)
    text: string;
    target?: string; // store original 'then' script
  }[];
};

export default function AgentNode({ data, selected }: NodeProps<AgentNodeData>) {
  return (
    <Card 
      shadow="md" 
      p={0} 
      radius="md" 
      withBorder 
      style={{ 
        width: 280,
        borderColor: selected ? 'var(--mantine-color-blue-5)' : 'var(--mantine-color-dark-4)',
        borderWidth: selected ? 2 : 1,
        overflow: 'visible',
        backgroundColor: 'var(--mantine-color-dark-7)',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Input Handle - Placed at the header level to indicate entry point */}
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ 
            width: 10, 
            height: 20, 
            borderRadius: '4px 0 0 4px',
            left: -12,
            top: 24, // Align with header center
            background: 'var(--mantine-color-blue-5)',
            border: 'none',
            zIndex: 10
        }} 
      >
        {/* Visual arrow indicator */}
        <div style={{ 
            position: 'absolute', 
            left: -4, 
            top: '50%', 
            transform: 'translateY(-50%)',
            width: 0, 
            height: 0, 
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderLeft: '8px solid var(--mantine-color-blue-5)'
        }} />
      </Handle>

      {/* Header */}
      <Box 
        bg="var(--mantine-color-dark-6)" 
        p="xs" 
        h={48}
        style={{ 
            borderBottom: '1px solid var(--mantine-color-dark-5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}
      >
        <Group gap="xs">
            <ThemeIcon size="sm" radius="md" color="blue" variant="light">
                <IconMessage size={14} />
            </ThemeIcon>
            <Text fw={700} size="sm" c="white" lineClamp={1}>{data.label}</Text>
        </Group>
      </Box>

      <Stack gap={0}>
        {/* NPC Section */}
        <Box p="sm" bg="var(--mantine-color-dark-7)">
            <Stack gap={6}>
                {data.npcLines && data.npcLines.length > 0 ? (
                    data.npcLines.map((line, index) => (
                        <Box 
                            key={index} 
                            bg="var(--mantine-color-dark-6)" 
                            p="xs" 
                            style={{ borderRadius: 6, borderTopLeftRadius: 0 }}
                        >
                            <Text size="xs" c="gray.3" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                                {line}
                            </Text>
                        </Box>
                    ))
                ) : (
                    <Text size="xs" c="dimmed" fs="italic">No content...</Text>
                )}
            </Stack>
        </Box>

        {/* Player Section */}
        <Box bg="var(--mantine-color-dark-8)" style={{ borderTop: '1px solid var(--mantine-color-dark-5)' }}>
            <Stack gap={0}>
                {data.playerOptions && data.playerOptions.length > 0 ? (
                    data.playerOptions.map((option, index) => (
                        <Box 
                            key={option.id} 
                            p="xs"
                            style={{ 
                                position: 'relative', 
                                borderTop: index > 0 ? '1px solid var(--mantine-color-dark-6)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end'
                            }}
                        >
                            <Text size="xs" c="gray.4" mr={16} ta="right">{option.text || '(Empty)'}</Text>
                            
                            {/* Output Handle */}
                            <Handle 
                                type="source" 
                                position={Position.Right} 
                                id={option.id}
                                style={{ 
                                    right: -12, 
                                    width: 10, 
                                    height: 20, 
                                    borderRadius: '0 4px 4px 0',
                                    background: 'var(--mantine-color-green-6)',
                                    border: 'none',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }} 
                            >
                                <div style={{ 
                                    position: 'absolute', 
                                    right: -4, 
                                    top: '50%', 
                                    transform: 'translateY(-50%)',
                                    width: 0, 
                                    height: 0, 
                                    borderTop: '6px solid transparent',
                                    borderBottom: '6px solid transparent',
                                    borderLeft: '8px solid var(--mantine-color-green-6)'
                                }} />
                            </Handle>
                        </Box>
                    ))
                ) : (
                    <Box p="xs">
                        <Text size="xs" c="dimmed" fs="italic" ta="center">End of conversation</Text>
                    </Box>
                )}
            </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
