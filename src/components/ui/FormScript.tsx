import Editor, { EditorProps, OnMount } from '@monaco-editor/react';
import { Box, Text, Group, Badge, Loader, Center } from '@mantine/core';
import { useThemeStore } from '../../store/useThemeStore';
import { useEffect, useState, useRef, useCallback } from 'react';

interface FormScriptProps extends EditorProps {
    label?: string;
    description?: string;
    height?: string | number;
    value?: string;
    onChange?: (value: string | undefined) => void;
}

export function FormScript({ label, description, height = "200px", value, onChange, ...props }: FormScriptProps) {
    const { colorScheme } = useThemeStore();
    const [shouldMount, setShouldMount] = useState(false);
    const editorRef = useRef<any>(null);
    const onChangeRef = useRef(onChange);

    // 保持最新的 onChange 引用
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // 延迟挂载 Monaco Editor,避免首次渲染卡顿
    useEffect(() => {
        const timer = setTimeout(() => setShouldMount(true), 150);
        return () => clearTimeout(timer);
    }, []);

    // 使用 onMount 来直接操作编辑器实例,避免受控组件的重渲染
    const handleEditorMount: OnMount = useCallback((editor) => {
        editorRef.current = editor;

        // 添加防抖的 onChange 处理
        let debounceTimer: number | null = null;

        // 监听内容变化,添加防抖避免频繁触发父组件更新
        editor.onDidChangeModelContent(() => {
            if (debounceTimer) clearTimeout(debounceTimer);

            debounceTimer = window.setTimeout(() => {
                const newValue = editor.getValue();
                if (onChangeRef.current) {
                    onChangeRef.current(newValue);
                }
                debounceTimer = null;
            }, 300); // 300ms 防抖
        });
    }, []);

    const renderLabel = () => {
        if (!label) return null;
        const match = label.match(/^(.*?)\s*\((.*?)\)$/);
        if (match) {
            return (
                <Group gap={8} mb={4}>
                    <Text span size="sm" fw={500}>{match[1]}</Text>
                    <Badge size="xs" variant="light" color="gray" style={{ textTransform: 'none' }}>
                        {match[2]}
                    </Badge>
                </Group>
            );
        }
        return <Text size="sm" fw={500} mb={4}>{label}</Text>;
    };

    return (
        <Box>
            {renderLabel()}
            {description && <Text size="xs" c="dimmed" mb={8}>{description}</Text>}
            <Box style={{ border: '1px solid var(--mantine-color-dark-4)', borderRadius: '4px', overflow: 'hidden' }}>
                {!shouldMount ? (
                    <Center style={{ height, backgroundColor: 'var(--mantine-color-dark-7)' }}>
                        <Loader size="sm" color="blue" />
                    </Center>
                ) : (
                    <Editor
                        height={height}
                        defaultLanguage="ruby"
                        defaultValue={value === undefined || value === null ? '' : String(value)}
                        theme={colorScheme === 'dark' ? 'vs-dark' : 'light'}
                        onMount={handleEditorMount}
                        options={{
                            // 基础配置
                            minimap: { enabled: false },
                            lineNumbers: 'on',
                            lineNumbersMinChars: 3,
                            scrollBeyondLastLine: false,
                            fontSize: 13,

                            // 性能优化配置
                            quickSuggestions: false, // 禁用自动建议
                            suggestOnTriggerCharacters: false, // 禁用触发字符建议
                            acceptSuggestionOnEnter: 'off', // 禁用回车接受建议
                            tabCompletion: 'off', // 禁用 Tab 补全
                            wordBasedSuggestions: 'off', // 禁用基于单词的建议
                            parameterHints: { enabled: false }, // 禁用参数提示

                            // 减少语法分析开销
                            folding: false, // 禁用代码折叠
                            occurrencesHighlight: 'off', // 禁用出现次数高亮
                            selectionHighlight: false, // 禁用选择高亮
                            renderLineHighlight: 'none', // 禁用行高亮

                            // 简化渲染
                            renderWhitespace: 'none', // 不渲染空白字符
                            renderControlCharacters: false, // 不渲染控制字符
                            smoothScrolling: false, // 禁用平滑滚动

                            ...props.options
                        }}
                        {...props}
                    />
                )}
            </Box>
        </Box>
    );
}
