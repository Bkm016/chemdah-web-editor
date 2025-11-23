import { Stack, TextInput, NumberInput, Checkbox, Textarea } from '@mantine/core';
import { ParamDefinition } from '@/store/useApiStore';
import { FormScript } from '@/components/ui';

interface DynamicMapItemProps {
    fields: ParamDefinition[];
    value: any;
    onChange: (value: any) => void;
    rootParamName: string; // 例如 "briefing[]" 或 "control[]"
}

/**
 * 渲染单个 Map 对象的所有字段
 *
 * 处理嵌套字段（使用点号分隔）
 */
export function DynamicMapItem({ fields, value, onChange, rootParamName }: DynamicMapItemProps) {
    const handleChange = (fieldName: string, newValue: any) => {
        const updatedValue = { ...value };

        // 移除前缀 "root[]."
        const prefix = rootParamName.replace('[]', '') + '[].';
        const cleanFieldName = fieldName.startsWith(prefix) ? fieldName.substring(prefix.length) : fieldName;

        // 处理嵌套字段（用点号分隔）
        const parts = cleanFieldName.split('.');
        if (parts.length === 1) {
            // 简单字段
            if (newValue === undefined || newValue === '' || newValue === null) {
                delete updatedValue[cleanFieldName];
            } else {
                updatedValue[cleanFieldName] = newValue;
            }
        } else {
            // 嵌套字段
            let current = updatedValue;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                    current[parts[i]] = {};
                }
                current = current[parts[i]];
            }

            const lastPart = parts[parts.length - 1];
            if (newValue === undefined || newValue === '' || newValue === null) {
                delete current[lastPart];
            } else {
                current[lastPart] = newValue;
            }
        }

        onChange(updatedValue);
    };

    // 获取字段值（支持嵌套）
    const getFieldValue = (fieldName: string): any => {
        const prefix = rootParamName.replace('[]', '') + '[].';
        const cleanFieldName = fieldName.startsWith(prefix) ? fieldName.substring(prefix.length) : fieldName;

        const parts = cleanFieldName.split('.');
        let current = value;
        for (const part of parts) {
            if (current === undefined || current === null) {
                return undefined;
            }
            current = current[part];
        }
        return current;
    };

    // 检查是否是 Kether 脚本类型
    const isKetherScript = (param: ParamDefinition) => {
        return param.options && param.options.some(opt =>
            opt.toLowerCase() === 'kether' || opt.toLowerCase().includes('script')
        );
    };

    return (
        <Stack gap="md">
            {fields.map((param) => {
                const fieldValue = getFieldValue(param.name);

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

                    case 'map':
                        // 跳过 map 类型的根节点（它只是描述，不需要输入框）
                        return null;

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
