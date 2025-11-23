import { useState, useMemo } from 'react';
import { useApiStore, SearchResultItem, SearchItemType } from '@/store/useApiStore';

export interface UseApiSearchOptions {
  type?: SearchItemType | 'all'; // 搜索类型
  limit?: number;                  // 限制结果数量
  minScore?: number;              // 最小匹配分数
}

export interface UseApiSearchResult {
  // 搜索查询
  query: string;
  setQuery: (query: string) => void;

  // 搜索结果
  results: {
    objectives: SearchResultItem[];
    metas: SearchResultItem[];
    addons: SearchResultItem[];
    all: SearchResultItem[];
  };

  // 统计信息
  stats: {
    objectiveCount: number;
    metaCount: number;
    addonCount: number;
    totalCount: number;
  };

  // 工具函数
  clearQuery: () => void;
  hasResults: boolean;
  isSearching: boolean;
}

/**
 * API 搜索 Hook
 *
 * @param options 搜索选项
 * @returns 搜索结果和工具函数
 *
 * @example
 * ```tsx
 * const { query, setQuery, results, stats } = useApiSearch({ type: 'objective', limit: 10 });
 *
 * return (
 *   <div>
 *     <input value={query} onChange={e => setQuery(e.target.value)} />
 *     {results.objectives.map(item => (
 *       <div key={item.id}>{item.name} ({item.plugin})</div>
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useApiSearch(options: UseApiSearchOptions = {}): UseApiSearchResult {
  const { type = 'all', limit, minScore = 0 } = options;

  const [query, setQuery] = useState('');

  const { searchObjectives, searchMetas, searchAddons, searchAll } = useApiStore();

  // 执行搜索
  const rawResults = useMemo(() => {
    // 移除空查询的特殊处理，让 searchIndex 函数处理
    // 空查询时会返回所有结果，按频率排序
    switch (type) {
      case 'objective':
        return {
          objectives: searchObjectives(query),
          metas: [],
          addons: []
        };
      case 'meta':
        return {
          objectives: [],
          metas: searchMetas(query),
          addons: []
        };
      case 'addon':
        return {
          objectives: [],
          metas: [],
          addons: searchAddons(query)
        };
      case 'all':
      default:
        return searchAll(query);
    }
  }, [query, type, searchObjectives, searchMetas, searchAddons, searchAll]);

  // 过滤和限制结果
  const results = useMemo(() => {
    const filterAndLimit = (items: SearchResultItem[]) => {
      let filtered = items.filter(item => item.score >= minScore);

      // 只有在有查询内容时才应用限制，查询为空时显示所有结果
      if (limit && limit > 0 && query.trim().length > 0) {
        filtered = filtered.slice(0, limit);
      }

      return filtered;
    };

    const objectives = filterAndLimit(rawResults.objectives);
    const metas = filterAndLimit(rawResults.metas);
    const addons = filterAndLimit(rawResults.addons);

    return {
      objectives,
      metas,
      addons,
      all: [...objectives, ...metas, ...addons].sort((a, b) => b.score - a.score)
    };
  }, [rawResults, minScore, limit, query]);

  // 统计信息
  const stats = useMemo(() => ({
    objectiveCount: results.objectives.length,
    metaCount: results.metas.length,
    addonCount: results.addons.length,
    totalCount: results.all.length
  }), [results]);

  // 工具函数
  const clearQuery = () => setQuery('');
  const hasResults = stats.totalCount > 0;
  const isSearching = query.trim().length > 0;

  return {
    query,
    setQuery,
    results,
    stats,
    clearQuery,
    hasResults,
    isSearching
  };
}

/**
 * 格式化搜索结果为显示文本
 *
 * @param item 搜索结果项
 * @returns 格式化的显示文本
 */
export function formatSearchResultLabel(item: SearchResultItem): string {
  const parts: string[] = [];

  // 添加中文名称
  if (item.name) {
    parts.push(item.name);
  }

  // 添加 ID（如果与名称不同）
  if (item.id !== item.name) {
    parts.push(`(${item.id})`);
  }

  // 添加插件来源
  if (item.plugin) {
    parts.push(`[${item.plugin}]`);
  }

  return parts.join(' ');
}

/**
 * 格式化搜索结果为详细描述
 *
 * @param item 搜索结果项
 * @returns 格式化的详细描述
 */
export function formatSearchResultDescription(item: SearchResultItem): string {
  if (item.description && item.description.length > 0) {
    return item.description.join(' ');
  }
  return '';
}

/**
 * 高亮搜索关键词
 *
 * @param text 原文本
 * @param query 搜索查询
 * @returns 带有高亮标记的文本
 */
export function highlightSearchQuery(text: string, query: string): string {
  if (!query.trim()) return text;

  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  const before = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length);

  return `${before}<mark>${match}</mark>${after}`;
}
