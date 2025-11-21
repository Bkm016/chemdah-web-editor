import { Handle, Position, NodeProps } from 'reactflow';
import { Card, Text, Stack, Box, ThemeIcon, Group, Badge } from '@mantine/core';
import { IconMessage, IconMapPin } from '@tabler/icons-react';

export type AgentNodeData = {
  label: string;
  npcId?: string;
  condition?: string;
  npcLines: string[];
  agent?: {
    begin?: string;
    end?: string;
    refuse?: string;
  };
  playerOptions: {
    id: string;
    text: string;
    condition?: string; // 'if' field
    actions?: string; // script before goto
    next?: string; // target node ID extracted from goto
  }[];
};

export default function AgentNode({ data, selected }: NodeProps<AgentNodeData>) {
  const isEntry = !!data.npcId;

  return (
    <Card
      shadow="md"
      p={0}
      radius="md"
      withBorder
      className="conversation-node-card"
      style={{
        width: 280,
        borderColor: selected ? 'var(--mantine-color-blue-5)' : (isEntry ? 'var(--mantine-color-orange-6)' : 'var(--mantine-color-dark-4)'),
        borderWidth: 2,
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
            zIndex: 100
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
        bg={isEntry ? "rgba(253, 126, 20, 0.15)" : "var(--mantine-color-dark-6)"}
        p="xs"
        h={48}
        className="conversation-node-header"
        style={{
            borderBottom: '1px solid var(--mantine-color-dark-5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}
      >
        <Group gap="xs">
            <ThemeIcon size="sm" radius="md" color={isEntry ? "orange" : "blue"} variant="light">
                {isEntry ? <IconMapPin size={14} /> : <IconMessage size={14} />}
            </ThemeIcon>
            <Stack gap={0}>
                <Text fw={700} size="sm" className="conversation-node-title" lineClamp={1}>{data.label}</Text>
                {isEntry && <Text size="xs" c="orange.3" style={{ lineHeight: 1, fontSize: 10 }}>入口: {data.npcId}</Text>}
            </Stack>
        </Group>
        {isEntry && <Badge size="xs" variant="light" color="orange">ENTRY</Badge>}
      </Box>

      <Stack gap={0}>
        {/* NPC Section */}
        <Box p="sm" bg="var(--mantine-color-dark-7)" className="conversation-npc-section">
            <Stack gap={6}>
                {data.npcLines && data.npcLines.length > 0 ? (
                    data.npcLines.map((line, index) => (
                        <Box
                            key={index}
                            bg="var(--mantine-color-dark-6)"
                            p="xs"
                            className="conversation-npc-bubble"
                            style={{ borderRadius: 6, borderTopLeftRadius: 0 }}
                        >
                            <Text size="xs" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                                {line}
                            </Text>
                        </Box>
                    ))
                ) : (
                    <Text size="xs" c="dimmed" fs="italic">无内容...</Text>
                )}
            </Stack>
        </Box>

        {/* Player Section */}
        <Box bg="var(--mantine-color-dark-8)" className="conversation-player-section" style={{ borderTop: '1px solid var(--mantine-color-dark-5)', position: 'relative', zIndex: 1 }}>
            <Stack gap={0}>
                {data.playerOptions && data.playerOptions.length > 0 ? (
                    data.playerOptions.map((option, index) => (
                        <Box
                            key={option.id}
                            p="xs"
                            className="conversation-player-option"
                            style={{
                                position: 'relative',
                                borderTop: index > 0 ? '1px solid var(--mantine-color-dark-6)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                zIndex: 1
                            }}
                        >
                            <Text size="xs" mr={16} ta="right">{option.text || '(Empty)'}</Text>

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
                                    transform: 'translateY(-50%)',
                                    zIndex: 100
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
