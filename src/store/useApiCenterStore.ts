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
}

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
          console.log('⚠️ API 源已存在，跳过添加:', source.name);
          return;
        }

        const maxOrder = Math.max(...sources.map(s => s.order), -1);
        const newSource: ApiSource = {
          ...source,
          id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // 添加随机数避免冲突
          order: maxOrder + 1,
          status: 'idle'
        };
        set({ sources: [...sources, newSource] });
        console.log('✅ 已添加 API 源:', source.name);
      },

      addLocalSource: (name, data) => {
        const sources = get().sources;

        // 检查是否已存在同名的源
        const exists = sources.some(s => s.name === name);

        if (exists) {
          console.log('⚠️ API 源已存在，跳过添加:', name);
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
          lastLoaded: new Date().toISOString()
        };
        set({ sources: [...sources, newSource] });
        console.log('✅ 已添加本地 API 源:', name);
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
          console.log('⏭️ 跳过本地源加载:', source.name);
          return;
        }

        // 防止重复加载：如果正在加载，跳过
        if (source.status === 'loading') {
          console.log('⏭️ 源正在加载中，跳过:', source.name);
          return;
        }

        // 只有在非强制重载的情况下才检查是否已加载
        if (!forceReload && source.status === 'success' && source.data) {
          console.log('⏭️ 源已加载，跳过:', source.name);
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

          console.log(`✅ API 源${forceReload ? '重新' : ''}加载成功: ${source.name}`);
        } catch (error: any) {
          get().updateSource(id, {
            status: 'error',
            error: error.message || 'Failed to load API'
          });
          console.error(`❌ API 源加载失败: ${source.name}`, error);
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

        if (sources.length === 0) {
          console.warn('⚠️ 没有可用的 API 源');
          return null;
        }

        // 合并所有 API 数据（新格式）
        const merged: ApiData = {};

        sources.forEach(source => {
          const data = source.data;

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

            // 合并 metas
            if (pluginApi.meta) {
              if (!merged[pluginName].meta) {
                merged[pluginName].meta = {};
              }
              merged[pluginName].meta = {
                ...merged[pluginName].meta,
                ...pluginApi.meta
              };
            }

            // 合并 addons
            if (pluginApi.addon) {
              if (!merged[pluginName].addon) {
                merged[pluginName].addon = {};
              }
              merged[pluginName].addon = {
                ...merged[pluginName].addon,
                ...pluginApi.addon
              };
            }
          }
        });

        // 统计信息
        let objCount = 0, metaCount = 0, addonCount = 0;
        for (const plugin of Object.values(merged)) {
          if (plugin.objective) objCount += Object.keys(plugin.objective).length;
          if (plugin.meta) metaCount += Object.keys(plugin.meta).length;
          if (plugin.addon) addonCount += Object.keys(plugin.addon).length;
        }

        console.log(`📦 API 数据已合并: ${objCount} objectives, ${metaCount} metas, ${addonCount} addons`);

        return merged;
      }
    }),
    {
      name: 'chemdah-api-center-storage',
      version: 2 // 版本号升级，清除旧数据
    }
  )
);
