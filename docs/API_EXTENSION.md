# API 扩展指南

本文档介绍如何扩展 Chemdah Web Editor 的 API 定义，以支持自定义任务目标和对话组件。

## 目录

- [概述](#概述)
- [文件结构](#文件结构)
- [任务目标定义](#任务目标定义)
- [任务元数据组件](#任务元数据组件)
- [任务流程组件](#任务流程组件)
- [对话组件（新版）](#对话组件新版)
- [对话节点组件（旧版）](#对话节点组件旧版)
- [对话选项组件（旧版）](#对话选项组件旧版)
- [字段类型](#字段类型)
- [使用方法](#使用方法)
- [最佳实践](#最佳实践)

---

## 概述

API 定义文件用于扩展编辑器的功能，使其支持：
- 自定义任务目标类型
- 任务全局属性字段
- 任务步骤附加字段
- 对话节点自定义组件
- 玩家选项自定义组件

## 文件结构

API 文件采用 JSON 格式，包含以下顶层字段：

```json
{
  "objectives": {},              // 任务目标定义
  "questMetaComponents": [],     // 任务元数据组件
  "taskAddonComponents": [],     // 任务流程组件
  "conversation": {},            // 对话组件（新版推荐）
  "conversationNodeComponents": [], // 对话节点组件（旧版，已废弃）
  "conversationPlayerOptionComponents": [] // 对话选项组件（旧版，已废弃）
}
```

---

## 任务目标定义

### 结构说明

```json
{
  "objectives": {
    "分组名称": {
      "目标类型名称": {
        "condition": [],      // 条件字段定义
        "condition-vars": [], // 可用变量的字段
        "goal": [],          // 目标字段定义
        "goal-vars": []      // 可用变量的字段
      }
    }
  }
}
```

### 示例：物品交付目标

```json
{
  "objectives": {
    "Chemdah 内置": {
      "物品交付": {
        "condition": [
          {
            "name": "material",
            "pattern": "Material"
          },
          {
            "name": "amount",
            "pattern": "Number"
          },
          {
            "name": "name",
            "pattern": "String"
          },
          {
            "name": "lore",
            "pattern": "Array"
          }
        ],
        "condition-vars": ["amount"],
        "goal": [
          {
            "name": "amount",
            "pattern": "Number"
          }
        ],
        "goal-vars": ["amount"]
      }
    }
  }
}
```

### 字段说明

- **condition**: 条件部分的字段列表，用于筛选符合条件的物品/实体等
- **condition-vars**: 哪些字段支持使用变量（如 `{amount}`）
- **goal**: 目标部分的字段列表，用于定义完成目标需要的数量等
- **goal-vars**: 哪些字段支持使用变量

---

## 任务元数据组件

用于定义任务的全局属性字段（`meta` 部分）。

### 结构说明

```json
{
  "questMetaComponents": [
    {
      "id": "组件ID",
      "name": "组件名称",
      "category": "分类",
      "fields": [
        {
          "name": "字段名",
          "label": "显示标签",
          "pattern": "字段类型",
          "description": "字段描述",
          "default": "默认值",
          "required": false
        }
      ]
    }
  ]
}
```

### 示例：奖励系统

```json
{
  "questMetaComponents": [
    {
      "id": "reward",
      "name": "奖励系统",
      "category": "奖励",
      "fields": [
        {
          "name": "money",
          "label": "金币奖励",
          "pattern": "Number",
          "description": "完成任务后给予的金币数量",
          "default": 0,
          "required": false
        },
        {
          "name": "exp",
          "label": "经验奖励",
          "pattern": "Number",
          "description": "完成任务后给予的经验值",
          "default": 0,
          "required": false
        },
        {
          "name": "items",
          "label": "物品奖励",
          "pattern": "Array",
          "description": "完成任务后给予的物品列表",
          "required": false
        }
      ]
    }
  ]
}
```

---

## 任务流程组件

用于定义任务步骤（`task`）中的附加字段。

### 结构说明

与任务元数据组件相同，但应用于任务步骤层级。

### 示例：NPC 对话

```json
{
  "taskAddonComponents": [
    {
      "id": "npc-dialog",
      "name": "NPC 对话",
      "category": "交互",
      "fields": [
        {
          "name": "npc",
          "label": "NPC ID",
          "pattern": "String",
          "description": "触发对话的 NPC 标识符",
          "required": false
        },
        {
          "name": "dialog",
          "label": "对话内容",
          "pattern": "Array",
          "description": "对话文本列表",
          "required": false
        }
      ]
    }
  ]
}
```

---

## 对话组件（新版）

**推荐使用**：这是新版对话组件定义格式，支持统一的参数系统和作用域控制。

### 结构说明

```json
{
  "conversation": {
    "组件ID": {
      "name": "组件名称",
      "description": ["描述行1", "描述行2"],
      "scope": "node" | "player-option" | "both",
      "params": [
        {
          "name": "参数名称",
          "type": "参数类型",
          "description": "参数描述",
          "options": ["可选标记1", "可选标记2"]
        }
      ]
    }
  }
}
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | ✅ | 组件的显示名称 |
| `description` | ❌ | 组件的描述，支持多行（数组） |
| `scope` | ✅ | 组件应用范围：`node`（节点）、`player-option`（选项）、`both`（两者） |
| `params` | ✅ | 参数列表 |

### 参数定义

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | ✅ | 参数名称，支持嵌套路径（如 `action.type`） |
| `type` | ✅ | 参数类型（见下方类型表） |
| `description` | ❌ | 参数描述 |
| `options` | ❌ | 特殊标记数组（如 `["script", "kether"]` 表示使用脚本编辑器） |

### 示例 1：节点组件（UI 根节点）

```json
{
  "conversation": {
    "root": {
      "name": "UI 根节点",
      "description": ["定义对话界面的根容器类型"],
      "scope": "node",
      "params": [
        {
          "name": "root",
          "type": "String",
          "description": "根容器类型（如 canvas、chat）"
        }
      ]
    }
  }
}
```

### 示例 2：玩家选项组件（Kether 脚本）

```json
{
  "conversation": {
    "kether": {
      "name": "Kether 脚本",
      "description": ["执行 Kether 脚本语言"],
      "scope": "player-option",
      "params": [
        {
          "name": "kether",
          "type": "Script",
          "description": "Kether 脚本内容",
          "options": ["kether", "script"]
        }
      ]
    }
  }
}
```

### 示例 3：通用组件（同时支持节点和选项）

```json
{
  "conversation": {
    "condition": {
      "name": "条件判断",
      "description": ["判断是否满足特定条件"],
      "scope": "both",
      "params": [
        {
          "name": "if",
          "type": "Script",
          "description": "条件表达式",
          "options": ["script", "kether"]
        },
        {
          "name": "else",
          "type": "Script",
          "description": "不满足条件时执行",
          "options": ["script", "kether"]
        }
      ]
    }
  }
}
```

### 示例 4：嵌套参数

```json
{
  "conversation": {
    "action": {
      "name": "动作系统",
      "description": ["配置复杂的动作行为"],
      "scope": "player-option",
      "params": [
        {
          "name": "action.type",
          "type": "String",
          "description": "动作类型"
        },
        {
          "name": "action.target",
          "type": "String",
          "description": "目标对象"
        },
        {
          "name": "action.delay",
          "type": "Number",
          "description": "延迟时间（毫秒）"
        }
      ]
    }
  }
}
```

### 参数类型与 options 标记

`options` 字段用于提供额外的渲染提示：

| options 值 | 效果 |
|-----------|------|
| `["script"]` | 强制使用脚本编辑器 |
| `["kether"]` | 强制使用脚本编辑器（Kether 语法高亮） |
| `["javascript"]` | 强制使用脚本编辑器（JavaScript 语法高亮） |

如果没有 `options` 标记，编辑器会根据 `type` 自动选择合适的输入控件。

---

## 对话节点组件（旧版）

> **⚠️ 已废弃**：建议使用新版 `conversation` 格式。旧版仍然支持，但不再推荐使用。

用于定义对话节点的自定义字段（如 `root`、`self`、`model` 等）。

### 示例

```json
{
  "conversationNodeComponents": [
    {
      "id": "root",
      "name": "UI 根节点",
      "category": "显示",
      "fields": [
        {
          "name": "root",
          "label": "根节点类型",
          "pattern": "String",
          "description": "对话界面的根容器类型",
          "required": false
        }
      ]
    }
  ]
}
```

---

## 对话选项组件（旧版）

> **⚠️ 已废弃**：建议使用新版 `conversation` 格式。旧版仍然支持，但不再推荐使用。

用于定义玩家选项的自定义字段（如 `dos`、`dosh`、`gscript` 等）。

### 示例

```json
{
  "conversationPlayerOptionComponents": [
    {
      "id": "gscript",
      "name": "Groovy 脚本",
      "category": "脚本",
      "fields": [
        {
          "name": "gscript",
          "label": "脚本内容",
          "pattern": "Script",
          "description": "选择此选项时执行的 Groovy 脚本",
          "required": false
        }
      ]
    }
  ]
}
```

---

## 字段类型

### 支持的类型（新版 `type`）

| 类型 | 说明 | 编辑器表现 |
|------|------|------------|
| `String` | 字符串 | 单行文本输入框 |
| `Number` | 数字 | 数字输入框 |
| `Boolean` | 布尔值 | 开关切换 |
| `Array<String>` | 字符串数组 | 多行文本（每行一个元素） |
| `Script` | 脚本 | 代码编辑器（语法高亮） |
| `RichTextArray` | 富文本数组 | 多行文本（支持变量） |

### 支持的类型（旧版 `pattern`）

| 类型 | 说明 | 编辑器表现 |
|------|------|------------|
| `String` | 字符串 | 单行文本输入框 |
| `Number` | 数字 | 数字输入框 |
| `Boolean` | 布尔值 | 开关切换 |
| `Array` | 数组 | 多行文本（每行一个元素） |
| `Script` | 脚本 | 代码编辑器（语法高亮） |
| `RichText` | 富文本 | 多行文本（支持变量） |
| `Material` | 物品材质 | 下拉选择器（Minecraft 材质） |
| `EntityType` | 实体类型 | 下拉选择器（Minecraft 实体） |

### 字段属性（旧版）

| 属性 | 必填 | 说明 |
|------|------|------|
| `name` | ✅ | 字段在 YAML 中的键名 |
| `label` | ✅ | 在编辑器中显示的标签 |
| `pattern` | ✅ | 字段类型 |
| `description` | ❌ | 字段的详细说明（显示为提示） |
| `default` | ❌ | 默认值 |
| `required` | ❌ | 是否必填（默认 false） |

---

## 使用方法

### 方法一：本地上传

1. 创建或修改 `api.json` 文件
2. 打开 **API 中心** 页面
3. 切换到 **本地文件** 选项卡
4. 点击 **选择文件上传**
5. 选择你的 JSON 文件

### 方法二：网络 URL

1. 将 API 文件托管到网络服务器
2. 打开 **API 中心** 页面
3. 切换到 **网络 URL** 选项卡
4. 输入名称和 URL
5. 点击 **添加**

### 管理 API 源

- **启用/禁用**：使用开关控制某个源是否生效
- **拖拽排序**：调整多个源的加载顺序，后加载的会覆盖先加载的
- **更新**：点击刷新按钮更新网络源的最新内容
- **删除**：移除不需要的源

---

## 最佳实践

### 1. 优先使用新版 conversation 格式

新版格式提供更好的类型安全和作用域控制：

```json
{
  "conversation": {
    "my-component": {
      "name": "我的组件",
      "scope": "both",
      "params": [...]
    }
  }
}
```

### 2. 合理使用 scope

- `node`：仅在对话节点使用
- `player-option`：仅在玩家选项使用
- `both`：节点和选项都可以使用

### 3. 嵌套参数命名

使用点号分隔嵌套层级：

```json
{
  "name": "config.display.title",
  "type": "String"
}
```

会生成 YAML：
```yaml
config:
  display:
    title: "标题内容"
```

### 4. 使用 options 控制输入方式

对于脚本类型字段，使用 `options` 标记：

```json
{
  "name": "script",
  "type": "String",
  "options": ["kether", "script"]
}
```

这会强制使用脚本编辑器而不是普通文本框。

### 5. 合理组织分组

将相关的目标类型放在同一个分组下：

```json
{
  "objectives": {
    "基础交互": {
      "物品交付": {},
      "NPC对话": {}
    },
    "战斗相关": {
      "击杀实体": {},
      "造成伤害": {}
    }
  }
}
```

### 6. 使用描述性命名

- ✅ 好的命名：`物品交付`、`金币奖励`、`NPC 对话`
- ❌ 不好的命名：`obj1`、`field`、`data`

### 7. 提供详细描述

为每个字段添加 `description`，帮助用户理解其用途。

### 8. 设置合理的默认值

对于常用字段，提供合适的默认值以提高效率。

### 9. 模块化设计

将大的 API 文件拆分成多个小文件，按功能模块分别上传：
- `quest-objectives.json` - 任务目标
- `quest-components.json` - 任务组件
- `conversation-components.json` - 对话组件

### 10. 使用加载顺序

利用拖拽排序功能：
1. 基础定义放在前面
2. 扩展定义放在后面
3. 个人定制放在最后

这样可以实现"基础 + 扩展 + 定制"的分层架构。

---

## 完整示例

### 新版完整示例

```json
{
  "conversation": {
    "root": {
      "name": "UI 根节点",
      "description": ["定义对话界面的根容器类型"],
      "scope": "node",
      "params": [
        {
          "name": "root",
          "type": "String",
          "description": "根容器类型"
        }
      ]
    },
    "kether": {
      "name": "Kether 脚本",
      "description": ["执行 Kether 脚本"],
      "scope": "player-option",
      "params": [
        {
          "name": "kether",
          "type": "Script",
          "description": "脚本内容",
          "options": ["kether", "script"]
        }
      ]
    },
    "condition": {
      "name": "条件判断",
      "scope": "both",
      "params": [
        {
          "name": "if",
          "type": "Script",
          "description": "条件表达式",
          "options": ["script"]
        }
      ]
    }
  }
}
```

查看项目根目录下的 `api.example.json` 文件，了解更多完整示例。

---

## 故障排除

### 上传失败

- 检查 JSON 格式是否正确（可使用 [JSONLint](https://jsonlint.com/) 验证）
- 确保文件是 UTF-8 编码
- 检查文件大小是否过大

### 字段不显示

- 检查 `type` 或 `pattern` 是否正确
- 检查 `scope` 是否匹配使用场景
- 确认 API 源已启用
- 查看浏览器控制台是否有错误信息

### 合并问题

- 检查 API 源的加载顺序
- 确保组件的 `id` 或键名正确
- 使用"更新所有源"按钮重新加载

### 新旧格式混用

- 新版 `conversation` 格式和旧版 `conversationNodeComponents`/`conversationPlayerOptionComponents` 可以共存
- 推荐逐步迁移到新版格式
- 新版格式会自动处理作用域，更加灵活

---
