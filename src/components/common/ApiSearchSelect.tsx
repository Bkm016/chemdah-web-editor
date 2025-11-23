import { Select, SelectProps, Text, Group, Badge, Stack, Highlight, ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useApiSearch, formatSearchResultLabel } from '@/hooks/useApiSearch';
import { SearchResultItem, SearchItemType } from '@/store/useApiStore';

export interface ApiSearchSelectProps extends Omit<SelectProps, 'data' | 'onChange' | 'value'> {
  type: SearchItemType;          // 搜索类型：objective, meta, addon
  value?: string;                 // 选中的值（格式：plugin:id）
  onChange?: (value: string | null, item: SearchResultItem | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  limit?: number;                 // 限制显示结果数量
}

/**
 * API 搜索选择组件
 *
 * 支持模糊搜索 Objective, Meta, Addon
 * 搜索范围：ID、中文名称、别名
 */
export function ApiSearchSelect({
  type,
  value,
  onChange,
  placeholder,
  limit = 20
}: ApiSearchSelectProps) {
  // 使用 useApiSearch 提供的状态管理
  const { query, setQuery, results } = useApiSearch({ type, limit });

  // 获取当前类型的搜索结果
  const getResultsByType = () => {
    switch (type) {
      case 'objective':
        return results.objectives || [];
      case 'meta':
        return results.metas || [];
      case 'addon':
        return results.addons || [];
      default:
        return [];
    }
  };

  const currentResults = getResultsByType();

  // 转换为 Select 组件需要的格式，确保始终返回数组
  const selectData = Array.isArray(currentResults)
    ? currentResults.map(item => ({
        value: `${item.plugin}:${item.id}`,
        label: formatSearchResultLabel(item)
      }))
    : [];

  // 处理左侧清空按钮点击
  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发下拉框
    onChange?.(null, null);
    setQuery('');
  };

  // 处理选择变化
  const handleChange = (val: string | null) => {
    if (!val) {
      onChange?.(null, null);
      return;
    }

    const item = currentResults.find(r => `${r.plugin}:${r.id}` === val);
    if (item) {
      onChange?.(val, item);
    }
  };

  // 自定义渲染选项
  const renderOption = ({ option }: any) => {
    const item = currentResults.find(r => `${r.plugin}:${r.id}` === option.value);
    if (!item) return option.label;

    return (
      <Stack gap={4}>
        <Group gap="xs" wrap="nowrap">
          <Highlight highlight={query} size="sm" fw={500}>
            {item.name || item.id}
          </Highlight>
          <Badge size="xs" variant="light" color="gray">
            {item.plugin}
          </Badge>
          {item.matchedFields && item.matchedFields.includes('alias') && (
            <Badge size="xs" variant="light" color="blue">
              别名匹配
            </Badge>
          )}
        </Group>
        {/* 显示别名（浅色） */}
        {item.alias && item.alias.length > 0 && (
          <Text size="xs" c="dimmed" fs="italic">
            别名: {item.alias.join(', ')}
          </Text>
        )}
        {/* 显示描述 */}
        {item.description && item.description.length > 0 && (
          <Text size="xs" c="dimmed" lineClamp={1}>
            {item.description[0]}
          </Text>
        )}
        {/* 显示 ID（如果与名称不同） */}
        {item.id !== item.name && (
          <Text size="xs" c="dimmed" fs="italic">
            ID: {item.id}
          </Text>
        )}
      </Stack>
    );
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      data={selectData}
      searchable
      searchValue={query}
      onSearchChange={setQuery}
      filter={({ options }) => options}  // 禁用内部过滤，返回所有选项
      placeholder={placeholder || `搜索 ${getTypeName(type)}...`}
      nothingFoundMessage="未找到匹配结果"
      maxDropdownHeight={400}
      selectFirstOptionOnChange={false}
      renderOption={renderOption}
      leftSection={
        value ? (
          <ActionIcon
            size="sm"
            variant="subtle"
            color="gray"
            onClick={handleClearClick}
            style={{ cursor: 'pointer' }}
          >
            <IconX size={14} />
          </ActionIcon>
        ) : undefined
      }
    />
  );
}

/**
 * 获取类型的中文名称
 */
function getTypeName(type: SearchItemType): string {
  switch (type) {
    case 'objective':
      return '任务目标';
    case 'meta':
      return '元数据组件';
    case 'addon':
      return '扩展组件';
    default:
      return '组件';
  }
}

/**
 * 解析值为 plugin 和 id
 */
export function parseApiValue(value: string | null): { plugin: string; id: string } | null {
  if (!value) return null;
  const parts = value.split(':');
  if (parts.length !== 2) return null;
  return { plugin: parts[0], id: parts[1] };
}
