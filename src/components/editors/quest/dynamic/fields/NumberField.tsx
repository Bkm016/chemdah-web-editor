import React from 'react';
import { DebouncedNumberInput } from '@/components/ui/DebouncedInput';

interface NumberFieldProps {
    value: any;
    onChange: (value: any) => void;
}

export const NumberField: React.FC<NumberFieldProps> = ({ value, onChange }) => {
    return (
        <DebouncedNumberInput
            value={value === undefined || value === null ? '' : value}
            onChange={(val) => {
                if (val === '' || val === undefined) {
                    onChange(undefined);
                } else {
                    onChange(Number(val));
                }
            }}
            placeholder="未设置"
            size="xs"
            variant="filled"
            debounceMs={800}
        />
    );
};
