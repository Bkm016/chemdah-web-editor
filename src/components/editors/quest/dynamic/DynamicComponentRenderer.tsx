import { QuestMetaComponent, TaskAddonComponent } from '@/store/useApiStore';
import { DynamicComponentField } from './DynamicComponentField';
import { FormAddon } from '@/components/ui';
import { Stack } from '@mantine/core';

interface DynamicComponentRendererProps {
    component: QuestMetaComponent | TaskAddonComponent;
    data: any;
    onChange: (data: any) => void;
}

export function DynamicComponentRenderer({ component, data, onChange }: DynamicComponentRendererProps) {
    // 检查组件是否启用（有数据）
    const isEnabled = component.fields.some(field => {
        const keys = field.name.split('.');
        let value = data;
        for (const key of keys) {
            if (value === undefined || value === null) return false;
            value = value[key];
        }
        return value !== undefined && value !== null;
    });

    // 处理字段值的获取和设置（支持嵌套路径，如 rewards.items）
    const getFieldValue = (fieldName: string) => {
        const keys = fieldName.split('.');
        let value = data;
        for (const key of keys) {
            if (value === undefined || value === null) return undefined;
            value = value[key];
        }
        return value;
    };

    const setFieldValue = (fieldName: string, value: any) => {
        const keys = fieldName.split('.');
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

        onChange(newData);
    };

    const handleToggle = (checked: boolean) => {
        if (!checked) {
            // 清空所有字段
            const newData = { ...data };
            component.fields.forEach(field => {
                const keys = field.name.split('.');
                let current: any = newData;
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) return;
                    current = current[keys[i]];
                }
                delete current[keys[keys.length - 1]];
            });
            onChange(newData);
        } else {
            // 设置默认值
            const newData = { ...data };
            component.fields.forEach(field => {
                if (field.default !== undefined) {
                    const keys = field.name.split('.');
                    let current: any = newData;
                    for (let i = 0; i < keys.length - 1; i++) {
                        if (!current[keys[i]]) {
                            current[keys[i]] = {};
                        }
                        current = current[keys[i]];
                    }
                    current[keys[keys.length - 1]] = field.default;
                }
            });
            onChange(newData);
        }
    };

    return (
        <FormAddon
            label={`${component.name} (${component.id})`}
            description={component.category}
            checked={isEnabled}
            onChange={handleToggle}
        >
            <Stack gap="md">
                {component.fields.map((field) => (
                    <DynamicComponentField
                        key={field.name}
                        field={field}
                        value={getFieldValue(field.name)}
                        onChange={(value) => setFieldValue(field.name, value)}
                    />
                ))}
            </Stack>
        </FormAddon>
    );
}
