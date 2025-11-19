import { create } from 'zustand';
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
  type?: FileType;
}

interface ProjectState {
  files: Record<string, VirtualFile>;
  folders: Record<string, VirtualFolder>;
  activeFileId: string | null;
  
  // Actions
  createFile: (name: string, type: FileType, path: string, initialContent?: string) => void;
  deleteFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  renameFile: (id: string, newName: string) => void;
  moveFile: (id: string, newPath: string) => void;
  
  createFolder: (name: string, path: string, type: FileType) => void;
  deleteFolder: (id: string) => void;
  renameFolder: (id: string, newName: string) => void;
  
  setActiveFile: (id: string | null) => void;
  importFiles: (files: VirtualFile[]) => void;
}

const DEFAULT_QUEST = `
example_quest:
  meta:
    name: "Example Quest"
    type: "L1"
  task:
    0:
      objective: "block break"
      condition:
        material: "stone"
      goal:
        amount: 10
`;

const DEFAULT_CONVERSATION = `
conversation_0:
  npc:
    - "Hello, traveler!"
  player:
    - reply: "Hello!"
      then: "goto conversation_1"
`;

export const useProjectStore = create<ProjectState>((set) => ({
  files: {
    '1': { id: '1', name: 'example_quest.yml', type: 'quest', path: '', content: DEFAULT_QUEST },
    '2': { id: '2', name: 'example_conversation.yml', type: 'conversation', path: '', content: DEFAULT_CONVERSATION },
  },
  folders: {},
  activeFileId: '1',

  createFile: (name, type, path, initialContent = '') => set((state) => {
    const id = uuidv4();
    return {
      files: {
        ...state.files,
        [id]: { id, name, type, path, content: initialContent }
      },
      activeFileId: id
    };
  }),

  deleteFile: (id) => set((state) => {
    const newFiles = { ...state.files };
    delete newFiles[id];
    return { 
      files: newFiles,
      activeFileId: state.activeFileId === id ? null : state.activeFileId
    };
  }),

  updateFileContent: (id, content) => set((state) => ({
    files: {
      ...state.files,
      [id]: { ...state.files[id], content }
    }
  })),

  renameFile: (id, newName) => set((state) => ({
    files: {
      ...state.files,
      [id]: { ...state.files[id], name: newName }
    }
  })),

  moveFile: (id, newPath) => set((state) => ({
    files: {
      ...state.files,
      [id]: { ...state.files[id], path: newPath }
    }
  })),

  createFolder: (name, path, type) => set((state) => {
    const id = uuidv4();
    return {
      folders: {
        ...state.folders,
        [id]: { id, name, path, type }
      }
    };
  }),

  deleteFolder: (id) => set((state) => {
    const newFolders = { ...state.folders };
    delete newFolders[id];
    return { folders: newFolders };
  }),

  renameFolder: (id, newName) => set((state) => {
    const folder = state.folders[id];
    if (!folder) return state;
    
    const oldPath = folder.path ? `${folder.path}/${folder.name}` : folder.name;
    const newPath = folder.path ? `${folder.path}/${newName}` : newName;
    
    // Update the folder itself
    const newFolders = { ...state.folders, [id]: { ...folder, name: newName } };
    
    // Update all files that start with oldPath
    const newFiles = { ...state.files };
    Object.values(newFiles).forEach(file => {
        if (file.path === oldPath) {
            newFiles[file.id] = { ...file, path: newPath };
        } else if (file.path.startsWith(oldPath + '/')) {
            newFiles[file.id] = { ...file, path: file.path.replace(oldPath, newPath) };
        }
    });
    
    // Update all folders that start with oldPath
    Object.values(newFolders).forEach(f => {
        if (f.id === id) return; // Skip self
        if (f.path === oldPath) {
            newFolders[f.id] = { ...f, path: newPath };
        } else if (f.path.startsWith(oldPath + '/')) {
            newFolders[f.id] = { ...f, path: f.path.replace(oldPath, newPath) };
        }
    });
    
    return { files: newFiles, folders: newFolders };
  }),

  setActiveFile: (id) => set({ activeFileId: id }),

  importFiles: (newFiles) => set(() => {
    const fileMap = newFiles.reduce((acc, f) => ({ ...acc, [f.id]: f }), {});
    return {
      files: fileMap,
      activeFileId: newFiles.length > 0 ? newFiles[0].id : null
    };
  })
}));
