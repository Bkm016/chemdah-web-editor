# Chemdah Web Editor

一个基于 Web 的可视化任务和对话编辑器，专为 Minecraft Chemdah 插件设计。使用现代化的图形界面替代手写 YAML 配置文件。

## 功能特性

### 📋 任务编辑器
- **可视化任务流程设计**：使用表单界面编辑任务步骤
- **动态目标系统**：支持多种内置和自定义任务目标类型
- **实时预览**：即时查看生成的 YAML 配置
- **模块化组件**：支持扩展任务元数据和流程组件

### 💬 对话编辑器
- **节点流程图**：使用 ReactFlow 可视化对话流程
- **拖拽编辑**：直观的节点和连线操作
- **多种节点类型**：
  - Agent 节点：NPC 对话与玩家选项
  - Switch 节点：条件分支逻辑
- **自动布局**：智能排列对话节点
- **中文节点 ID 支持**：完全支持 Unicode 字符

### 🔌 API 中心
- **多源管理**：支持多个 API 定义源
- **网络 URL**：从远程服务器加载 API 定义
- **本地上传**：上传本地 JSON 文件，数据持久化保存在 IndexedDB
- **拖拽排序**：调整加载优先级，后加载的覆盖先加载的
- **启用/禁用**：灵活控制各个源的生效状态
- **实时更新**：手动更新网络源的最新内容
- **自动同步**：所有变更自动应用到编辑器
- **数据分离**：项目文件存储在 IndexedDB，API 定义存储在 localStorage

### 🎨 用户体验
- **暗黑/亮色主题**：自动跟随系统或手动切换
- **文件管理**：支持文件夹分组、重命名、拖拽移动
- **导入导出**：支持单文件、ZIP 批量导入导出
- **自动保存**：编辑内容实时保存到浏览器本地
- **搜索过滤**：快速定位文件和任务

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 库**: Mantine v7
- **样式**: Tailwind CSS v4
- **状态管理**: Zustand
- **对话流程图**: ReactFlow
- **代码编辑器**: Monaco Editor
- **YAML 处理**: js-yaml
- **拖拽功能**: @hello-pangea/dnd

## 项目结构

```
chemdah-web-editor/
├── src/
│   ├── components/
│   │   ├── editors/
│   │   │   ├── quest/          # 任务编辑器
│   │   │   │   ├── dynamic/    # 动态表单系统
│   │   │   │   └── addons/     # 任务流程组件
│   │   │   └── conversation/   # 对话编辑器
│   │   │       └── nodes/      # 对话节点组件
│   │   ├── layout/             # 主布局
│   │   ├── pages/              # 页面组件
│   │   ├── ui/                 # 通用 UI 组件
│   │   └── common/             # 公共组件
│   ├── store/                  # Zustand 状态管理
│   │   ├── useProjectStore.ts  # 项目文件管理（IndexedDB）
│   │   ├── useApiStore.ts      # API 数据管理
│   │   ├── useApiCenterStore.ts # API 中心管理
│   │   └── useThemeStore.ts    # 主题管理
│   ├── utils/                  # 工具函数
│   │   ├── yaml-utils.ts       # YAML 转换
│   │   └── indexedDBStorage.ts # IndexedDB 存储工具
│   └── registry/               # 注册表
│       └── quest-objectives.tsx # 任务目标注册
├── public/
│   └── api.json                # 默认 API 定义
├── docs/
│   └── API_EXTENSION.md        # API 扩展指南
└── api.example.json            # API 示例文件
```

## 使用指南

### 创建任务

1. 点击左侧 **新建** 按钮，选择 **新建文件**
2. 选择 **任务** 类型
3. 在右侧编辑器中填写任务信息
4. 点击 **添加任务步骤** 添加任务流程
5. 为每个步骤选择目标类型并配置参数
6. 实时预览 YAML 输出

### 创建对话

1. 切换到 **对话** 选项卡
2. 新建对话文件
3. 双击节点进行编辑
4. 从节点的选项连接线到下一个节点
5. 使用 **智能重排** 自动整理布局
6. 双击连线可删除连接

### 扩展 API 定义

详细说明请参阅 [API 扩展指南](docs/API_EXTENSION.md)

#### 快速上手

1. 参考 `api.example.json` 创建自己的 API 定义文件
2. 打开 **API 中心** 页面
3. 上传本地文件或添加网络 URL
4. 调整加载顺序（拖拽排序）
5. 启用需要的源

#### API 定义结构

```json
{
  "objectives": {
    "分组名称": {
      "目标类型": {
        "condition": [...],
        "goal": [...]
      }
    }
  },
  "questMetaComponents": [...],
  "taskAddonComponents": [...],
  "conversation": {                    // 新版对话组件（推荐）
    "组件ID": {
      "name": "组件名称",
      "scope": "node|player-option|both",
      "params": [...]
    }
  },
  "conversationNodeComponents": [...],        // 旧版（已废弃）
  "conversationPlayerOptionComponents": [...]  // 旧版（已废弃）
}
```

支持的字段类型：
- **新版 (conversation.params.type)**: `String`, `Number`, `Boolean`, `Array<String>`, `Script`, `RichTextArray`
- **旧版 (pattern)**: `String`, `Number`, `Boolean`, `Array`, `Script`, `RichText`, `Material`, `EntityType`

**推荐使用新版 `conversation` 格式**，提供更好的作用域控制和参数系统。

### 导入导出

#### 导入
- **单文件**: 导入 `.yml` 或 `.yaml` 文件
- **批量导入**: 导入 `.zip` 压缩包（自动识别任务/对话）

#### 导出
- **当前文件**: 导出单个文件
- **全部导出**: 导出所有文件为 ZIP

### 数据持久化

数据存储策略：
- **项目文件**（任务、对话、文件夹）：保存在浏览器 **IndexedDB**
  - 支持大容量存储（50%+ 浏览器存储配额）
  - 异步操作，不阻塞 UI
  - 智能保存队列（1秒防抖 + 空闲时保存）
- **API 定义**：保存在浏览器 **localStorage**
  - 快速访问，适合小型数据
  - 用于 API 中心配置和缓存
- **主题设置**：保存在 localStorage

**重要提示**：
- 清除浏览器数据会丢失所有内容，建议定期导出备份
- 可在 API 中心使用"删除本地记录"按钮清空项目文件（不影响 API 配置）
- 首次访问时会自动从 localStorage 迁移旧数据到 IndexedDB

## API 中心详解

### 管理 API 源

API 中心支持多个 API 定义源，可以灵活组合不同来源的定义：

#### 添加方式

**1. 网络 URL**
```
名称: Chemdah 官方 API
URL: https://example.com/api.json
```
- 适合：共享的公共定义、团队协作
- 特性：可随时更新、保持同步

**2. 本地上传**
- 选择本地 JSON 文件上传
- 数据持久化保存在浏览器
- 适合：个人定制、离线使用

#### 加载优先级

通过拖拽调整源的顺序：
```
1. 基础定义 (最先加载)
2. 插件扩展
3. 个人定制 (最后加载，优先级最高)
```

后加载的源会覆盖先加载源中的同名定义。

#### 实时生效

所有操作立即生效：
- ✅ 调整顺序 → 自动重新加载并合并
- ✅ 启用/禁用 → 立即应用到编辑器
- ✅ 添加新源 → 自动加载并同步
- ✅ 更新源 → 获取最新定义

## 快捷键

- **Ctrl/Cmd + S**: 手动保存（已自动保存）
- **Delete/Backspace**: 删除选中的节点或连线
- **双击节点**: 编辑节点
- **双击连线**: 删除连线
- **Shift + 拖拽**: 框选多个节点

## 常见问题

### Q: 数据保存在哪里？
A:
- **项目文件**：保存在浏览器 IndexedDB（任务、对话、文件夹）
- **API 配置**：保存在浏览器 localStorage（API 中心设置和缓存）
- 数据不会上传到服务器，完全本地存储

### Q: 如何备份数据？
A: 使用 **导出 → 导出全部 (ZIP)** 功能定期备份。也可以在 API 中心单独管理本地记录。

### Q: 支持哪些浏览器？
A: 推荐使用最新版本的 Chrome、Edge、Firefox 或 Safari。

### Q: API 定义如何生效？
A: 在 API 中心添加或更新源后，会自动同步到编辑器。调整顺序、启用/禁用都会立即生效。

### Q: 多个 API 源如何合并？
A: 按加载顺序依次合并，相同 ID/键名的定义会被后加载的覆盖。

### Q: 可以离线使用吗？
A: 可以。首次加载后，应用会缓存在浏览器中。使用本地上传的 API 源可完全离线工作。

## 贡献

欢迎提交 Issue 和 Pull Request！

### 开发指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码风格

- 使用 TypeScript 严格模式
- 遵循 ESLint 配置
- 组件使用函数式编写
- 状态管理使用 Zustand

## 致谢

- 感谢 Chemdah 插件作者提供的优秀任务系统
- 感谢 TabooLib 团队提供的开发框架
- 感谢所有贡献者和用户的支持

---

**Made with ❤️ for Minecraft Community**
