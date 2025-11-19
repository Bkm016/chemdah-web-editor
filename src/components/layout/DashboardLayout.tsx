import { AppShell, Group, Title, Button, Stack, Text, ScrollArea, ActionIcon, Box, TextInput, Menu, Modal, FileButton, Highlight, SegmentedControl } from '@mantine/core';
import { IconPlus, IconTrash, IconFileText, IconSearch, IconEdit, IconDotsVertical, IconDownload, IconUpload, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconFolderPlus, IconFilePlus } from '@tabler/icons-react';
import { useState, useEffect, useMemo } from 'react';
import { useProjectStore, FileType, VirtualFile } from '../../store/useProjectStore';
import { FileTree, TreeItem } from '../ui';
import QuestEditor from '../editors/quest/QuestEditor';
import ConversationEditor from '../editors/conversation/ConversationEditor';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<string>('quest');
  const { files, folders, activeFileId, setActiveFile, createFile, deleteFile, renameFile, importFiles, moveFile, createFolder, deleteFolder, renameFolder } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpened, { toggle: toggleSidebar }] = useDisclosure(true);
  
  // Rename Modal State
  const [renameModalOpened, { open: openRenameModal, close: closeRenameModal }] = useDisclosure(false);
  const [itemToRename, setItemToRename] = useState<{ id: string, name: string, isFolder?: boolean } | null>(null);
  const [newName, setNewName] = useState('');

  // New Folder Modal State
  const [newFolderModalOpened, { open: openNewFolderModal, close: closeNewFolderModal }] = useDisclosure(false);
  const [newFolderName, setNewFolderName] = useState('');

  // New File Modal State
  const [newFileModalOpened, { open: openNewFileModal, close: closeNewFileModal }] = useDisclosure(false);
  const [newFileName, setNewFileName] = useState('');
  
  // Target path for creating new files/folders
  const [targetPath, setTargetPath] = useState('');

  // Filter files based on active tab and search query
  const currentFiles = useMemo(() => {
    return Object.values(files)
        .filter(f => f.type === activeTab)
        .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));
  }, [files, activeTab, searchQuery]);

  const treeItems: TreeItem[] = useMemo(() => {
    const fileItems = currentFiles.map(file => ({
        id: file.id,
        path: file.path ? `${file.path}/${file.name}` : file.name,
        label: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        data: file,
        icon: <IconFileText size={16} style={{ marginRight: 8 }} />
    }));

    const folderItems = Object.values(folders)
        .filter(f => !f.type || f.type === activeTab)
        .map(folder => ({
            id: folder.id,
            path: folder.path ? `${folder.path}/${folder.name}` : folder.name,
            label: folder.name,
            isFolder: true
        }));

    return [...fileItems, ...folderItems];
  }, [currentFiles, folders]);

  const activeFile = activeFileId ? files[activeFileId] : null;

  // Auto-select first file if none selected or type mismatch
  useEffect(() => {
    if (activeFile && activeFile.type !== activeTab) {
        setActiveFile(null);
    }
  }, [activeTab, activeFile, setActiveFile]);

  const openCreateFileModal = (path: string = '') => {
    setTargetPath(path);
    setNewFileName('');
    openNewFileModal();
  };

  const openCreateFolderModal = (path: string = '') => {
    setTargetPath(path);
    setNewFolderName('');
    openNewFolderModal();
  };

  const handleCreateFile = () => {
    if (newFileName.trim()) {
        const type = activeTab as FileType;
        const name = newFileName.trim().endsWith('.yml') ? newFileName.trim() : `${newFileName.trim()}.yml`;
        createFile(name, type, targetPath);
        closeNewFileModal();
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
        createFolder(newFolderName.trim(), targetPath, activeTab as FileType);
        setNewFolderName('');
        closeNewFolderModal();
    }
  };

  const handleRenameClick = (item: { id: string, name: string, isFolder?: boolean }) => {
    setItemToRename(item);
    setNewName(item.name);
    openRenameModal();
  };

  const submitRename = () => {
    if (itemToRename && newName.trim()) {
        if (itemToRename.isFolder) {
            renameFolder(itemToRename.id, newName.trim());
        } else {
            renameFile(itemToRename.id, newName.trim());
        }
        closeRenameModal();
    }
  };

  const handleExport = async () => {
    try {
        const zip = new JSZip();
        Object.values(files).forEach(file => {
            zip.file(file.path + '/' + file.name, file.content);
        });
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'chemdah-project.zip');
        notifications.show({
            title: '导出成功',
            message: '项目已导出为 chemdah-project.zip',
            color: 'green'
        });
    } catch (error) {
        notifications.show({
            title: '导出失败',
            message: '无法导出项目',
            color: 'red'
        });
    }
  };

  const handleImport = async (file: File | null) => {
    if (!file) return;
    
    try {
        if (file.name.endsWith('.zip')) {
            const zip = await JSZip.loadAsync(file);
            const newFiles: VirtualFile[] = [];
            
            for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
                if (!zipEntry.dir) {
                    const content = await zipEntry.async('string');
                    const name = relativePath.split('/').pop() || 'unknown';
                    const type = relativePath.includes('quest') ? 'quest' : 'conversation'; // Simple heuristic
                    const path = relativePath.substring(0, relativePath.lastIndexOf('/')) || '';
                    
                    newFiles.push({
                        id: uuidv4(),
                        name,
                        type: type as FileType,
                        content,
                        path
                    });
                }
            }
            importFiles(newFiles);
            notifications.show({
                title: '导入成功',
                message: `成功导入 ${newFiles.length} 个文件`,
                color: 'green'
            });
        }
    } catch (error) {
        notifications.show({
            title: '导入失败',
            message: '无法导入项目文件',
            color: 'red'
        });
    }
  };

  return (
    <>
        <AppShell
        header={{ height: 60 }}
        navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !sidebarOpened, desktop: !sidebarOpened } }}
        padding="0"
        >
        <AppShell.Header>
            <Group h="100%" px="md" justify="space-between" bg="var(--mantine-color-dark-8)">
            <Group>
                <ActionIcon variant="subtle" onClick={toggleSidebar}>
                    {sidebarOpened ? <IconLayoutSidebarLeftCollapse /> : <IconLayoutSidebarLeftExpand />}
                </ActionIcon>
                <Title order={3} size="h4">Chemdah 编辑器</Title>
            </Group>
            
            <Group>
                <FileButton onChange={handleImport} accept=".zip">
                    {(props) => <Button {...props} variant="subtle" size="xs" leftSection={<IconUpload size={16} />}>导入</Button>}
                </FileButton>
                <Button variant="subtle" size="xs" leftSection={<IconDownload size={16} />} onClick={handleExport}>导出</Button>
            </Group>
            </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md" bg="var(--mantine-color-dark-7)">
            <Stack gap="sm">
                <SegmentedControl
                    value={activeTab}
                    onChange={setActiveTab}
                    data={[
                        { label: '任务', value: 'quest' },
                        { label: '对话', value: 'conversation' },
                    ]}
                    fullWidth
                />
                <Group justify="space-between">
                    <Text fw={700} tt="uppercase" c="dimmed" size="xs">{activeTab === 'quest' ? '任务' : '对话'}列表</Text>
                    <Menu shadow="md" width={200}>
                        <Menu.Target>
                            <Button size="xs" variant="light" leftSection={<IconPlus size={14} />}>
                                新建
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Item leftSection={<IconFileText size={14} />} onClick={() => openCreateFileModal('')}>
                                新建文件
                            </Menu.Item>
                            <Menu.Item leftSection={<IconFolderPlus size={14} />} onClick={() => openCreateFolderModal('')}>
                                新建分组
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>
                <TextInput 
                    placeholder="搜索..." 
                    leftSection={<IconSearch size={14} />} 
                    size="xs"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.currentTarget.value)}
                />
            </Stack>
            <ScrollArea style={{ flex: 1, marginTop: 16 }}>
                {currentFiles.length > 0 || Object.keys(folders).length > 0 ? (
                    <FileTree
                        items={treeItems}
                        activeId={activeFileId}
                        onSelect={setActiveFile}
                        onDelete={(id) => { 
                            if(confirm('确定删除吗?')) {
                                if (files[id]) {
                                    deleteFile(id);
                                } else if (folders[id]) {
                                    deleteFolder(id);
                                }
                            }
                        }}
                        onDrop={(id, path) => moveFile(id, path)}
                        defaultExpanded={[]}
                        renderLabel={(item) => (
                            <Highlight highlight={searchQuery} size="sm" fw={500} truncate="end">
                                {item.label}
                            </Highlight>
                        )}
                        renderActions={(item) => (
                            <Menu position="bottom-end" withinPortal>
                                <Menu.Target>
                                    <ActionIcon variant="transparent" size="sm" color="gray" onClick={(e) => e.stopPropagation()}>
                                        <IconDotsVertical size={14} />
                                    </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                    {item.isFolder && (
                                        <>
                                            <Menu.Item leftSection={<IconFilePlus size={14} />} onClick={(e) => { 
                                                e.stopPropagation(); 
                                                openCreateFileModal(item.path);
                                            }}>
                                                新建文件
                                            </Menu.Item>
                                            <Menu.Item leftSection={<IconFolderPlus size={14} />} onClick={(e) => { 
                                                e.stopPropagation(); 
                                                openCreateFolderModal(item.path);
                                            }}>
                                                新建分组
                                            </Menu.Item>
                                            <Menu.Divider />
                                        </>
                                    )}
                                    <Menu.Item leftSection={<IconEdit size={14} />} onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if (item.isFolder) {
                                            handleRenameClick({ id: item.id, name: item.label, isFolder: true });
                                        } else {
                                            handleRenameClick({ ...item.data, isFolder: false });
                                        }
                                    }}>
                                        重命名
                                    </Menu.Item>
                                    <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={(e) => { 
                                        e.stopPropagation(); 
                                        if(confirm('确定删除吗?')) {
                                            if (item.isFolder) {
                                                deleteFolder(item.id);
                                            } else {
                                                deleteFile(item.id);
                                            }
                                        }
                                    }}>
                                        删除
                                    </Menu.Item>
                                </Menu.Dropdown>
                            </Menu>
                        )}
                    />
                ) : (
                    <Text c="dimmed" size="sm" ta="center" mt="xl">未找到{activeTab === 'quest' ? '任务' : '对话'}</Text>
                )}
            </ScrollArea>
        </AppShell.Navbar>

        <AppShell.Main style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--mantine-color-dark-8)' }}>
            {activeFile ? (
                <Box style={{ flex: 1, width: '100%', overflow: 'hidden' }}>
                    {activeFile.type === 'quest' && <QuestEditor fileId={activeFile.id} />}
                    {activeFile.type === 'conversation' && <ConversationEditor fileId={activeFile.id} />}
                </Box>
            ) : (
                <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: 16 }}>
                    <Text c="dimmed" size="lg">请从列表中选择一个{activeTab === 'quest' ? '任务' : '对话'}开始编辑</Text>
                    <Button variant="outline" onClick={() => openCreateFileModal('')}>新建{activeTab === 'quest' ? '任务' : '对话'}</Button>
                </Box>
            )}
        </AppShell.Main>
        </AppShell>

        <Modal opened={renameModalOpened} onClose={closeRenameModal} title="重命名文件" centered>
            <Stack>
                <TextInput 
                    label="新名称" 
                    value={newName} 
                    onChange={(e) => setNewName(e.currentTarget.value)} 
                    data-autofocus
                    onKeyDown={(e) => { if(e.key === 'Enter') submitRename(); }}
                />
                <Group justify="flex-end">
                    <Button variant="default" onClick={closeRenameModal}>取消</Button>
                    <Button onClick={submitRename}>重命名</Button>
                </Group>
            </Stack>
        </Modal>

        <Modal opened={newFolderModalOpened} onClose={closeNewFolderModal} title="新建分组" centered>
            <Stack>
                <TextInput 
                    label="分组名称" 
                    value={newFolderName} 
                    onChange={(e) => setNewFolderName(e.currentTarget.value)} 
                    data-autofocus
                    onKeyDown={(e) => { if(e.key === 'Enter') handleCreateFolder(); }}
                />
                <Group justify="flex-end">
                    <Button variant="default" onClick={closeNewFolderModal}>取消</Button>
                    <Button onClick={handleCreateFolder}>创建</Button>
                </Group>
            </Stack>
        </Modal>
        <Modal opened={newFileModalOpened} onClose={closeNewFileModal} title={`新建${activeTab === 'quest' ? '任务' : '对话'}`} centered>
            <Stack>
                <TextInput 
                    label="文件名称" 
                    value={newFileName} 
                    onChange={(e) => setNewFileName(e.currentTarget.value)} 
                    data-autofocus
                    onKeyDown={(e) => { if(e.key === 'Enter') handleCreateFile(); }}
                />
                <Group justify="flex-end">
                    <Button variant="default" onClick={closeNewFileModal}>取消</Button>
                    <Button onClick={handleCreateFile}>创建</Button>
                </Group>
            </Stack>
        </Modal>
    </>
  );
}
