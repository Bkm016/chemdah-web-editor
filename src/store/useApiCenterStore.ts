import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  loadSource: (id: string) => Promise<void>;
  loadAllEnabledSources: () => Promise<void>;
  getMergedApiData: () => any;
}

export const useApiCenterStore = create<ApiCenterState>()(
  persist(
    (set, get) => ({
      sources: [
        {
          id: 'default',
          name: 'Default API',
          url: './api.json',
          enabled: true,
          order: 0,
          status: 'idle'
        }
      ],

      addSource: (source) => {
        const sources = get().sources;
        const maxOrder = Math.max(...sources.map(s => s.order), -1);
        const newSource: ApiSource = {
          ...source,
          id: `api_${Date.now()}`,
          order: maxOrder + 1,
          status: 'idle'
        };
        set({ sources: [...sources, newSource] });
      },

      addLocalSource: (name, data) => {
        const sources = get().sources;
        const maxOrder = Math.max(...sources.map(s => s.order), -1);
        const newSource: ApiSource = {
          id: `local_${Date.now()}`,
          name,
          enabled: true,
          order: maxOrder + 1,
          status: 'success',
          data,
          isLocal: true,
          lastLoaded: new Date().toISOString()
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

      loadSource: async (id) => {
        const source = get().sources.find(s => s.id === id);
        if (!source) return;

        // Skip loading for local sources (already have data)
        if (source.isLocal) {
          console.log('Skipping load for local source:', source.name);
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
          const response = await fetch(source.url);
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

      loadAllEnabledSources: async () => {
        const enabledSources = get().sources.filter(s => s.enabled);
        await Promise.all(
          enabledSources.map(source => get().loadSource(source.id))
        );
      },

      getMergedApiData: () => {
        const sources = get().sources
          .filter(s => s.enabled && s.status === 'success' && s.data)
          .sort((a, b) => a.order - b.order);

        if (sources.length === 0) return null;

        // Merge all API data in order using the same logic as useApiStore
        const merged: any = {
          objectives: {},
          questMetaComponents: [],
          taskAddonComponents: [],
          conversationNodeComponents: [],
          conversationPlayerOptionComponents: []
        };

        sources.forEach(source => {
          const data = source.data;

          // 检测是否为旧格式（直接是 conditions/goals 结构）
          const isOldFormat = !data.objectives && !data.questMetaComponents && !data.taskAddonComponents;

          if (isOldFormat) {
            // 旧格式：每个顶层 key 是一个分组
            for (const group in data) {
              if (!merged.objectives[group]) {
                merged.objectives[group] = data[group];
              } else {
                // 合并目标定义
                merged.objectives[group] = {
                  ...merged.objectives[group],
                  ...data[group]
                };
              }
            }
          } else {
            // 新格式
            // 合并 objectives
            if (data.objectives) {
              for (const group in data.objectives) {
                if (!merged.objectives[group]) {
                  merged.objectives[group] = data.objectives[group];
                } else {
                  merged.objectives[group] = {
                    ...merged.objectives[group],
                    ...data.objectives[group]
                  };
                }
              }
            }

            // 合并 questMetaComponents
            if (data.questMetaComponents) {
              const componentMap = new Map();
              merged.questMetaComponents.forEach((comp: any) => componentMap.set(comp.id, comp));
              data.questMetaComponents.forEach((comp: any) => componentMap.set(comp.id, comp));
              merged.questMetaComponents = Array.from(componentMap.values());
            }

            // 合并 taskAddonComponents
            if (data.taskAddonComponents) {
              const componentMap = new Map();
              merged.taskAddonComponents.forEach((comp: any) => componentMap.set(comp.id, comp));
              data.taskAddonComponents.forEach((comp: any) => componentMap.set(comp.id, comp));
              merged.taskAddonComponents = Array.from(componentMap.values());
            }

            // 合并 conversationNodeComponents
            if (data.conversationNodeComponents) {
              const componentMap = new Map();
              merged.conversationNodeComponents.forEach((comp: any) => componentMap.set(comp.id, comp));
              data.conversationNodeComponents.forEach((comp: any) => componentMap.set(comp.id, comp));
              merged.conversationNodeComponents = Array.from(componentMap.values());
            }

            // 合并 conversationPlayerOptionComponents
            if (data.conversationPlayerOptionComponents) {
              const componentMap = new Map();
              merged.conversationPlayerOptionComponents.forEach((comp: any) => componentMap.set(comp.id, comp));
              data.conversationPlayerOptionComponents.forEach((comp: any) => componentMap.set(comp.id, comp));
              merged.conversationPlayerOptionComponents = Array.from(componentMap.values());
            }
          }
        });

        // 如果没有任何数据，返回 null
        if (Object.keys(merged.objectives).length === 0 &&
            merged.questMetaComponents.length === 0 &&
            merged.taskAddonComponents.length === 0) {
          return null;
        }

        return merged;
      }
    }),
    {
      name: 'chemdah-api-center-storage',
      version: 1
    }
  )
);
