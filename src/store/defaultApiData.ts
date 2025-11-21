import { ApiDefinition } from "./useApiStore";

export const DEFAULT_API_DATA: ApiDefinition = {
    // 任务目标定义
    objectives: {
        "minecraft": {
            "block break": {
                "condition": [
                    {
                        "name": "drops",
                        "pattern": "ItemStack"
                    },
                    {
                        "name": "no-silk-touch",
                        "pattern": "Boolean"
                    },
                    {
                        "name": "material",
                        "pattern": "Block"
                    },
                    {
                        "name": "unique",
                        "pattern": "Boolean"
                    },
                    {
                        "name": "position",
                        "pattern": "Location"
                    },
                    {
                        "name": "exp",
                        "pattern": "Number"
                    }
                ],
                "condition-vars": [
                    "exp"
                ],
                "goal": [
                    {
                        "name": "amount",
                        "pattern": "Number"
                    }
                ],
                "goal-vars": [
                    "amount"
                ]
            },
        }
    },

    // 全局组件定义（Quest Meta）
    questMetaComponents: [
        {
            id: "type",
            name: "任务类型",
            category: "基础信息",
            fields: [
                {
                    name: "type",
                    label: "类型",
                    pattern: "Array<String>",
                    description: "任务类型标签，如 ['主线'] 或 ['支线']",
                    default: []
                }
            ]
        },
        {
            id: "index",
            name: "索引标记",
            category: "基础信息",
            fields: [
                {
                    name: "index",
                    label: "重要任务",
                    pattern: "Boolean",
                    description: "标记为重要任务",
                    default: false
                }
            ]
        },
        {
            id: "briefing",
            name: "任务简报",
            category: "描述系统",
            fields: [
                {
                    name: "briefing",
                    label: "简报内容",
                    pattern: "RichTextArray",
                    description: "任务简报，支持富文本和交互元素",
                    default: []
                }
            ]
        },
        {
            id: "description",
            name: "任务描述",
            category: "描述系统",
            fields: [
                {
                    name: "description",
                    label: "描述文本",
                    pattern: "Array<String>",
                    description: "任务详细描述",
                    default: []
                }
            ]
        },
        {
            id: "abandon",
            name: "可放弃设置",
            category: "基础信息",
            fields: [
                {
                    name: "abandon",
                    label: "可放弃",
                    pattern: "Boolean",
                    description: "玩家是否可以放弃此任务",
                    default: true
                }
            ]
        },
        {
            id: "rewards",
            name: "奖励系统",
            category: "奖励系统",
            fields: [
                {
                    name: "rewards.items",
                    label: "物品奖励",
                    pattern: "Array<String>",
                    description: "物品奖励列表",
                    default: []
                },
                {
                    name: "rewards.money",
                    label: "金钱奖励",
                    pattern: "Number",
                    description: "金钱数量",
                    default: 0
                },
                {
                    name: "rewards.exp",
                    label: "经验奖励",
                    pattern: "Number",
                    description: "经验值",
                    default: 0
                },
                {
                    name: "rewards.script",
                    label: "JavaScript 脚本",
                    pattern: "Script",
                    description: "自定义脚本奖励"
                },
                {
                    name: "rewards.kether",
                    label: "Kether 脚本",
                    pattern: "Script",
                    description: "Kether 脚本奖励"
                }
            ]
        }
    ],

    // 任务流程组件定义（Task Addon）
    taskAddonComponents: [
        {
            id: "description",
            name: "任务目标描述",
            category: "显示",
            fields: [
                {
                    name: "description",
                    label: "描述内容",
                    pattern: "RichTextArray",
                    description: "任务目标描述，支持进度变量 {0}/{1}",
                    default: []
                }
            ]
        }
    ]
}