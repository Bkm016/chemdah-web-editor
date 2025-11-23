import React from 'react';
import { Modal, Stack, Button, Group, Text } from '@mantine/core';
import { FormInput, FormTextarea } from '@/components/ui';

export interface ConversationOptions {
    theme?: string;
    title?: string;
    'global-flags'?: string[];
}

interface ConversationSettingsProps {
    opened: boolean;
    onClose: () => void;
    options: ConversationOptions;
    onSave: (options: ConversationOptions) => void;
}

export function ConversationSettings({ opened, onClose, options, onSave }: ConversationSettingsProps) {
    const [theme, setTheme] = React.useState(options.theme || 'chat');
    const [title, setTitle] = React.useState(options.title || '{name}');
    const [flags, setFlags] = React.useState((options['global-flags'] || []).join('\n'));

    React.useEffect(() => {
        setTheme(options.theme || 'chat');
        setTitle(options.title || '{name}');
        setFlags((options['global-flags'] || []).join('\n'));
    }, [options]);

    const handleSave = () => {
        const flagList = flags
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        onSave({
            theme: theme || undefined,
            title: title || undefined,
            'global-flags': flagList.length > 0 ? flagList : undefined
        });
        onClose();
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={<Text fw={700}>对话设置 (__option__)</Text>}
            size="md"
        >
            <Stack gap="md">
                <FormInput
                    label="Theme"
                    description="对话主题类型"
                    placeholder="chat"
                    value={theme}
                    onChange={(e) => setTheme(e.currentTarget.value)}
                />

                <FormInput
                    label="Title"
                    description="对话标题（支持变量如 {name}）"
                    placeholder="{name}"
                    value={title}
                    onChange={(e) => setTitle(e.currentTarget.value)}
                />

                <FormTextarea
                    label="Flags"
                    description="标志列表，每行一个"
                    placeholder="每行输入一个 flag，例如：&#10;AAA&#10;BBB"
                    minRows={4}
                    value={flags}
                    onChange={(e) => setFlags(e.currentTarget.value)}
                />

                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={onClose}>取消</Button>
                    <Button onClick={handleSave}>保存</Button>
                </Group>
            </Stack>
        </Modal>
    );
}