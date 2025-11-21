import { Modal, Tabs, Stack, Button, ActionIcon, Text, Box, ScrollArea, Title, Group, Accordion, Badge, ThemeIcon, Select } from '@mantine/core';
import { IconMessage, IconUser, IconScript, IconSettings, IconPlus, IconTrash, IconGitBranch, IconPuzzle } from '@tabler/icons-react';
import { FormSection, FormInput, FormTextarea, AnimatedTabs, FormScript } from '../../ui';
import { AgentEditor } from '../quest/AgentEditor';
import { AgentNodeData } from './nodes/AgentNode';
import { SwitchNodeData } from './nodes/SwitchNode';
import { useGlobalIdCheck } from './useGlobalIdCheck';
import { useApiStore } from '@/store/useApiStore';
import { DynamicComponentField } from '../quest/dynamic/DynamicComponentField';

interface ConversationNodeEditorProps {
    opened: boolean;
    onClose: () => void;
    data: any; // AgentNodeData | SwitchNodeData
    type?: 'agent' | 'switch';
    onUpdate: (newData: any) => void;
    fileId: string;
    existingIds?: string[];
}

export function ConversationNodeEditor({ opened, onClose, data, type = 'agent', onUpdate, fileId, existingIds = [] }: ConversationNodeEditorProps) {
    const { checkDuplicate } = useGlobalIdCheck(fileId);
    const { apiData } = useApiStore();

    const conversationNodeComponents = apiData.conversationNodeComponents || [];
    const conversationPlayerOptionComponents = apiData.conversationPlayerOptionComponents || [];

    const globalDuplicates = checkDuplicate(data.label);
    const isDuplicateInCurrentFile = existingIds.includes(data.label);
    
    const error = globalDuplicates 
        ? `此 ID 已在以下文件中使用: ${globalDuplicates.join(', ')}` 
        : (isDuplicateInCurrentFile ? '此 ID 已在当前文件中使用' : undefined);

    // --- Agent Node Handlers ---
    const handleOptionChange = (idx: number, field: keyof AgentNodeData['playerOptions'][0], val: string) => {
        const newOptions = [...data.playerOptions];
        newOptions[idx] = { ...newOptions[idx], [field]: val };
        onUpdate({ ...data, playerOptions: newOptions });
    };

    const addOption = () => {
        const newOptions = [
            ...data.playerOptions, 
            { id: `${data.label}-opt-${Date.now()}`, text: 'New Option' }
        ];
        onUpdate({ ...data, playerOptions: newOptions });
    };

    const removeOption = (idx: number) => {
        const newOptions = [...data.playerOptions];
        newOptions.splice(idx, 1);
        onUpdate({ ...data, playerOptions: newOptions });
    };

    // --- Switch Node Handlers ---
    const handleBranchChange = (idx: number, field: keyof SwitchNodeData['branches'][0], val: string) => {
        const newBranches = [...data.branches];
        newBranches[idx] = { ...newBranches[idx], [field]: val };
        onUpdate({ ...data, branches: newBranches });
    };

    const addBranch = () => {
        const newBranches = [
            ...(data.branches || []), 
            { id: `${data.label}-branch-${Date.now()}`, condition: 'true', actionType: 'run', actionValue: '' }
        ];
        onUpdate({ ...data, branches: newBranches });
    };

    const removeBranch = (idx: number) => {
        const newBranches = [...data.branches];
        newBranches.splice(idx, 1);
        onUpdate({ ...data, branches: newBranches });
    };

    const renderAgentEditor = () => (
        <AnimatedTabs
            defaultValue="basic"
            keepMounted={false}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            tabs={[
                { value: 'basic', label: '基础设置', icon: <IconSettings size={14} /> },
                { value: 'npc', label: 'NPC 对话', icon: <IconMessage size={14} /> },
                { value: 'player', label: '玩家选项', icon: <IconUser size={14} /> },
                { value: 'agent', label: '脚本代理', icon: <IconScript size={14} /> },
                { value: 'custom', label: '自定义组件', icon: <IconPuzzle size={14} /> }
            ]}
        >
            <ScrollArea style={{ flex: 1 }} bg="var(--mantine-color-dark-8)">
                <Box p="md">
                    <Tabs.Panel value="basic">
                        <Stack gap="md">
                            <FormSection>
                                <Title order={5} mb="xs">节点信息</Title>
                                <FormInput 
                                    label="节点 ID" 
                                    description="对话节点的唯一标识符"
                                    value={data.label} 
                                    onChange={(e) => onUpdate({ ...data, label: e.currentTarget.value })} 
                                    error={error}
                                />
                            </FormSection>
                            <FormSection>
                                <Title order={5} mb="xs">触发条件</Title>
                                <FormInput 
                                    label="NPC ID" 
                                    description="绑定触发此对话的 NPC ID (仅在入口节点需要)"
                                    placeholder="e.g. adyeshach test2"
                                    value={data.npcId || ''} 
                                    onChange={(e) => onUpdate({ ...data, npcId: e.currentTarget.value })} 
                                />
                                <FormScript 
                                    label="进入条件" 
                                    description="进入此节点所需的条件 (Kether 脚本)"
                                    height="100px"
                                    value={data.condition || ''} 
                                    onChange={(val) => onUpdate({ ...data, condition: val || '' })} 
                                />
                            </FormSection>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="npc">
                        <Stack gap="md">
                            <FormSection>
                                <Title order={5} mb="xs">NPC 发言内容</Title>
                                <FormTextarea 
                                    minRows={5}
                                    value={data.npcLines?.join('\n') || ''} 
                                    onChange={(e) => onUpdate({ ...data, npcLines: e.currentTarget.value.split('\n') })}
                                />
                            </FormSection>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="player">
                        <Stack gap="md">
                            <Accordion variant="separated" radius="md">
                                {data.playerOptions?.map((opt: any, idx: number) => (
                                    <Accordion.Item key={opt.id} value={opt.id}>
                                        <Accordion.Control>
                                            <Group justify="space-between" pr="md">
                                                <Group gap="sm">
                                                    <Text fw={500}>{opt.text || `选项 #${idx + 1}`}</Text>
                                                    {opt.condition && <Badge size="xs" variant="outline" color="blue">Condition</Badge>}
                                                    {opt.actions && <Badge size="xs" variant="outline" color="orange">Script</Badge>}
                                                </Group>
                                                <Box
                                                    component="div"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeOption(idx);
                                                    }}
                                                    style={{
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: 4,
                                                        color: 'var(--mantine-color-red-6)',
                                                        transition: 'background-color 0.1s ease'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mantine-color-red-9)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                                >
                                                    <IconTrash size={16} />
                                                </Box>
                                            </Group>
                                        </Accordion.Control>
                                        <Accordion.Panel>
                                            <Stack gap="sm">
                                        <FormInput
                                            label="回复文本"
                                            placeholder="玩家点击的按钮文本"
                                            value={opt.text}
                                            onChange={(e) => handleOptionChange(idx, 'text', e.currentTarget.value)}
                                        />
                                        <FormScript
                                            label="显示条件 (if)"
                                            height="80px"
                                            value={opt.condition || ''}
                                            onChange={(val) => handleOptionChange(idx, 'condition', val || '')}
                                        />
                                                <FormScript
                                                    label="执行动作 (then)"
                                                    description="点击后执行的脚本"
                                                    height="100px"
                                                    value={opt.actions || ''}
                                                    onChange={(val) => handleOptionChange(idx, 'actions', val || '')}
                                                />

                                                {/* 渲染玩家选项自定义组件 - 直接显示字段 */}
                                                {conversationPlayerOptionComponents.map(component => (
                                                    <Box key={component.id}>
                                                        <Text size="sm" fw={500} mb="xs" c="dimmed">
                                                            {component.name} ({component.id})
                                                        </Text>
                                                        {component.fields.map((field) => (
                                                            <DynamicComponentField
                                                                key={field.name}
                                                                field={field}
                                                                value={(() => {
                                                                    const keys = field.name.split('.');
                                                                    let value = opt;
                                                                    for (const key of keys) {
                                                                        if (value === undefined || value === null) return undefined;
                                                                        value = value[key];
                                                                    }
                                                                    return value;
                                                                })()}
                                                                onChange={(value) => {
                                                                    const keys = field.name.split('.');
                                                                    const newOption = { ...opt };
                                                                    let current: any = newOption;
                                                                    for (let i = 0; i < keys.length - 1; i++) {
                                                                        const key = keys[i];
                                                                        if (!current[key]) {
                                                                            current[key] = {};
                                                                        } else {
                                                                            current[key] = { ...current[key] };
                                                                        }
                                                                        current = current[key];
                                                                    }
                                                                    const lastKey = keys[keys.length - 1];
                                                                    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                                                                        delete current[lastKey];
                                                                    } else {
                                                                        current[lastKey] = value;
                                                                    }
                                                                    const newOptions = [...data.playerOptions];
                                                                    newOptions[idx] = newOption;
                                                                    onUpdate({ ...data, playerOptions: newOptions });
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Accordion.Panel>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                            
                            <Button variant="light" leftSection={<IconPlus size={16} />} onClick={addOption} fullWidth>
                                添加回复选项
                            </Button>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="agent">
                        <FormSection>
                            <Title order={5} mb="xs">生命周期脚本</Title>
                            <AgentEditor
                                data={data.agent || {}}
                                onUpdate={(newAgent) => onUpdate({ ...data, agent: newAgent })}
                                types={['begin', 'end', 'refuse']}
                            />
                        </FormSection>
                    </Tabs.Panel>

                    <Tabs.Panel value="custom">
                        <Stack gap="md">
                            <Title order={4}>自定义节点组件</Title>
                            {conversationNodeComponents.length > 0 ? (
                                conversationNodeComponents.map(component => (
                                    <FormSection key={component.id}>
                                        <Title order={5} mb="xs">{component.name} ({component.id})</Title>
                                        <Text size="xs" c="dimmed" mb="sm">{component.category}</Text>
                                        <Stack gap="sm">
                                            {component.fields.map((field) => (
                                                <DynamicComponentField
                                                    key={field.name}
                                                    field={field}
                                                    value={(() => {
                                                        const keys = field.name.split('.');
                                                        let value = data;
                                                        for (const key of keys) {
                                                            if (value === undefined || value === null) return undefined;
                                                            value = value[key];
                                                        }
                                                        return value;
                                                    })()}
                                                    onChange={(value) => {
                                                        const keys = field.name.split('.');
                                                        const newData = { ...data };
                                                        let current: any = newData;
                                                        for (let i = 0; i < keys.length - 1; i++) {
                                                            const key = keys[i];
                                                            if (!current[key]) {
                                                                current[key] = {};
                                                            } else {
                                                                current[key] = { ...current[key] };
                                                            }
                                                            current = current[key];
                                                        }
                                                        const lastKey = keys[keys.length - 1];
                                                        if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
                                                            delete current[lastKey];
                                                        } else {
                                                            current[lastKey] = value;
                                                        }
                                                        onUpdate(newData);
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </FormSection>
                                ))
                            ) : (
                                <Text c="dimmed" ta="center" py="xl">
                                    暂无自定义组件。可以通过导入 API 定义来添加自定义组件。
                                </Text>
                            )}
                        </Stack>
                    </Tabs.Panel>
                </Box>
            </ScrollArea>
        </AnimatedTabs>
    );

    const renderSwitchEditor = () => (
        <AnimatedTabs
            defaultValue="basic"
            keepMounted={false}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
            tabs={[
                { value: 'basic', label: '基础设置', icon: <IconSettings size={14} /> },
                { value: 'branches', label: '分支条件', icon: <IconGitBranch size={14} /> }
            ]}
        >
            <ScrollArea style={{ flex: 1 }} bg="var(--mantine-color-dark-8)">
                <Box p="md">
                    <Tabs.Panel value="basic">
                        <Stack gap="md">
                            <FormSection>
                                <Title order={5} mb="xs">节点信息</Title>
                                <FormInput 
                                    label="节点 ID" 
                                    description="对话节点的唯一标识符"
                                    value={data.label} 
                                    onChange={(e) => onUpdate({ ...data, label: e.currentTarget.value })} 
                                    error={error}
                                />
                            </FormSection>
                            <FormSection>
                                <Title order={5} mb="xs">触发条件</Title>
                                <FormInput 
                                    label="NPC ID" 
                                    description="绑定触发此对话的 NPC ID"
                                    placeholder="e.g. adyeshach test2"
                                    required
                                    error={!data.npcId ? "NPC ID 是必填项" : undefined}
                                    value={data.npcId || ''} 
                                    onChange={(e) => onUpdate({ ...data, npcId: e.currentTarget.value })} 
                                />
                            </FormSection>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="branches">
                        <Stack gap="md">
                            <Accordion variant="separated" radius="md">
                                {data.branches?.map((branch: any, idx: number) => (
                                    <Accordion.Item key={branch.id} value={branch.id}>
                                        <Accordion.Control>
                                            <Group justify="space-between" pr="md">
                                                <Group gap="sm">
                                                    <Badge size="xs" variant="outline" color="gray">IF</Badge>
                                                    <Text fw={500} size="sm" style={{ fontFamily: 'monospace' }}>{branch.condition}</Text>
                                                    <Badge size="xs" color={branch.actionType === 'open' ? 'blue' : 'yellow'}>
                                                        {branch.actionType === 'open' ? 'OPEN' : 'RUN'}
                                                    </Badge>
                                                </Group>
                                                <ActionIcon 
                                                    color="red" 
                                                    variant="subtle" 
                                                    size="sm" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeBranch(idx);
                                                    }}
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Group>
                                        </Accordion.Control>
                                        <Accordion.Panel>
                                            <Stack gap="sm">
                                                <FormScript 
                                                    label="判断条件 (if)"
                                                    height="80px"
                                                    value={branch.condition || ''}
                                                    onChange={(val) => handleBranchChange(idx, 'condition', val || '')}
                                                />
                                                <Stack gap="xs">
                                                    <Select
                                                        label="动作类型"
                                                        data={[
                                                            { value: 'open', label: '打开对话 (Open)' },
                                                            { value: 'run', label: '运行脚本 (Run)' }
                                                        ]}
                                                        value={branch.actionType}
                                                        onChange={(val) => {
                                                            const newBranches = [...data.branches];
                                                            newBranches[idx] = { 
                                                                ...newBranches[idx], 
                                                                actionType: val || 'run',
                                                                actionValue: ''
                                                            };
                                                            onUpdate({ ...data, branches: newBranches });
                                                        }}
                                                    />
                                                    {branch.actionType === 'run' ? (
                                                        <FormScript
                                                            label="脚本内容"
                                                            height="100px"
                                                            value={branch.actionValue}
                                                            onChange={(val) => handleBranchChange(idx, 'actionValue', val || '')}
                                                        />
                                                    ) : (
                                                        <Box>
                                                            <Text size="sm" fw={500} mb={4}>目标对话</Text>
                                                            <Text size="xs" c="dimmed" fs="italic" mt={8}>
                                                                请在画板上连接目标节点
                                                            </Text>
                                                        </Box>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </Accordion.Panel>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                            
                            <Button variant="light" leftSection={<IconPlus size={16} />} onClick={addBranch} fullWidth>
                                添加分支
                            </Button>
                        </Stack>
                    </Tabs.Panel>
                </Box>
            </ScrollArea>
        </AnimatedTabs>
    );

    return (
        <Modal 
            opened={opened} 
            onClose={onClose} 
            withCloseButton={false}
            title={
                <Group className='p-4'>
                    <ThemeIcon size="lg" variant="light" color={type === 'switch' ? 'violet' : 'blue'}>
                        {type === 'switch' ? <IconGitBranch size={20} /> : <IconMessage size={20} />}
                    </ThemeIcon>
                    <Stack gap={0}>
                        <Text fw={700} size="sm">编辑{type === 'switch' ? '分支' : '对话'}节点</Text>
                        <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>{data.label}</Text>
                    </Stack>
                </Group>
            }
            size="xl"
            padding={0}
            styles={{ body: { height: '70vh', display: 'flex', flexDirection: 'column' } }}
        >
            {type === 'switch' ? renderSwitchEditor() : renderAgentEditor()}
        </Modal>
    );
}

