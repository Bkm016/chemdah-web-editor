import { Stack, Checkbox } from '@mantine/core';
import { ParamDefinition } from '@/store/useApiStore';
import { FormScript } from '@/components/ui';
import { DynamicMapList } from './DynamicMapList';
import { memo, useCallback } from 'react';
import { DebouncedTextInput, DebouncedNumberInput, DebouncedTextarea } from '@/components/ui/DebouncedInput';

interface DynamicMetaFieldsProps {
    params: ParamDefinition[];
    optionType: string;
    value: any;
    onChange: (value: any) => void;
}

export const DynamicMetaFields = memo(function DynamicMetaFields({ params, optionType, value, onChange }: DynamicMetaFieldsProps) {
    const handleChange = useCallback((paramName: string, newValue: any) => {
        const updatedValue = { ...value };

        if (newValue === undefined || newValue === '' || newValue === null) {
            delete updatedValue[paramName];
        } else {
            updatedValue[paramName] = newValue;
        }

        onChange(updatedValue);
    }, [value, onChange]);

    // 检查是否是 Kether 脚本类型
    const isKetherScript = (param: ParamDefinition) => {
        return param.options && param.options.some(opt =>
            opt.toLowerCase() === 'kether' || opt.toLowerCase().includes('script')
        );
    };

    // 如果是 MAP_LIST 类型，使用专门的列表编辑器
    if (optionType === 'MAP_LIST') {
        // 找到根参数名（带 []）
        const rootParam = params.find(p => p.name.endsWith('[]'));

        if (rootParam) {
            return (
                <DynamicMapList
                    params={params}
                    value={value || []}
                    onChange={onChange}
                    rootParamName={rootParam.name}
                />
            );
        }
    }

    // 如果是 TEXT 类型且只有一个参数，直接返回文本值而不是对象
    if (optionType === 'TEXT' && params.length === 1) {
        const param = params[0];

        // 检查是否是脚本类型
        if (isKetherScript(param)) {
            return (
                <FormScript
                    key={param.name}
                    label={param.description || param.name}
                    value={value || ''}
                    onChange={onChange}
                />
            );
        }

        return (
            <DebouncedTextInput
                key={param.name}
                label={param.description || param.name}
                placeholder={`输入${param.description || param.name}`}
                value={value || ''}
                onChange={onChange}
                debounceMs={800}
            />
        );
    }

    // SECTION 或 ANY 类型，显示所有参数
    return (
        <Stack gap="md">
            {params.map((param) => {
                const fieldValue = value?.[param.name];

                // 检查是否是脚本类型
                if (isKetherScript(param)) {
                    return (
                        <FormScript
                            key={param.name}
                            label={param.description || param.name}
                            value={fieldValue || ''}
                            onChange={(val) => handleChange(param.name, val)}
                        />
                    );
                }

                switch (param.type) {
                    case 'boolean':
                        return (
                            <Checkbox
                                key={param.name}
                                label={param.description || param.name}
                                checked={fieldValue === true}
                                onChange={(e) => handleChange(param.name, e.currentTarget.checked)}
                            />
                        );

                    case 'number':
                        return (
                            <DebouncedNumberInput
                                key={param.name}
                                label={param.description || param.name}
                                placeholder={`输入${param.description || param.name}`}
                                value={fieldValue}
                                onChange={(val) => handleChange(param.name, val)}
                                debounceMs={800}
                            />
                        );

                    case 'section':
                        return (
                            <DebouncedTextarea
                                key={param.name}
                                label={param.description || param.name}
                                placeholder={`输入${param.description || param.name}`}
                                value={fieldValue || ''}
                                onChange={(val) => handleChange(param.name, val)}
                                minRows={3}
                                debounceMs={800}
                            />
                        );

                    default:
                        return (
                            <DebouncedTextInput
                                key={param.name}
                                label={param.description || param.name}
                                placeholder={`输入${param.description || param.name}`}
                                value={fieldValue || ''}
                                onChange={(val) => handleChange(param.name, val)}
                                debounceMs={800}
                            />
                        );
                }
            })}
        </Stack>
    );
});
