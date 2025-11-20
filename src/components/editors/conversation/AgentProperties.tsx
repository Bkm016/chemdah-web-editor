import { Stack, TextInput, Textarea, Button, Group, Text, ActionIcon, Divider, Box } from '@mantine/core';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { Node } from 'reactflow';
import { AgentNodeData } from './nodes/AgentNode';

interface AgentPropertiesProps {
  node: Node<AgentNodeData>;
  onChange: (id: string, data: AgentNodeData) => void;
}

export default function AgentProperties({ node, onChange }: AgentPropertiesProps) {
  const data = node.data;

  const handleLabelChange = (val: string) => {
    onChange(node.id, { ...data, label: val });
  };

  const handleNpcLinesChange = (val: string) => {
    // Split by newline to get array
    const lines = val.split('\n');
    onChange(node.id, { ...data, npcLines: lines });
  };

  const handleOptionChange = (idx: number, field: 'text', val: string) => {
    const newOptions = [...data.playerOptions];
    newOptions[idx] = { ...newOptions[idx], [field]: val };
    onChange(node.id, { ...data, playerOptions: newOptions });
  };

  const addOption = () => {
    const newOptions = [
        ...data.playerOptions, 
        { id: `${node.id}-opt-${Date.now()}`, text: 'New Option' }
    ];
    onChange(node.id, { ...data, playerOptions: newOptions });
  };

  const removeOption = (idx: number) => {
    const newOptions = [...data.playerOptions];
    newOptions.splice(idx, 1);
    onChange(node.id, { ...data, playerOptions: newOptions });
  };

  return (
    <Stack gap="md" p="md" h="100%" style={{ overflowY: 'auto' }}>
      <Box>
        <Text size="xs" fw={700} c="dimmed" mb={4}>NODE ID</Text>
        <TextInput 
            value={data.label} 
            onChange={(e) => handleLabelChange(e.currentTarget.value)} 
            description="Unique identifier for this conversation node"
        />
      </Box>

      <Divider />

      <Box>
        <Text size="xs" fw={700} c="dimmed" mb={4}>NPC LINES</Text>
        <Textarea 
            value={data.npcLines.join('\n')} 
            onChange={(e) => handleNpcLinesChange(e.currentTarget.value)}
            autosize
            minRows={3}
            placeholder="Enter NPC dialogue here..."
        />
        <Text size="xs" c="dimmed" mt={4}>One line per message bubble.</Text>
      </Box>

      <Divider />

      <Box>
        <Group justify="space-between" mb="xs">
            <Text size="xs" fw={700} c="dimmed">PLAYER OPTIONS</Text>
            <Button size="xs" variant="subtle" leftSection={<IconPlus size={12} />} onClick={addOption}>
                Add Option
            </Button>
        </Group>
        
        <Stack gap="xs">
            {data.playerOptions.map((opt, idx) => (
                <Group key={opt.id} gap="xs">
                    <TextInput 
                        style={{ flex: 1 }}
                        size="xs"
                        value={opt.text}
                        onChange={(e) => handleOptionChange(idx, 'text', e.currentTarget.value)}
                    />
                    <ActionIcon color="red" variant="subtle" size="sm" onClick={() => removeOption(idx)}>
                        <IconTrash size={14} />
                    </ActionIcon>
                </Group>
            ))}
            {data.playerOptions.length === 0 && (
                <Text size="xs" c="dimmed" fs="italic">No options defined. Conversation will end here.</Text>
            )}
        </Stack>
      </Box>
    </Stack>
  );
}
