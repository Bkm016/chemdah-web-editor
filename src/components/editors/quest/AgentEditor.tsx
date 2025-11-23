import { Stack, Badge, Group, Text } from '@mantine/core';
import { FormAddon, FormScript } from '@/components/ui';

export const AGENT_TYPES = {
    // Quest Agents
    quest_accept: { 
        label: '任务接受之前', 
        tag: 'Quest Accept',
        description: '任务接受之前（包含任何可能的检测）。不代表任务已经接受，请勿实现任何不可逆的行为。返回的内容决定是否继续逻辑。' 
    },
    quest_accepted: { 
        label: '任务接受之后', 
        tag: 'Quest Accepted',
        description: '任务接受之后。' 
    },
    quest_accept_cancelled: { 
        label: '任务取消之后', 
        tag: 'Quest Accept Cancelled',
        description: '任务接受被取消之后（任何可能的方式）。' 
    },
    quest_fail: { 
        label: '任务失败之前', 
        tag: 'Quest Fail',
        description: '任务失败之前。不代表任务已经失败，请勿实现任何不可逆的行为。返回的内容决定是否继续逻辑。' 
    },
    quest_failed: { 
        label: '任务失败之后', 
        tag: 'Quest Failed',
        description: '任务失败之后。' 
    },
    quest_complete: { 
        label: '任务完成之前', 
        tag: 'Quest Complete',
        description: '任务完成之前。不代表任务已经完成，请勿实现任何不可逆的行为。返回的内容决定是否继续逻辑。' 
    },
    quest_completed: { 
        label: '任务完成之后', 
        tag: 'Quest Completed',
        description: '任务完成之后。' 
    },
    quest_restart: { 
        label: '任务重启之前', 
        tag: 'Quest Restart',
        description: '任务重启之前。不代表任务已经重启，请勿实现任何不可逆的行为。返回的内容决定是否继续逻辑。' 
    },
    quest_restarted: { 
        label: '任务重启之后', 
        tag: 'Quest Restarted',
        description: '任务重启之后。' 
    },

    // Task Agents
    task_continued: { 
        label: '条目继续之后', 
        tag: 'Task Continued',
        description: '条目继续之后。' 
    },
    task_restarted: { 
        label: '条目重置之后', 
        tag: 'Task Restarted',
        description: '条目重置之后。' 
    },
    task_completed: { 
        label: '条目完成之后', 
        tag: 'Task Completed',
        description: '条目完成之后。' 
    },

    // Conversation Agents
    begin: {
        label: '对话开始前',
        tag: 'Conversation Begin',
        description: '对话开始前执行。可用于初始化变量或检查条件。'
    },
    end: {
        label: '对话结束后',
        tag: 'Conversation End',
        description: '对话正常结束后执行。'
    },
    refuse: {
        label: '对话被拒绝时',
        tag: 'Conversation Refuse',
        description: '当对话条件不满足或被拒绝时执行。'
    }
};

interface AgentEditorProps {
    data: any;
    onUpdate: (newData: any) => void;
    types?: string[];
}

export function AgentEditor({ data, onUpdate, types = [] }: AgentEditorProps) {
    return (
        <Stack gap="md">
            {types.map(type => {
                const config = AGENT_TYPES[type as keyof typeof AGENT_TYPES] || { label: type, tag: type, description: `Script for ${type}` };
                return (
                    <FormAddon
                        key={type}
                        label={
                            <Group gap="xs">
                                <Text span>{config.label}</Text>
                                <Badge variant="light" color="gray" size="sm" tt="none">{config.tag}</Badge>
                            </Group>
                        }
                        description={config.description}
                        checked={typeof data?.[type] === 'string'}
                        onChange={(checked) => {
                            if (checked) {
                                onUpdate({ ...data, [type]: '' });
                            } else {
                                const { [type]: _, ...rest } = data || {};
                                onUpdate(rest);
                            }
                        }}
                    >
                        <FormScript
                            height="300px"
                            value={data?.[type] || ''}
                            onChange={(val) => onUpdate({ 
                                ...data, 
                                [type]: val 
                            })}
                        />
                    </FormAddon>
                );
            })}
        </Stack>
    );
}
