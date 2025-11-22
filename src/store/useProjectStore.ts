import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type FileType = 'quest' | 'conversation' | 'script' | 'config';

export interface VirtualFile {
  id: string;
  name: string;
  type: FileType;
  content: string;
  path: string; // logical path e.g. "core/quest/example.yml"
}

export interface VirtualFolder {
  id: string;
  name: string;
  path: string; // parent path e.g. "core" or ""
  type: FileType;
}

interface ProjectState {
  questFiles: Record<string, VirtualFile>;
  questFolders: Record<string, VirtualFolder>;
  conversationFiles: Record<string, VirtualFile>;
  conversationFolders: Record<string, VirtualFolder>;

  activeFileId: string | null;
  activeFileType: FileType | null;
  
  // Actions
  createFile: (name: string, type: FileType, path: string, initialContent?: string) => { success: boolean; message?: string };
  deleteFile: (id: string, type: FileType) => void;
  updateFileContent: (id: string, type: FileType, content: string) => void;
  renameFile: (id: string, type: FileType, newName: string) => void;
  moveFile: (id: string, type: FileType, newPath: string) => { success: boolean; message?: string };
  
  createFolder: (name: string, path: string, type: FileType) => void;
  deleteFolder: (id: string, type: FileType) => void;
  renameFolder: (id: string, type: FileType, newName: string) => void;
  moveFolder: (id: string, type: FileType, newPath: string) => { success: boolean; message?: string };
  
  setActiveFile: (id: string | null, type?: FileType) => void;
  importFiles: (files: VirtualFile[]) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      questFiles: {},
      questFolders: {},
      conversationFiles: {},
      conversationFolders: {},
      activeFileId: null,
      activeFileType: null,

      createFile: (name, type, path, initialContent = '') => {
        const state = get();
        const files = type === 'quest' ? state.questFiles : state.conversationFiles;
        
        // Check if file exists
        const exists = Object.values(files).some(f => f.name === name && f.path === path);
        if (exists) {
            return { success: false, message: `File '${name}' already exists in '${path || 'root'}'` };
        }

        set((state) => {
            const id = uuidv4();
            const newFile = { id, name, type, path, content: initialContent };
            
            if (type === 'quest') {
            return {
                questFiles: { ...state.questFiles, [id]: newFile },
                activeFileId: id,
                activeFileType: type
            };
            } else {
            return {
                conversationFiles: { ...state.conversationFiles, [id]: newFile },
                activeFileId: id,
                activeFileType: type
            };
            }
        });
        return { success: true };
      },

      deleteFile: (id, type) => set((state) => {
        if (type === 'quest') {
          const newFiles = { ...state.questFiles };
          delete newFiles[id];
          return { 
            questFiles: newFiles,
            activeFileId: state.activeFileId === id ? null : state.activeFileId,
            activeFileType: state.activeFileId === id ? null : state.activeFileType
          };
        } else {
          const newFiles = { ...state.conversationFiles };
          delete newFiles[id];
          return { 
            conversationFiles: newFiles,
            activeFileId: state.activeFileId === id ? null : state.activeFileId,
            activeFileType: state.activeFileId === id ? null : state.activeFileType
          };
        }
      }),

      updateFileContent: (id, type, content) => set((state) => {
        if (type === 'quest') {
          return {
            questFiles: {
              ...state.questFiles,
              [id]: { ...state.questFiles[id], content }
            }
          };
        } else {
          return {
            conversationFiles: {
              ...state.conversationFiles,
              [id]: { ...state.conversationFiles[id], content }
            }
          };
        }
      }),

      renameFile: (id, type, newName) => set((state) => {
        if (type === 'quest') {
          return {
            questFiles: {
              ...state.questFiles,
              [id]: { ...state.questFiles[id], name: newName }
            }
          };
        } else {
          return {
            conversationFiles: {
              ...state.conversationFiles,
              [id]: { ...state.conversationFiles[id], name: newName }
            }
          };
        }
      }),

      moveFile: (id, type, newPath) => {
        const state = get();
        const files = type === 'quest' ? state.questFiles : state.conversationFiles;
        const file = files[id];
        
        if (!file) return { success: false, message: 'File not found' };

        // Normalize paths (remove trailing slashes)
        const normalizedNewPath = newPath.replace(/\/+$/, '');
        const normalizedCurrentPath = file.path.replace(/\/+$/, '');

        if (normalizedCurrentPath === normalizedNewPath) {
            return { success: false, message: `File is already in '${normalizedNewPath || 'root'}'` };
        }

        // Check if file with same name exists in destination
        const exists = Object.values(files).some(f => f.id !== id && f.name === file.name && f.path === normalizedNewPath);
        if (exists) {
            return { success: false, message: `File '${file.name}' already exists in '${normalizedNewPath || 'root'}'` };
        }

        set((state) => {
          if (type === 'quest') {
            return {
                questFiles: {
                    ...state.questFiles,
                    [id]: { ...state.questFiles[id], path: normalizedNewPath }
                }
            };
          } else {
            return {
                conversationFiles: {
                    ...state.conversationFiles,
                    [id]: { ...state.conversationFiles[id], path: normalizedNewPath }
                }
            };
          }
        });
        return { success: true };
      },

      createFolder: (name, path, type) => set((state) => {
        const id = uuidv4();
        const newFolder = { id, name, path, type };
        
        if (type === 'quest') {
          return {
            questFolders: { ...state.questFolders, [id]: newFolder }
          };
        } else {
          return {
            conversationFolders: { ...state.conversationFolders, [id]: newFolder }
          };
        }
      }),

      deleteFolder: (id, type) => set((state) => {
        if (type === 'quest') {
          const newFolders = { ...state.questFolders };
          delete newFolders[id];
          return { questFolders: newFolders };
        } else {
          const newFolders = { ...state.conversationFolders };
          delete newFolders[id];
          return { conversationFolders: newFolders };
        }
      }),

      renameFolder: (id, type, newName) => set((state) => {
        const folders = type === 'quest' ? state.questFolders : state.conversationFolders;
        const folder = folders[id];
        if (!folder) return state;
        
        const oldPath = folder.path ? `${folder.path}/${folder.name}` : folder.name;
        const newPath = folder.path ? `${folder.path}/${newName}` : newName;
        
        if (type === 'quest') {
            const newFolders = { ...state.questFolders, [id]: { ...folder, name: newName } };
            const newFiles = { ...state.questFiles };
            
            // Update files
            Object.values(newFiles).forEach(file => {
                if (file.path === oldPath) {
                    newFiles[file.id] = { ...file, path: newPath };
                } else if (file.path.startsWith(oldPath + '/')) {
                    newFiles[file.id] = { ...file, path: file.path.replace(oldPath, newPath) };
                }
            });
            
            // Update folders
            Object.values(newFolders).forEach(f => {
                if (f.id === id) return;
                if (f.path === oldPath) {
                    newFolders[f.id] = { ...f, path: newPath };
                } else if (f.path.startsWith(oldPath + '/')) {
                    newFolders[f.id] = { ...f, path: f.path.replace(oldPath, newPath) };
                }
            });
            return { questFiles: newFiles, questFolders: newFolders };
        } else {
            const newFolders = { ...state.conversationFolders, [id]: { ...folder, name: newName } };
            const newFiles = { ...state.conversationFiles };
            
            // Update files
            Object.values(newFiles).forEach(file => {
                if (file.path === oldPath) {
                    newFiles[file.id] = { ...file, path: newPath };
                } else if (file.path.startsWith(oldPath + '/')) {
                    newFiles[file.id] = { ...file, path: file.path.replace(oldPath, newPath) };
                }
            });
            
            // Update folders
            Object.values(newFolders).forEach(f => {
                if (f.id === id) return;
                if (f.path === oldPath) {
                    newFolders[f.id] = { ...f, path: newPath };
                } else if (f.path.startsWith(oldPath + '/')) {
                    newFolders[f.id] = { ...f, path: f.path.replace(oldPath, newPath) };
                }
            });
            return { conversationFiles: newFiles, conversationFolders: newFolders };
        }
      }),

      moveFolder: (id, type, newPath) => {
        const state = get();
        const folders = type === 'quest' ? state.questFolders : state.conversationFolders;
        
        // 1. Determine old path and folder name
        let oldPath = '';
        let folderName = '';
        const folder = folders[id];

        if (folder) {
            // Explicit folder
            oldPath = folder.path ? `${folder.path}/${folder.name}` : folder.name;
            folderName = folder.name;
        } else if (id.startsWith('folder-')) {
            // Implicit folder
            oldPath = id.replace('folder-', '');
            const parts = oldPath.split('/');
            folderName = parts[parts.length - 1];
        } else {
            return { success: false, message: 'Folder not found' };
        }
        
        // 2. Check if moving to same location
        const currentParentPath = oldPath.includes('/') ? oldPath.substring(0, oldPath.lastIndexOf('/')) : '';
        
        // Normalize paths
        const normalizedNewPath = newPath.replace(/\/+$/, '');
        const normalizedCurrentParentPath = currentParentPath.replace(/\/+$/, '');

        if (normalizedNewPath === normalizedCurrentParentPath) {
            return { success: false, message: `Folder '${folderName}' is already in '${normalizedNewPath || 'root'}'` };
        }

        // 3. Check for circular dependency
        if (normalizedNewPath === oldPath || normalizedNewPath.startsWith(oldPath + '/')) {
            return { success: false, message: `Cannot move folder '${folderName}' into itself or its children` };
        }

        const newFolderPath = normalizedNewPath ? `${normalizedNewPath}/${folderName}` : folderName;

        set((state) => {
            if (type === 'quest') {
                const newFolders = { ...state.questFolders };
                const newFiles = { ...state.questFiles };

                if (folder) {
                    newFolders[id] = { ...folder, path: normalizedNewPath };
                }

                Object.values(newFiles).forEach(file => {
                    if (file.path === oldPath) {
                        newFiles[file.id] = { ...file, path: newFolderPath };
                    } else if (file.path.startsWith(oldPath + '/')) {
                        newFiles[file.id] = { ...file, path: file.path.replace(oldPath, newFolderPath) };
                    }
                });

                Object.values(newFolders).forEach(f => {
                    if (f.id === id) return;
                    if (f.path === oldPath) {
                        newFolders[f.id] = { ...f, path: newFolderPath };
                    } else if (f.path.startsWith(oldPath + '/')) {
                        newFolders[f.id] = { ...f, path: f.path.replace(oldPath, newFolderPath) };
                    }
                });

                return { questFiles: newFiles, questFolders: newFolders };
            } else {
                const newFolders = { ...state.conversationFolders };
                const newFiles = { ...state.conversationFiles };

                if (folder) {
                    newFolders[id] = { ...folder, path: normalizedNewPath };
                }

                Object.values(newFiles).forEach(file => {
                    if (file.path === oldPath) {
                        newFiles[file.id] = { ...file, path: newFolderPath };
                    } else if (file.path.startsWith(oldPath + '/')) {
                        newFiles[file.id] = { ...file, path: file.path.replace(oldPath, newFolderPath) };
                    }
                });

                Object.values(newFolders).forEach(f => {
                    if (f.id === id) return;
                    if (f.path === oldPath) {
                        newFolders[f.id] = { ...f, path: newFolderPath };
                    } else if (f.path.startsWith(oldPath + '/')) {
                        newFolders[f.id] = { ...f, path: f.path.replace(oldPath, newFolderPath) };
                    }
                });

                return { conversationFiles: newFiles, conversationFolders: newFolders };
            }
        });
        
        return { success: true };
      },

      setActiveFile: (id, type) => set((state) => ({ 
        activeFileId: id,
        activeFileType: type || (id ? state.activeFileType : null)
      })),

      importFiles: (newFiles) => set((state) => {
        const newQuestFiles = { ...state.questFiles };
        const newConversationFiles = { ...state.conversationFiles };
        
        newFiles.forEach(f => {
            if (f.type === 'quest') {
                newQuestFiles[f.id] = f;
            } else {
                newConversationFiles[f.id] = f;
            }
        });

        return {
          questFiles: newQuestFiles,
          conversationFiles: newConversationFiles,
          activeFileId: newFiles.length > 0 ? newFiles[0].id : state.activeFileId,
          activeFileType: newFiles.length > 0 ? newFiles[0].type : state.activeFileType
        };
      })
    }),
    {
      name: 'chemdah-project-storage',
      // 添加防抖,避免频繁写入 localStorage
      skipHydration: false,
      // 使用自定义存储,添加防抖
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (() => {
          let timer: number | null = null;
          return (name: string, value: any) => {
            // 防抖 1 秒
            if (timer) clearTimeout(timer);
            timer = window.setTimeout(() => {
              localStorage.setItem(name, JSON.stringify(value));
              timer = null;
            }, 1000);
          };
        })(),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
