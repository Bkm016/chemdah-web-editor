import React from 'react';
import { DebouncedTextInput } from '@/components/ui/DebouncedInput';

interface StringFieldProps {
    value: any;
    onChange: (value: any) => void;
}

export const StringField: React.FC<StringFieldProps> = ({ value, onChange }) => {
    return (
        <DebouncedTextInput
            value={value === undefined || value === null ? '' : value}
            onChange={(val) => {
                onChange(val === '' ? undefined : val);
            }}
            placeholder="未设置"
            size="xs"
            variant="filled"
            debounceMs={800}
        />
    );
};
