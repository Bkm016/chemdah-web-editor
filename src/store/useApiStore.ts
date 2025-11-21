import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_API_DATA } from './defaultApiData';
import { useApiCenterStore } from './useApiCenterStore';

export interface ObjectiveField {
    name: string;
    pattern: string;
}

export interface ObjectiveDefinition {
    condition: ObjectiveField[];
    'condition-vars': string[];
    goal: ObjectiveField[];
    'goal-vars': string[];
}

// 组件字段定义
export interface ComponentField {
    name: string;           // 字段名称，例如 "type", "index", "briefing"
    label: string;          // 显示标签，例如 "任务类型"
    pattern: string;        // 数据类型：String, Number, Boolean, Array, RichText, Script 等
    description?: string;   // 字段描述
    default?: any;          // 默认值
    required?: boolean;     // 是否必填
}

// 全局组件（Quest Meta）定义
export interface QuestMetaComponent {
    id: string;             // 组件 ID，例如 "type", "index", "briefing"
    name: string;           // 组件名称，例如 "任务类型"
    category: string;       // 分类，例如 "基础信息", "奖励系统"
    fields: ComponentField[]; // 字段列表
}

// 任务流程组件（Task Addon）定义
export interface TaskAddonComponent {
    id: string;             // 组件 ID，例如 "description", "custom-component"
    name: string;           // 组件名称，例如 "任务描述"
    category: string;       // 分类，例如 "显示", "逻辑"
    fields: ComponentField[]; // 字段列表
}

// 对话节点组件定义（新增）
export interface ConversationNodeComponent {
    id: string;             // 组件 ID，例如 "root", "self", "model"
    name: string;           // 组件名称，例如 "UI 根节点"
    category: string;       // 分类，例如 "显示", "实体"
    fields: ComponentField[]; // 字段列表
}

// 对话玩家选项组件定义（新增）
export interface ConversationPlayerOptionComponent {
    id: string;             // 组件 ID，例如 "dos", "dosh", "gscript"
    name: string;           // 组件名称，例如 "UI 动作"
    category: string;       // 分类，例如 "脚本", "动作"
    fields: ComponentField[]; // 字段列表
}

export interface ApiDefinition {
    // 任务目标定义（现有）
    objectives?: {
        [group: string]: {
            [objective: string]: ObjectiveDefinition
        }
    };

    // 全局组件定义（新增）
    questMetaComponents?: QuestMetaComponent[];

    // 任务流程组件定义（新增）
    taskAddonComponents?: TaskAddonComponent[];

    // 对话节点组件定义（新增）
    conversationNodeComponents?: ConversationNodeComponent[];

    // 对话玩家选项组件定义（新增）
    conversationPlayerOptionComponents?: ConversationPlayerOptionComponent[];
}

interface ApiState {
    apiData: ApiDefinition;
    loadApiData: () => Promise<void>;
    setApiData: (data: ApiDefinition) => void;
    mergeApiData: (data: ApiDefinition) => void;
    syncFromApiCenter: () => void;
}

export const useApiStore = create<ApiState>()(
    persist(
        (set, get) => ({
            apiData: DEFAULT_API_DATA,
            loadApiData: async () => {
                // Load from API Center instead of single file
                const apiCenterData = useApiCenterStore.getState().getMergedApiData();
                if (apiCenterData) {
                    set({ apiData: apiCenterData });
                    console.log('Loaded API data from API Center');
                } else {
                    console.warn('No API data available from API Center, using default data');
                }
            },
            setApiData: (data) => set({ apiData: data }),
            mergeApiData: (newData) => {
                const currentData = get().apiData;
                const mergedData: ApiDefinition = { ...currentData };

                // 检测新数据是旧格式还是新格式
                const isOldFormat = !newData.objectives && !newData.questMetaComponents && !newData.taskAddonComponents;

                if (isOldFormat) {
                    // 旧格式：直接作为 objectives
                    if (!mergedData.objectives) {
                        mergedData.objectives = {};
                    }
                    // 遍历旧格式的每个分组
                    for (const group in newData) {
                        if (!mergedData.objectives[group]) {
                            mergedData.objectives[group] = (newData as any)[group];
                        } else {
                            mergedData.objectives[group] = {
                                ...mergedData.objectives[group],
                                ...(newData as any)[group]
                            };
                        }
                    }
                } else {
                    // 新格式：按结构合并
                    // 合并任务目标定义
                    if (newData.objectives) {
                        if (!mergedData.objectives) {
                            mergedData.objectives = {};
                        }
                        // 遍历新数据的每个分组
                        for (const group in newData.objectives) {
                            if (!mergedData.objectives[group]) {
                                // 如果分组不存在，直接添加
                                mergedData.objectives[group] = newData.objectives[group];
                            } else {
                                // 如果分组存在，合并目标定义
                                mergedData.objectives[group] = {
                                    ...mergedData.objectives[group],
                                    ...newData.objectives[group]
                                };
                            }
                        }
                    }

                    // 合并全局组件定义
                    if (newData.questMetaComponents) {
                        if (!mergedData.questMetaComponents) {
                            mergedData.questMetaComponents = [];
                        }
                        // 合并组件，按 id 去重，新的覆盖旧的
                        const componentMap = new Map<string, QuestMetaComponent>();
                        mergedData.questMetaComponents.forEach(comp => componentMap.set(comp.id, comp));
                        newData.questMetaComponents.forEach(comp => componentMap.set(comp.id, comp));
                        mergedData.questMetaComponents = Array.from(componentMap.values());
                    }

                    // 合并任务流程组件定义
                    if (newData.taskAddonComponents) {
                        if (!mergedData.taskAddonComponents) {
                            mergedData.taskAddonComponents = [];
                        }
                        // 合并组件，按 id 去重，新的覆盖旧的
                        const componentMap = new Map<string, TaskAddonComponent>();
                        mergedData.taskAddonComponents.forEach(comp => componentMap.set(comp.id, comp));
                        newData.taskAddonComponents.forEach(comp => componentMap.set(comp.id, comp));
                        mergedData.taskAddonComponents = Array.from(componentMap.values());
                    }

                    // 合并对话节点组件定义
                    if (newData.conversationNodeComponents) {
                        if (!mergedData.conversationNodeComponents) {
                            mergedData.conversationNodeComponents = [];
                        }
                        const componentMap = new Map<string, ConversationNodeComponent>();
                        mergedData.conversationNodeComponents.forEach(comp => componentMap.set(comp.id, comp));
                        newData.conversationNodeComponents.forEach(comp => componentMap.set(comp.id, comp));
                        mergedData.conversationNodeComponents = Array.from(componentMap.values());
                    }

                    // 合并对话玩家选项组件定义
                    if (newData.conversationPlayerOptionComponents) {
                        if (!mergedData.conversationPlayerOptionComponents) {
                            mergedData.conversationPlayerOptionComponents = [];
                        }
                        const componentMap = new Map<string, ConversationPlayerOptionComponent>();
                        mergedData.conversationPlayerOptionComponents.forEach(comp => componentMap.set(comp.id, comp));
                        newData.conversationPlayerOptionComponents.forEach(comp => componentMap.set(comp.id, comp));
                        mergedData.conversationPlayerOptionComponents = Array.from(componentMap.values());
                    }
                }

                set({ apiData: mergedData });
            },
            syncFromApiCenter: () => {
                const apiCenterData = useApiCenterStore.getState().getMergedApiData();
                if (apiCenterData) {
                    set({ apiData: apiCenterData });
                }
            }
        }),
        {
            name: 'chemdah-api-storage',
        }
    )
);
