import { Stack, TextInput, NumberInput, Checkbox, Textarea } from '@mantine/core';
import { ParamDefinition } from '../../../../store/useApiStore';
import { FormScript } from '../../../ui';

interface DynamicMetaFieldsProps {
    params: ParamDefinition[];
    optionType: string;
    value: any;
    onChange: (value: any) => void;
}

export function DynamicMetaFields({ params, optionType, value, onChange }: DynamicMetaFieldsProps) {
    const handleChange = (paramName: string, newValue: any) => {
        const updatedValue = { ...value };

        if (newValue === undefined || newValue === '' || newValue === null) {
            delete updatedValue[paramName];
        } else {
            updatedValue[paramName] = newValue;
        }

        onChange(updatedValue);
    };

    // 检查是否是 Kether 脚本类型
    const isKetherScript = (param: ParamDefinition) => {
        return param.options && param.options.some(opt =>
            opt.toLowerCase() === 'kether' || opt.toLowerCase().includes('script')
        );
    };

    // 如果是 TEXT 类型且只有一个参数，直接返回文本值而不是对象
    if (optionType === 'TEXT' && params.length === 1) {
        const param = params[0];

        // 检查是否是脚本类型
        if (isKetherScript(param)) {
            return (
                <FormScript
                    label={param.description || param.name}
                    value={value || ''}
                    onChange={onChange}
                />
            );
        }

        return (
            <TextInput
                label={param.description || param.name}
                placeholder={`输入${param.description || param.name}`}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
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
                            <NumberInput
                                key={param.name}
                                label={param.description || param.name}
                                placeholder={`输入${param.description || param.name}`}
                                value={fieldValue}
                                onChange={(val) => handleChange(param.name, val)}
                            />
                        );

                    case 'section':
                        return (
                            <Textarea
                                key={param.name}
                                label={param.description || param.name}
                                placeholder={`输入${param.description || param.name}`}
                                value={fieldValue || ''}
                                onChange={(e) => handleChange(param.name, e.target.value)}
                                minRows={3}
                            />
                        );

                    default:
                        return (
                            <TextInput
                                key={param.name}
                                label={param.description || param.name}
                                placeholder={`输入${param.description || param.name}`}
                                value={fieldValue || ''}
                                onChange={(e) => handleChange(param.name, e.target.value)}
                            />
                        );
                }
            })}
        </Stack>
    );
}
