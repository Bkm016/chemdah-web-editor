/**
 * IndexedDB 存储工具类
 * 用于存储任务和对话文件数据
 */

const DB_NAME = 'chemdah-editor-db';
const DB_VERSION = 1;
const STORE_NAME = 'project-files';

export interface ProjectData {
    conversationFiles: Record<string, any>;
    conversationFolders: Record<string, any>;
    questFiles: Record<string, any>;
    questFolders: Record<string, any>;
    activeFile: string | null;
}

class IndexedDBStorage {
    private db: IDBDatabase | null = null;
    private initPromise: Promise<IDBDatabase> | null = null;

    /**
     * 初始化数据库
     */
    private async init(): Promise<IDBDatabase> {
        if (this.db) {
            return this.db;
        }

        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('[IndexedDB] 打开数据库失败:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                // console.log('[IndexedDB] 数据库打开成功');
                resolve(this.db);
            };

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result;
                // console.log('[IndexedDB] 数据库升级:', event.oldVersion, '->', event.newVersion);

                // 创建 object store
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                    // console.log('[IndexedDB] 创建 object store:', STORE_NAME);
                }
            };
        });

        return this.initPromise;
    }

    /**
     * 保存项目数据
     */
    async saveProject(data: ProjectData): Promise<void> {
        const db = await this.init();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(data, 'project-data');

            request.onsuccess = () => {
                // console.log('[IndexedDB] 项目数据保存成功');
                resolve();
            };

            request.onerror = () => {
                console.error('[IndexedDB] 项目数据保存失败:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * 加载项目数据
     */
    async loadProject(): Promise<ProjectData | null> {
        const db = await this.init();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get('project-data');

            request.onsuccess = () => {
                const data = request.result as ProjectData | undefined;
                // console.log('[IndexedDB] 项目数据加载成功:', data ? '有数据' : '无数据');
                resolve(data || null);
            };

            request.onerror = () => {
                console.error('[IndexedDB] 项目数据加载失败:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * 清空所有项目数据
     */
    async clearProject(): Promise<void> {
        const db = await this.init();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete('project-data');

            request.onsuccess = () => {
                // console.log('[IndexedDB] 项目数据已清空');
                resolve();
            };

            request.onerror = () => {
                console.error('[IndexedDB] 清空项目数据失败:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * 从 localStorage 迁移数据到 IndexedDB
     */
    async migrateFromLocalStorage(): Promise<boolean> {
        try {
            const localStorageKey = 'chemdah-project-storage';
            const oldData = localStorage.getItem(localStorageKey);

            if (!oldData) {
                // console.log('[IndexedDB] 无需迁移：localStorage 中无数据');
                return false;
            }

            const parsed = JSON.parse(oldData);
            const projectData: ProjectData = {
                conversationFiles: parsed.state?.conversationFiles || {},
                conversationFolders: parsed.state?.conversationFolders || {},
                questFiles: parsed.state?.questFiles || {},
                questFolders: parsed.state?.questFolders || {},
                activeFile: parsed.state?.activeFileId || null
            };

            await this.saveProject(projectData);
            // console.log('[IndexedDB] 数据迁移成功，从 localStorage 迁移到 IndexedDB');

            // 迁移成功后删除 localStorage 中的数据
            localStorage.removeItem(localStorageKey);
            // console.log('[IndexedDB] 已清理 localStorage 中的旧数据');

            return true;
        } catch (error) {
            console.error('[IndexedDB] 数据迁移失败:', error);
            return false;
        }
    }
}

// 导出单例
export const indexedDBStorage = new IndexedDBStorage();
