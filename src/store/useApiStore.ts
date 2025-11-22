import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useApiCenterStore } from './useApiCenterStore';

// ==================== 新 API 结构类型定义 ====================

// 组件字段定义（用于自定义组件）
export interface ComponentField {
    name: string;
    label: string;
    pattern: string;
    description?: string;
    default?: any;
}

// 自定义组件定义（Meta/Addon 的新结构）
export interface ComponentDefinition {
    id: string;
    name: string;
    category: string;
    fields: ComponentField[];
}

// Objective 字段定义
export interface ObjectiveField {
    name: string;
    pattern: string;
    description?: string;  // 字段描述（从 params 中获取）
}

// Objective 定义（新增 name, description, alias, params）
export interface ObjectiveDefinition {
    condition: ObjectiveField[];
    'condition-vars': string[];
    goal: ObjectiveField[];
    'goal-vars': string[];
    name?: string;           // 中文名称
    description?: string[];  // 描述数组
    alias?: string[];        // 别名数组
    params?: ParamDefinition[]; // 参数定义列表
}

// Param 参数定义
export interface ParamDefinition {
    name: string;           // 参数名
    type: string;           // 类型：string, number, boolean, section, any
    required: boolean;      // 是否必填
    options: string[];      // 可选值列表
    description: string;    // 参数描述
}

// Meta 组件定义
export interface MetaDefinition {
    option_type: string;    // TEXT, SECTION, ANY
    class: string;          // 完整类名
    scope: string;          // both, quest, task
    name: string;           // 中文名称
    description: string[];  // 描述数组
    alias: string[];        // 别名数组
    params: ParamDefinition[]; // 参数列表
    _source?: string;       // 原始来源插件（内部使用）
    _sourceColor?: string;  // 来源的颜色配置（内部使用）
}

// Addon 组件定义
export interface AddonDefinition {
    option_type: string;    // SECTION
    class: string;          // 完整类名
    scope: string;          // both, quest, task
    name: string;           // 中文名称
    description: string[];  // 描述数组
    alias: string[];        // 别名数组
    params: ParamDefinition[]; // 参数列表
    _source?: string;       // 原始来源插件（内部使用）
    _sourceColor?: string;  // 来源的颜色配置（内部使用）
}

// 插件 API 定义
export interface PluginApiDefinition {
    objective?: {
        [objectiveId: string]: ObjectiveDefinition;
    };
    meta?: {
        [metaId: string]: MetaDefinition;
    };
    addon?: {
        [addonId: string]: AddonDefinition;
    };
    conversationNodeComponents?: ComponentDefinition[];
    conversationPlayerOptionComponents?: ComponentDefinition[];
}

// 完整 API 数据（按插件分组）
export interface ApiData {
    [pluginName: string]: PluginApiDefinition;
}

// 旧版 API 结构定义（用于默认数据）
export interface LegacyApiDefinition {
    objectives?: {
        [pluginName: string]: {
            [objectiveId: string]: ObjectiveDefinition;
        };
    };
    questMetaComponents?: ComponentDefinition[];
    questAddonComponents?: ComponentDefinition[];
    taskMetaComponents?: ComponentDefinition[];
    taskAddonComponents?: ComponentDefinition[];
}

// ==================== 搜索索引类型定义 ====================

// 搜索项类型
export type SearchItemType = 'objective' | 'meta' | 'addon';

// 搜索索引项
export interface SearchIndexItem {
    id: string;              // 组件 ID
    type: SearchItemType;    // 类型
    plugin: string;          // 所属插件
    name: string;            // 中文名称
    alias: string[];         // 别名列表
    description: string[];   // 描述列表
    keywords: string[];      // 搜索关键词（自动生成：id + name + alias）
}

// 搜索结果项
export interface SearchResultItem extends SearchIndexItem {
    score: number;           // 匹配分数
    matchedFields: string[]; // 匹配的字段（id/name/alias）
}

// ==================== Store State 定义 ====================

interface ApiState {
    // API 数据
    apiData: ApiData;

    // 搜索索引
    searchIndex: {
        objectives: SearchIndexItem[];
        metas: SearchIndexItem[];
        addons: SearchIndexItem[];
    };

    // 使用频率记录 { "plugin:id": count }
    usageFrequency: {
        [key: string]: number;
    };

    // 加载 API 数据
    loadApiData: () => Promise<void>;

    // 设置 API 数据
    setApiData: (data: ApiData) => void;

    // 从 API Center 同步数据
    syncFromApiCenter: () => void;

    // 构建搜索索引
    buildSearchIndex: () => void;

    // 搜索功能
    searchObjectives: (query: string) => SearchResultItem[];
    searchMetas: (query: string) => SearchResultItem[];
    searchAddons: (query: string) => SearchResultItem[];
    searchAll: (query: string) => {
        objectives: SearchResultItem[];
        metas: SearchResultItem[];
        addons: SearchResultItem[];
    };

    // 记录使用
    recordUsage: (plugin: string, id: string, type: SearchItemType) => void;

    // 获取使用频率
    getUsageFrequency: (plugin: string, id: string) => number;

    // 获取特定组件
    getObjective: (plugin: string, id: string) => ObjectiveDefinition | undefined;
    getMeta: (plugin: string, id: string) => MetaDefinition | undefined;
    getAddon: (plugin: string, id: string) => AddonDefinition | undefined;
}

// ==================== 搜索工具函数 ====================

/**
 * 计算搜索匹配分数
 * @param query 搜索查询
 * @param item 索引项
 * @returns 匹配分数和匹配字段
 */
function calculateMatchScore(query: string, item: SearchIndexItem): { score: number; matchedFields: string[] } {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return { score: 0, matchedFields: [] };

    let score = 0;
    const matchedFields: string[] = [];

    // ID 精确匹配（最高优先级）
    if (item.id.toLowerCase() === lowerQuery) {
        score += 100;
        matchedFields.push('id');
    } else if (item.id.toLowerCase().includes(lowerQuery)) {
        score += 50;
        matchedFields.push('id');
    }

    // 中文名称匹配
    if (item.name.toLowerCase().includes(lowerQuery)) {
        score += 80;
        matchedFields.push('name');
    }

    // 别名匹配
    for (const alias of item.alias) {
        if (alias.toLowerCase() === lowerQuery) {
            score += 70;
            matchedFields.push('alias');
            break;
        } else if (alias.toLowerCase().includes(lowerQuery)) {
            score += 40;
            matchedFields.push('alias');
            break;
        }
    }

    // 描述匹配（较低优先级）
    for (const desc of item.description) {
        if (desc.toLowerCase().includes(lowerQuery)) {
            score += 20;
            matchedFields.push('description');
            break;
        }
    }

    // 拼音首字母匹配（可选，暂时跳过）

    return { score, matchedFields };
}

/**
 * 搜索索引
 * @param query 搜索查询
 * @param index 搜索索引
 * @param getFrequency 获取使用频率的函数
 * @returns 搜索结果
 */
function searchIndex(
    query: string,
    index: SearchIndexItem[],
    getFrequency: (plugin: string, id: string) => number
): SearchResultItem[] {
    // 如果没有查询，返回所有结果，按频率排序
    if (!query.trim()) {
        return index
            .map(item => ({
                ...item,
                score: 0,
                matchedFields: []
            }))
            .sort((a, b) => {
                const freqA = getFrequency(a.plugin, a.id);
                const freqB = getFrequency(b.plugin, b.id);
                // 按频率降序，如果频率相同则按名称升序
                if (freqB !== freqA) {
                    return freqB - freqA;
                }
                return a.name.localeCompare(b.name);
            });
    }

    const results: SearchResultItem[] = [];

    for (const item of index) {
        const { score, matchedFields } = calculateMatchScore(query, item);
        if (score > 0) {
            // 添加频率加成：每使用一次增加 5 分
            const frequency = getFrequency(item.plugin, item.id);
            const finalScore = score + (frequency * 5);

            results.push({
                ...item,
                score: finalScore,
                matchedFields
            });
        }
    }

    // 按分数降序排序
    results.sort((a, b) => b.score - a.score);

    return results;
}

// ==================== Store 实现 ====================

export const useApiStore = create<ApiState>()(
    persist(
        (set, get) => ({
            // 初始数据
            apiData: {},
            searchIndex: {
                objectives: [],
                metas: [],
                addons: []
            },
            usageFrequency: {},

            // 加载 API 数据
            loadApiData: async () => {
                const apiCenterData = useApiCenterStore.getState().getMergedApiData();
                if (apiCenterData) {
                    set({ apiData: apiCenterData });
                    get().buildSearchIndex();
                }
            },

            // 设置 API 数据
            setApiData: (data) => {
                set({ apiData: data });
                get().buildSearchIndex();
            },

            // 从 API Center 同步数据
            syncFromApiCenter: () => {
                const apiCenterData = useApiCenterStore.getState().getMergedApiData();
                if (apiCenterData) {
                    set({ apiData: apiCenterData });
                    get().buildSearchIndex();
                }
            },

            // 构建搜索索引
            buildSearchIndex: () => {
                const { apiData } = get();

                const objectives: SearchIndexItem[] = [];
                const metas: SearchIndexItem[] = [];
                const addons: SearchIndexItem[] = [];

                // 遍历所有插件
                for (const [pluginName, pluginApi] of Object.entries(apiData)) {
                    // 索引 Objectives
                    if (pluginApi.objective) {
                        for (const [objId, objDef] of Object.entries(pluginApi.objective)) {
                            objectives.push({
                                id: objId,
                                type: 'objective',
                                plugin: pluginName,
                                name: objDef.name || objId,
                                alias: objDef.alias || [],
                                description: objDef.description || [],
                                keywords: [
                                    objId,
                                    objDef.name || '',
                                    ...(objDef.alias || [])
                                ].filter(Boolean)
                            });
                        }
                    }

                    // 索引 Metas
                    if (pluginApi.meta) {
                        for (const [metaId, metaDef] of Object.entries(pluginApi.meta)) {
                            metas.push({
                                id: metaId,
                                type: 'meta',
                                plugin: pluginName,
                                name: metaDef.name || metaId,
                                alias: metaDef.alias || [],
                                description: metaDef.description || [],
                                keywords: [
                                    metaId,
                                    metaDef.name || '',
                                    ...(metaDef.alias || [])
                                ].filter(Boolean)
                            });
                        }
                    }

                    // 索引 Addons
                    if (pluginApi.addon) {
                        for (const [addonId, addonDef] of Object.entries(pluginApi.addon)) {
                            addons.push({
                                id: addonId,
                                type: 'addon',
                                plugin: pluginName,
                                name: addonDef.name || addonId,
                                alias: addonDef.alias || [],
                                description: addonDef.description || [],
                                keywords: [
                                    addonId,
                                    addonDef.name || '',
                                    ...(addonDef.alias || [])
                                ].filter(Boolean)
                            });
                        }
                    }
                }

                set({
                    searchIndex: { objectives, metas, addons }
                });
            },

            // 搜索 Objectives
            searchObjectives: (query: string) => {
                const state = get();
                return searchIndex(query, state.searchIndex.objectives, state.getUsageFrequency);
            },

            // 搜索 Metas
            searchMetas: (query: string) => {
                const state = get();
                return searchIndex(query, state.searchIndex.metas, state.getUsageFrequency);
            },

            // 搜索 Addons
            searchAddons: (query: string) => {
                const state = get();
                return searchIndex(query, state.searchIndex.addons, state.getUsageFrequency);
            },

            // 搜索全部
            searchAll: (query: string) => {
                const { searchObjectives, searchMetas, searchAddons } = get();
                return {
                    objectives: searchObjectives(query),
                    metas: searchMetas(query),
                    addons: searchAddons(query)
                };
            },

            // 记录使用
            recordUsage: (plugin: string, id: string) => {
                const key = `${plugin}:${id}`;
                set((state) => ({
                    usageFrequency: {
                        ...state.usageFrequency,
                        [key]: (state.usageFrequency[key] || 0) + 1
                    }
                }));
            },

            // 获取使用频率
            getUsageFrequency: (plugin: string, id: string) => {
                const key = `${plugin}:${id}`;
                return get().usageFrequency[key] || 0;
            },

            // 获取特定 Objective
            getObjective: (plugin: string, id: string) => {
                const { apiData } = get();
                return apiData[plugin]?.objective?.[id];
            },

            // 获取特定 Meta
            getMeta: (plugin: string, id: string) => {
                const { apiData } = get();
                return apiData[plugin]?.meta?.[id];
            },

            // 获取特定 Addon
            getAddon: (plugin: string, id: string) => {
                const { apiData } = get();
                return apiData[plugin]?.addon?.[id];
            }
        }),
        {
            name: 'chemdah-api-storage',
            version: 2 // 版本号升级，清除旧数据
        }
    )
);
