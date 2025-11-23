import { TextInput, TextInputProps, NumberInput, NumberInputProps, Textarea, TextareaProps } from '@mantine/core';
import { useState, useEffect, useRef } from 'react';

interface DebouncedTextInputProps extends Omit<TextInputProps, 'onChange'> {
    value?: string;
    onChange?: (value: string) => void;
    debounceMs?: number;
}

export function DebouncedTextInput({ value, onChange, debounceMs = 300, ...props }: DebouncedTextInputProps) {
    const [localValue, setLocalValue] = useState(value || '');
    const onChangeRef = useRef(onChange);

    // 保持最新的 onChange 引用
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // 同步外部 value 变化
    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    // 防抖更新
    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (localValue !== value && onChangeRef.current) {
                onChangeRef.current(localValue);
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [localValue, value, debounceMs]);

    return (
        <TextInput
            {...props}
            value={localValue}
            onChange={(e) => setLocalValue(e.currentTarget.value)}
        />
    );
}

interface DebouncedNumberInputProps extends Omit<NumberInputProps, 'onChange'> {
    value?: number | string;
    onChange?: (value: number | string) => void;
    debounceMs?: number;
}

export function DebouncedNumberInput({ value, onChange, debounceMs = 300, ...props }: DebouncedNumberInputProps) {
    const [localValue, setLocalValue] = useState<number | string>(value ?? '');
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        setLocalValue(value ?? '');
    }, [value]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (localValue !== value && onChangeRef.current) {
                onChangeRef.current(localValue);
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [localValue, value, debounceMs]);

    return (
        <NumberInput
            {...props}
            value={localValue}
            onChange={(val) => setLocalValue(val ?? '')}
        />
    );
}

interface DebouncedTextareaProps extends Omit<TextareaProps, 'onChange'> {
    value?: string;
    onChange?: (value: string) => void;
    debounceMs?: number;
}

export function DebouncedTextarea({ value, onChange, debounceMs = 300, ...props }: DebouncedTextareaProps) {
    const [localValue, setLocalValue] = useState(value || '');
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        setLocalValue(value || '');
    }, [value]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (localValue !== value && onChangeRef.current) {
                onChangeRef.current(localValue);
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [localValue, value, debounceMs]);

    return (
        <Textarea
            {...props}
            value={localValue}
            onChange={(e) => setLocalValue(e.currentTarget.value)}
        />
    );
}
