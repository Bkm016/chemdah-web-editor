import { AppShell, Group, Title, Button, Stack, Text, ScrollArea, ActionIcon, Box, TextInput, Menu, Modal, FileButton, Highlight, SegmentedControl, Badge } from '@mantine/core';
import { IconPlus, IconTrash, IconFileText, IconSearch, IconEdit, IconDotsVertical, IconDownload, IconUpload, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconFolderPlus, IconFilePlus, IconSun, IconMoon, IconApi } from '@tabler/icons-react';
import { useState, useEffect, useMemo } from 'react';
import { useProjectStore, FileType, VirtualFile } from '@/store/useProjectStore';
import { useThemeStore } from '@/store/useThemeStore';
import { parseYaml } from '@/utils/yaml-utils';
import { FileTree, TreeItem } from '@/components/ui';
import QuestEditor from '@/components/editors/quest/QuestEditor';
import ConversationEditor from '@/components/editors/conversation/ConversationEditor';
import { ApiCenterPage } from '@/components/pages/ApiCenterPage';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { v4 as uuidv4 } from 'uuid';

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<string>('quest');

  // 分别订阅需要的数据,避免不必要的重渲染
  const questFiles = useProjectStore((state) => state.questFiles);
  const questFolders = useProjectStore((state) => state.questFolders);
  const conversationFiles = useProjectStore((state) => state.conversationFiles);
  const conversationFolders = useProjectStore((state) => state.conversationFolders);
  const activeFileId = useProjectStore((state) => state.activeFileId);

  // 方法单独订阅
  const setActiveFile = useProjectStore((state) => state.setActiveFile);
  const createFile = useProjectStore((state) => state.createFile);
  const deleteFile = useProjectStore((state) => state.deleteFile);
  const renameFile = useProjectStore((state) => state.renameFile);
  const importFiles = useProjectStore((state) => state.importFiles);
  const moveFile = useProjectStore((state) => state.moveFile);
  const createFolder = useProjectStore((state) => state.createFolder);
  const deleteFolder = useProjectStore((state) => state.deleteFolder);
  const renameFolder = useProjectStore((state) => state.renameFolder);
  const moveFolder = useProjectStore((state) => state.moveFolder);

  const { colorScheme, toggleColorScheme } = useThemeStore();

  const files = activeTab === 'quest' ? questFiles : conversationFiles;
  const folders = activeTab === 'quest' ? questFolders : conversationFolders;

  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [sidebarOpened, { toggle: toggleSidebar, close: closeSidebar }] = useDisclosure(true);

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

  // Show/hide sidebar based on active tab
  const shouldShowSidebar = activeTab === 'quest' || activeTab === 'conversation';

  // Filter files based on active tab and search query
  const currentFiles = useMemo(() => {
    return Object.values(files)
        .filter(f => f.type === activeTab)
        .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));
  }, [files, activeTab, searchQuery]);

  const treeItems: TreeItem[] = useMemo(() => {
    const fileItems = currentFiles.map(file => {
        const isEmpty = !file.content || file.content.trim() === '';
        
        let questTypes: string[] = [];
        if (activeTab === 'quest' && file.content) {
            try {
                const data = parseYaml(file.content);
                if (data && typeof data === 'object') {
                    Object.entries(data).forEach(([key, quest]: [string, any]) => {
                        if (key === '__option__') return;
                        if (quest?.meta?.type) {
                            if (Array.isArray(quest.meta.type)) {
                                quest.meta.type.forEach((t: string) => {
                                    if (!questTypes.includes(String(t))) questTypes.push(String(t));
                                });
                            } else {
                                const t = String(quest.meta.type);
                                if (!questTypes.includes(t)) questTypes.push(t);
                            }
                        }
                    });
                }
            } catch (e) {}
        }

        return {
            id: file.id,
            path: file.path ? `${file.path}/${file.name}` : file.name,
            label: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            data: { ...file, questTypes },
            icon: <IconFileText size={16} style={{ marginRight: 8, opacity: isEmpty ? 0.5 : 1 }} />
        };
    });

    const folderItems = Object.values(folders)
        .filter(f => f.type === activeTab)
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
        const result = createFile(name, type, targetPath);
        if (result.success) {
            closeNewFileModal();
        } else {
            notifications.show({
                title: '创建失败',
                message: result.message,
                color: 'red'
            });
        }
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
            renameFolder(itemToRename.id, activeTab as FileType, newName.trim());
        } else {
            renameFile(itemToRename.id, activeTab as FileType, newName.trim());
        }
        closeRenameModal();
    }
  };

  const handleExport = async () => {
    try {
        const zip = new JSZip();
        
        // Export Quest Files
        Object.values(questFiles).forEach(file => {
            const path = file.path ? `quest/${file.path}/${file.name}` : `quest/${file.name}`;
            zip.file(path, file.content);
        });

        // Export Conversation Files
        Object.values(conversationFiles).forEach(file => {
            const path = file.path ? `conversation/${file.path}/${file.name}` : `conversation/${file.name}`;
            zip.file(path, file.content);
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

  const handleExportCurrent = () => {
    if (!activeFile) return;
    try {
        const blob = new Blob([activeFile.content], { type: 'text/yaml;charset=utf-8' });
        saveAs(blob, activeFile.name);
        notifications.show({
            title: '导出成功',
            message: `文件 ${activeFile.name} 已导出`,
            color: 'green'
        });
    } catch (error) {
        notifications.show({
            title: '导出失败',
            message: '无法导出文件',
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
        } else if (file.name.endsWith('.yml') || file.name.endsWith('.yaml')) {
            const content = await file.text();
            const data = parseYaml(content);
            let type: FileType = activeTab as FileType;

            if (data && typeof data === 'object') {
                const hasConversationFeatures = Object.values(data).some((node: any) => node && (node.npc || node.player));
                const hasQuestFeatures = Object.values(data).some((node: any) => node && (node.meta || node.task));

                if (hasConversationFeatures) type = 'conversation';
                else if (hasQuestFeatures) type = 'quest';
            }

            importFiles([{
                id: uuidv4(),
                name: file.name,
                type,
                content,
                path: ''
            }]);

            notifications.show({
                title: '导入成功',
                message: `成功导入文件 ${file.name} (${type === 'quest' ? '任务' : '对话'})`,
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
        navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !sidebarOpened || !shouldShowSidebar, desktop: !sidebarOpened || !shouldShowSidebar } }}
        padding="0"
        >
        <AppShell.Header>
            <Group h="100%" px="md" justify="space-between" bg="var(--mantine-color-dark-8)">
            <Group>
                {shouldShowSidebar && (
                    <ActionIcon variant="subtle" onClick={toggleSidebar}>
                        {sidebarOpened ? <IconLayoutSidebarLeftCollapse /> : <IconLayoutSidebarLeftExpand />}
                    </ActionIcon>
                )}
                <Title
                    order={3}
                    size="h4"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActiveTab('quest')}
                >
                    Chemdah Lab
                </Title>
            </Group>

            <Group>
                <ActionIcon
                    variant="subtle"
                    onClick={toggleColorScheme}
                    title={colorScheme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
                >
                    {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
                </ActionIcon>
                <Button
                    variant="subtle"
                    size="xs"
                    leftSection={<IconApi size={16} />}
                    onClick={() => setActiveTab(activeTab === 'api' ? 'quest' : 'api')}
                    color={activeTab === 'api' ? 'blue' : 'gray'}
                >
                    API 中心
                </Button>
                <FileButton onChange={handleImport} accept=".zip,.yml,.yaml">
                    {(props) => <Button {...props} variant="subtle" size="xs" leftSection={<IconUpload size={16} />}>导入</Button>}
                </FileButton>
                <Menu shadow="md" width={200}>
                    <Menu.Target>
                        <Button variant="subtle" size="xs" leftSection={<IconDownload size={16} />}>导出</Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item leftSection={<IconFileText size={14} />} onClick={handleExportCurrent} disabled={!activeFile}>
                            导出当前文件
                        </Menu.Item>
                        <Menu.Item leftSection={<IconFolderPlus size={14} />} onClick={handleExport}>
                            导出全部 (ZIP)
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
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
                        onSelect={(file) => {
                            setActiveFile(file);
                            if (isMobile) {
                                closeSidebar();
                            }
                        }}
                        onDelete={(id) => { 
                            if(confirm('确定删除吗?')) {
                                if (files[id]) {
                                    deleteFile(id, activeTab as FileType);
                                } else if (folders[id]) {
                                    deleteFolder(id, activeTab as FileType);
                                }
                            }
                        }}
                        onDrop={(id, path) => {
                            let result;
                            if (files[id]) {
                                result = moveFile(id, activeTab as FileType, path);
                            } else {
                                result = moveFolder(id, activeTab as FileType, path);
                            }
                            
                            if (result && !result.success) {
                                notifications.show({
                                    title: '移动失败',
                                    message: result.message,
                                    color: 'red'
                                });
                            }
                        }}
                        defaultExpanded={[]}
                        renderLabel={(item) => {
                            const isEmpty = !item.isFolder && item.data && (!item.data.content || item.data.content.trim() === '');
                            const match = item.label.match(/^(.*?)\s*\((.*?)\)$/);
                            const mainLabel = match ? match[1] : item.label;
                            const tag = match ? match[2] : null;
                            const questTypes = item.data?.questTypes as string[] | undefined;
                            const maxTags = 2;
                            const displayTypes = questTypes?.slice(0, maxTags);
                            const remainingCount = (questTypes?.length || 0) - maxTags;

                            return (
                                <Group gap={6} wrap="nowrap" style={{ width: '100%' }}>
                                    <Highlight 
                                        highlight={searchQuery} 
                                        size="sm" 
                                        fw={500} 
                                        truncate="end"
                                        c={isEmpty ? 'dimmed' : undefined}
                                        style={{ flex: 1, minWidth: '40px' }}
                                    >
                                        {mainLabel}
                                    </Highlight>
                                    {tag && (
                                        <Badge size="xs" variant="light" color="gray" style={{ textTransform: 'none', flexShrink: 0 }}>
                                            {tag}
                                        </Badge>
                                    )}
                                    {displayTypes && displayTypes.map(type => (
                                        <Badge 
                                            key={type}
                                            size="xs" 
                                            variant="light" 
                                            color="blue" 
                                            radius="sm"
                                            style={{ 
                                                textTransform: 'none', 
                                                flexShrink: 0,
                                                backgroundColor: 'rgba(34, 139, 230, 0.15)',
                                                color: '#74c0fc',
                                                fontWeight: 500
                                            }}
                                        >
                                            {type}
                                        </Badge>
                                    ))}
                                    {remainingCount > 0 && (
                                        <Badge 
                                            size="xs" 
                                            variant="light" 
                                            color="blue" 
                                            radius="sm"
                                            style={{ 
                                                textTransform: 'none', 
                                                flexShrink: 0,
                                                backgroundColor: 'rgba(34, 139, 230, 0.15)',
                                                color: '#74c0fc',
                                                fontWeight: 500
                                            }}
                                        >
                                            +{remainingCount}
                                        </Badge>
                                    )}
                                </Group>
                            );
                        }}
                        renderActions={(item) => (
                            <Menu position="bottom-end" withinPortal>
                                <Menu.Target>
                                    <ActionIcon variant="subtle" size="xs" c="dimmed" onClick={(e) => e.stopPropagation()}>
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
                                                deleteFolder(item.id, activeTab as FileType);
                                            } else {
                                                deleteFile(item.id, activeTab as FileType);
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
            {activeTab === 'api' ? (
                <Box style={{ flex: 1, width: '100%', overflow: 'auto' }}>
                    <ApiCenterPage />
                </Box>
            ) : activeFile ? (
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
