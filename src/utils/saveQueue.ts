/**
 * 异步保存队列
 * 用于在不阻塞主线程的情况下处理数据保存
 */

interface SaveTask {
    id: string;
    data: any;
    timestamp: number;
}

class SaveQueue {
    private queue: Map<string, SaveTask> = new Map();
    private processing = false;

    constructor() {
        // 使用 requestIdleCallback 在浏览器空闲时处理保存
        this.startProcessing();
    }

    /**
     * 添加保存任务
     * @param id 任务唯一标识
     * @param data 要保存的数据
     */
    enqueue(id: string, data: any) {
        // 深度克隆数据,避免引用问题
        const clonedData = this.deepClone(data);

        this.queue.set(id, {
            id,
            data: clonedData,
            timestamp: Date.now()
        });

        // 触发处理
        if (!this.processing) {
            this.processQueue();
        }
    }

    /**
     * 深度克隆对象
     */
    private deepClone(obj: any): any {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }

        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }

        if (obj instanceof Object) {
            const clonedObj: any = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }

        return obj;
    }

    /**
     * 开始处理队列
     */
    private startProcessing() {
        // 使用 requestIdleCallback 在浏览器空闲时处理
        const processInIdle = () => {
            if ('requestIdleCallback' in window) {
                requestIdleCallback((deadline) => {
                    this.processQueue(deadline);
                    processInIdle();
                }, { timeout: 1000 });
            } else {
                // 降级方案:使用 setTimeout
                setTimeout(() => {
                    this.processQueue();
                    processInIdle();
                }, 100);
            }
        };

        processInIdle();
    }

    /**
     * 处理队列中的任务
     */
    private processQueue(deadline?: IdleDeadline) {
        if (this.queue.size === 0) {
            this.processing = false;
            return;
        }

        this.processing = true;

        // 批量处理任务
        const tasks = Array.from(this.queue.values());

        for (const task of tasks) {
            // 如果有 deadline,检查是否还有时间
            if (deadline && deadline.timeRemaining() < 1) {
                break;
            }

            try {
                // 执行保存
                this.saveTask(task);
                // 从队列中移除
                this.queue.delete(task.id);
            } catch (error) {
                console.error(`保存任务失败 [${task.id}]:`, error);
                // 失败的任务也要移除,避免无限重试
                this.queue.delete(task.id);
            }
        }
    }

    /**
     * 执行具体的保存操作
     */
    private saveTask(task: SaveTask) {
        // 这里可以扩展为不同类型的保存操作
        // 目前主要是 localStorage
        try {
            const serialized = JSON.stringify(task.data);
            localStorage.setItem(task.id, serialized);
        } catch (error) {
            console.error(`序列化失败 [${task.id}]:`, error);
            throw error;
        }
    }

    /**
     * 立即处理所有待处理任务(用于页面卸载前)
     */
    flush() {
        const tasks = Array.from(this.queue.values());
        for (const task of tasks) {
            try {
                this.saveTask(task);
            } catch (error) {
                console.error(`刷新队列失败 [${task.id}]:`, error);
            }
        }
        this.queue.clear();
    }

    /**
     * 获取队列大小
     */
    size(): number {
        return this.queue.size;
    }
}

// 全局单例
export const saveQueue = new SaveQueue();

// 页面卸载前刷新队列
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        saveQueue.flush();
    });

    // 页面隐藏时也刷新
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            saveQueue.flush();
        }
    });
}
