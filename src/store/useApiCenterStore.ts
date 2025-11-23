import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApiData } from './useApiStore';

export interface ApiSource {
  id: string;
  name: string;
  url?: string; // Optional for file uploads
  enabled: boolean;
  order: number;
  lastLoaded?: string; // ISO timestamp
  status?: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  data?: any; // Loaded API data
  isLocal?: boolean; // True if uploaded from file
  color?: string; // Badge color for this source
}

// 预定义颜色池
const COLOR_POOL = [
  'blue', 'green', 'red', 'yellow', 'orange', 'violet', 'grape',
  'pink', 'cyan', 'teal', 'lime', 'indigo'
];

// 根据已使用的颜色，分配一个新颜色
const assignColor = (existingSources: ApiSource[]): string => {
  const usedColors = existingSources.map(s => s.color).filter(Boolean);
  const availableColors = COLOR_POOL.filter(c => !usedColors.includes(c));
  if (availableColors.length > 0) {
    return availableColors[0];
  }
  // 如果颜色用完了，循环使用
  return COLOR_POOL[existingSources.length % COLOR_POOL.length];
};

interface ApiCenterState {
  sources: ApiSource[];
  addSource: (source: Omit<ApiSource, 'id' | 'order'>) => void;
  addLocalSource: (name: string, data: any) => void;
  removeSource: (id: string) => void;
  updateSource: (id: string, updates: Partial<ApiSource>) => void;
  toggleSource: (id: string) => void;
  reorderSources: (sourceIds: string[]) => void;
  loadSource: (id: string, forceReload?: boolean) => Promise<void>;
  loadAllEnabledSources: (forceReload?: boolean) => Promise<void>;
  getMergedApiData: () => ApiData | null;
}

export const useApiCenterStore = create<ApiCenterState>()(
  persist(
    (set, get) => ({
      sources: [],

      addSource: (source) => {
        const sources = get().sources;

        // 检查是否已存在同名或同 URL 的源
        const exists = sources.some(s =>
          s.name === source.name ||
          (source.url && s.url === source.url)
        );

        if (exists) {
          return;
        }

        const maxOrder = Math.max(...sources.map(s => s.order), -1);
        const newSource: ApiSource = {
          ...source,
          id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // 添加随机数避免冲突
          order: maxOrder + 1,
          status: 'idle',
          color: source.color || assignColor(sources) // 自动分配颜色
        };
        set({ sources: [...sources, newSource] });
      },

      addLocalSource: (name, data) => {
        const sources = get().sources;

        // 检查是否已存在同名的源
        const exists = sources.some(s => s.name === name);

        if (exists) {
          return;
        }

        const maxOrder = Math.max(...sources.map(s => s.order), -1);
        const newSource: ApiSource = {
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // 添加随机数避免冲突
          name,
          enabled: true,
          order: maxOrder + 1,
          status: 'success',
          data,
          isLocal: true,
          lastLoaded: new Date().toISOString(),
          color: assignColor(sources) // 自动分配颜色
        };
        set({ sources: [...sources, newSource] });
      },

      removeSource: (id) => {
        if (id === 'default') return; // Prevent removing default
        set({ sources: get().sources.filter(s => s.id !== id) });
      },

      updateSource: (id, updates) => {
        set({
          sources: get().sources.map(s =>
            s.id === id ? { ...s, ...updates } : s
          )
        });
      },

      toggleSource: (id) => {
        set({
          sources: get().sources.map(s =>
            s.id === id ? { ...s, enabled: !s.enabled } : s
          )
        });
      },

      reorderSources: (sourceIds) => {
        const sources = get().sources;
        const reordered = sourceIds.map((id, index) => {
          const source = sources.find(s => s.id === id);
          return source ? { ...source, order: index } : null;
        }).filter(Boolean) as ApiSource[];
        set({ sources: reordered });
      },

      loadSource: async (id, forceReload = false) => {
        const source = get().sources.find(s => s.id === id);
        if (!source) return;

        // Skip loading for local sources (already have data)
        if (source.isLocal) {
          return;
        }

        // 防止重复加载：如果正在加载，跳过
        if (source.status === 'loading') {
          return;
        }

        // 只有在非强制重载的情况下才检查是否已加载
        if (!forceReload && source.status === 'success' && source.data) {
          return;
        }

        if (!source.url) {
          get().updateSource(id, {
            status: 'error',
            error: 'No URL specified'
          });
          return;
        }

        get().updateSource(id, { status: 'loading', error: undefined });

        try {
          // 添加时间戳参数以避免浏览器缓存
          const urlWithTimestamp = `${source.url}${source.url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
          const response = await fetch(urlWithTimestamp, {
            cache: 'no-cache', // 禁用浏览器缓存
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const data = await response.json();

          get().updateSource(id, {
            status: 'success',
            data,
            lastLoaded: new Date().toISOString(),
            error: undefined
          });
        } catch (error: any) {
          get().updateSource(id, {
            status: 'error',
            error: error.message || 'Failed to load API'
          });
        }
      },

      loadAllEnabledSources: async (forceReload = false) => {
        const enabledSources = get().sources.filter(s => s.enabled);
        await Promise.all(
          enabledSources.map(source => get().loadSource(source.id, forceReload))
        );
      },

      getMergedApiData: () => {
        const sources = get().sources
          .filter(s => s.enabled && s.status === 'success' && s.data)
          .sort((a, b) => a.order - b.order);

        // 为没有颜色的源分配颜色（迁移旧数据）
        let needsUpdate = false;
        sources.forEach((source, index) => {
          if (!source.color) {
            needsUpdate = true;
            const assignedColor = COLOR_POOL[index % COLOR_POOL.length];
            get().updateSource(source.id, { color: assignedColor });
          }
        });

        // 如果有更新，重新获取源列表
        const finalSources = needsUpdate
          ? get().sources.filter(s => s.enabled && s.status === 'success' && s.data).sort((a, b) => a.order - b.order)
          : sources;

        if (finalSources.length === 0) {
          return null;
        }

        // 合并所有 API 数据（新格式）
        const merged: ApiData = {};

        finalSources.forEach(source => {
          const data = source.data;
          const sourceColor = source.color || 'gray'; // 获取源的颜色配置

          // 遍历每个插件
          for (const [pluginName, pluginData] of Object.entries(data)) {
            // 确保插件存在
            if (!merged[pluginName]) {
              merged[pluginName] = {};
            }

            const pluginApi = pluginData as any;

            // 合并 objectives
            if (pluginApi.objective) {
              if (!merged[pluginName].objective) {
                merged[pluginName].objective = {};
              }
              merged[pluginName].objective = {
                ...merged[pluginName].objective,
                ...pluginApi.objective
              };
            }

            // 合并 metas（支持所有格式）
            // meta = 通用（both）
            // quest_meta = Quest 专用（quest_only 或 quest）
            // task_meta = Task 专用（task_only 或 task）
            // questmeta = Quest 专用（兼容无下划线格式）
            // taskmeta = Task 专用（兼容无下划线格式）
            const metaSources = [
              { data: pluginApi.meta, type: 'meta' },
              { data: pluginApi.quest_meta, type: 'quest_meta' },
              { data: pluginApi.task_meta, type: 'task_meta' },
              { data: pluginApi.questmeta, type: 'questmeta' },
              { data: pluginApi.taskmeta, type: 'taskmeta' }
            ];

            for (const { data: metaData } of metaSources) {
              if (metaData) {
                if (!merged[pluginName].meta) {
                  merged[pluginName].meta = {};
                }

                // 为每个 meta 添加 _source 和 _sourceColor 字段标记来源
                const metaDataWithSource: Record<string, any> = {};
                for (const [key, value] of Object.entries(metaData)) {
                  metaDataWithSource[key] = {
                    ...(value as Record<string, any>),
                    _source: pluginName,      // 记录原始插件来源
                    _sourceColor: sourceColor // 记录源的颜色配置
                  };
                }

                // 合并时保持原始定义，不修改 scope
                merged[pluginName].meta = {
                  ...merged[pluginName].meta,
                  ...metaDataWithSource
                };
              }
            }

            // 合并 addons（支持所有格式）
            // addon = 通用（both）
            // quest_addon = Quest 专用（quest_only 或 quest）
            // task_addon = Task 专用（task_only 或 task）
            // questaddon = Quest 专用（兼容无下划线格式）
            // taskaddon = Task 专用（兼容无下划线格式）
            const addonSources = [
              { data: pluginApi.addon, type: 'addon' },
              { data: pluginApi.quest_addon, type: 'quest_addon' },
              { data: pluginApi.task_addon, type: 'task_addon' },
              { data: pluginApi.questaddon, type: 'questaddon' },
              { data: pluginApi.taskaddon, type: 'taskaddon' }
            ];

            for (const { data: addonData } of addonSources) {
              if (addonData) {
                if (!merged[pluginName].addon) {
                  merged[pluginName].addon = {};
                }

                // 为每个 addon 添加 _source 和 _sourceColor 字段标记来源
                const addonDataWithSource: Record<string, any> = {};
                for (const [key, value] of Object.entries(addonData)) {
                  addonDataWithSource[key] = {
                    ...(value as Record<string, any>),
                    _source: pluginName,      // 记录原始插件来源
                    _sourceColor: sourceColor // 记录源的颜色配置
                  };
                }

                // 合并时保持原始定义，不修改 scope
                merged[pluginName].addon = {
                  ...merged[pluginName].addon,
                  ...addonDataWithSource
                };
              }
            }
          }
        });

        // 统计信息
        let objCount = 0, metaCount = 0, addonCount = 0;
        for (const plugin of Object.values(merged)) {
          if (plugin.objective) {
            objCount += Object.keys(plugin.objective).length;
          }
          if (plugin.meta) {
            metaCount += Object.keys(plugin.meta).length;
          }
          if (plugin.addon) {
            addonCount += Object.keys(plugin.addon).length;
          }
        }

        return merged;
      }
    }),
    {
      name: 'chemdah-api-center-storage',
      version: 2 // 版本号升级，清除旧数据
    }
  )
);
