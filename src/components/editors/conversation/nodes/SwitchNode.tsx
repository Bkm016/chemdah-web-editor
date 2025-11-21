import { useEffect } from 'react';
import { Handle, Position, NodeProps, useUpdateNodeInternals } from 'reactflow';
import { Card, Text, Stack, Box, ThemeIcon, Group, Badge, Tooltip } from '@mantine/core';
import { IconGitBranch, IconAlertCircle } from '@tabler/icons-react';

export type SwitchNodeData = {
  label: string;
  npcId?: string;
  branches: {
    id: string;
    condition: string;
    actionType: 'open' | 'run';
    actionValue: string;
  }[];
};

export default function SwitchNode({ id, data, selected }: NodeProps<SwitchNodeData>) {
  const hasNpcId = !!data.npcId;
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [data.branches, id, updateNodeInternals]);

  return (
    <Card
      shadow="md"
      p={0}
      radius="md"
      withBorder
      className="conversation-node-card"
      style={{
        width: 280,
        borderColor: selected ? 'var(--mantine-color-violet-3)' : 'var(--mantine-color-violet-8)',
        borderWidth: 2,
        overflow: 'visible',
        backgroundColor: 'var(--mantine-color-dark-7)',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Input Handle - Switch is always an entry point conceptually, but can be linked to?
          Actually user said "Switch is definitely an entry", so maybe no input handle needed?
          But in ReactFlow, having an input handle is good for layout or if we want to chain switches.
          Let's keep it but make it subtle or standard.
      */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
            width: 10,
            height: 20,
            borderRadius: '4px 0 0 4px',
            left: -12,
            top: 24,
            background: 'var(--mantine-color-violet-8)',
            border: 'none',
            zIndex: 100
        }}
      />

      {/* Header */}
      <Box
        bg="var(--mantine-color-violet-9)"
        p="xs"
        h={48}
        className="conversation-node-header"
        style={{
            borderBottom: '1px solid var(--mantine-color-dark-5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(103, 65, 217, 0.5)'
        }}
      >
        <Group gap="xs">
            <ThemeIcon size="sm" radius="md" color="violet" variant="light">
                <IconGitBranch size={14} />
            </ThemeIcon>
            <Stack gap={0}>
                <Text fw={700} size="sm" className="conversation-node-title" lineClamp={1}>{data.label}</Text>
                {hasNpcId ? (
                    <Text size="xs" c="violet.3" style={{ lineHeight: 1, fontSize: 10 }}>NPC: {data.npcId}</Text>
                ) : (
                    <Group gap={4}>
                        <IconAlertCircle size={10} color="var(--mantine-color-red-5)" />
                        <Text size="xs" c="red.5" style={{ lineHeight: 1, fontSize: 10 }}>缺少入口配置</Text>
                    </Group>
                )}
            </Stack>
        </Group>
        <Badge size="xs" variant="filled" color="violet">SWITCH</Badge>
      </Box>

      {/* Branches Section */}
      <Box bg="var(--mantine-color-dark-8)" className="conversation-player-section" style={{ position: 'relative', zIndex: 1 }}>
        <Stack gap={0}>
            {data.branches && data.branches.length > 0 ? (
                data.branches.map((branch, index) => (
                    <Box
                        key={branch.id}
                        p="xs"
                        className="conversation-player-option"
                        style={{
                            position: 'relative',
                            borderTop: index > 0 ? '1px solid var(--mantine-color-dark-6)' : 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            zIndex: 1
                        }}
                    >
                        <Group justify="space-between" w="100%" mb={4}>
                            <Badge size="xs" variant="outline" color="gray">IF</Badge>
                            <Tooltip label={branch.condition} multiline w={200}>
                                <Text size="xs" style={{ fontFamily: 'monospace', cursor: 'help' }} lineClamp={1}>
                                    {branch.condition}
                                </Text>
                            </Tooltip>
                        </Group>

                        <Group gap={4} align="center">
                            <Text size="xs" c="dimmed">
                                {branch.actionType === 'open' ? 'Open' : 'Run'}
                            </Text>
                            {branch.actionType === 'run' && (
                                <Text size="xs" c="yellow.3" lineClamp={1} style={{ maxWidth: 150 }}>
                                    {branch.actionValue}
                                </Text>
                            )}
                        </Group>

                        {/* Output Handle - Only if actionType is 'open' (link) */}
                        {branch.actionType === 'open' && (
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={branch.id}
                                style={{
                                    right: -12,
                                    width: 10,
                                    height: 20,
                                    borderRadius: '0 4px 4px 0',
                                    background: 'var(--mantine-color-violet-5)',
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
                                    borderLeft: '8px solid var(--mantine-color-violet-5)'
                                }} />
                            </Handle>
                        )}
                    </Box>
                ))
            ) : (
                <Box p="xs">
                    <Text size="xs" c="dimmed" fs="italic" ta="center">No branches</Text>
                </Box>
            )}
        </Stack>
      </Box>
    </Card>
  );
}

