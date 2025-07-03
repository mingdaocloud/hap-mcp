# 明道云API工具使用指南

HAP MCP Server现在包含了完整的明道云API工具集，可以让AI助手直接操作明道云平台的数据。

## 🔧 可用工具

### 应用管理
- `mingdao_get_app_info` - 获取应用信息

### 工作表管理
- `mingdao_create_worksheet` - 创建新工作表
- `mingdao_get_worksheet_info` - 获取工作表结构信息
- `mingdao_get_worksheet_rows` - 获取工作表记录列表
- `mingdao_get_row_detail` - 获取行记录详情
- `mingdao_add_row` - 新建行记录
- `mingdao_update_row` - 更新行记录
- `mingdao_delete_row` - 删除行记录
- `mingdao_add_rows_batch` - 批量新建行记录
- `mingdao_update_rows_batch` - 批量更新行记录
- `mingdao_get_related_records` - 获取关联记录
- `mingdao_get_share_link` - 获取记录分享链接
- `mingdao_get_row_count` - 获取工作表总行数
- `mingdao_get_row_logs` - 获取行记录日志

### 角色管理
- `mingdao_get_roles` - 获取角色列表
- `mingdao_create_role` - 创建角色
- `mingdao_delete_role` - 删除角色
- `mingdao_add_role_members` - 添加角色成员
- `mingdao_remove_role_members` - 移除角色成员
- `mingdao_get_role_detail` - 获取角色详情
- `mingdao_exit_app` - 退出应用

### 选项集管理
- `mingdao_create_option_set` - 创建选项集
- `mingdao_get_option_set` - 获取选项集
- `mingdao_update_option_set` - 编辑选项集
- `mingdao_delete_option_set` - 删除选项集

### 其他工具
- `mingdao_get_area_info` - 获取地区信息

## 🔑 认证参数

所有工具都需要以下认证参数：
- `appKey`: 明道云应用密钥
- `sign`: 明道云签名
- `host`: (可选) 自定义服务器地址，如 https://domain.com，将使用 host/api 替代默认的 https://api.mingdao.com

## 📝 使用示例

### 1. 获取应用信息
```json
{
  "tool": "mingdao_get_app_info",
  "parameters": {
    "appKey": "your_app_key",
    "sign": "your_signature"
  }
}
```

### 1.1. 使用自定义服务器获取应用信息
```json
{
  "tool": "mingdao_get_app_info",
  "parameters": {
    "appKey": "your_app_key",
    "sign": "your_signature",
    "host": "https://your-domain.com"
  }
}
```

### 2. 获取工作表记录
```json
{
  "tool": "mingdao_get_worksheet_rows",
  "parameters": {
    "appKey": "your_app_key",
    "sign": "your_signature",
    "worksheetId": "worksheet_id",
    "pageSize": 50,
    "pageIndex": 1,
    "keyWords": "搜索关键词"
  }
}
```

### 2.1. 使用高级筛选获取记录
```json
{
  "tool": "mingdao_get_worksheet_rows",
  "parameters": {
    "appKey": "your_app_key",
    "sign": "your_signature",
    "worksheetId": "worksheet_id",
    "pageSize": 50,
    "filters": [
      {
        "controlId": "field_id_1",
        "dataType": 2,
        "spliceType": 1,
        "filterType": 2,
        "value": "目标值"
      },
      {
        "controlId": "field_id_2",
        "dataType": 15,
        "spliceType": 1,
        "filterType": 17,
        "dateRange": 1
      },
      {
        "controlId": "field_id_3",
        "dataType": 11,
        "spliceType": 2,
        "filterType": 24,
        "values": ["option_key_1", "option_key_2"]
      }
    ]
  }
}
```

### 2.2. 获取工作表结构信息
```json
{
  "tool": "mingdao_get_worksheet_info",
  "parameters": {
    "appKey": "your_app_key",
    "sign": "your_signature",
    "worksheetId": "worksheet_id"
  }
}
```

返回示例（包含字段类型信息）：
```json
{
  "success": true,
  "data": {
    "controls": [
      {
        "controlId": "title",
        "controlName": "标题",
        "type": 2,
        "required": true
      },
      {
        "controlId": "amount",
        "controlName": "金额",
        "type": 8,
        "required": false
      },
      {
        "controlId": "status",
        "controlName": "状态",
        "type": 11,
        "options": [
          {"key": "1", "value": "进行中"},
          {"key": "2", "value": "已完成"}
        ]
      }
    ]
  }
}
```

### 3. 创建新记录
```json
{
  "tool": "mingdao_add_row",
  "parameters": {
    "appKey": "your_app_key",
    "sign": "your_signature",
    "worksheetId": "worksheet_id",
    "controls": [
      {
        "controlId": "control_id_1",
        "value": "值1"
      },
      {
        "controlId": "control_id_2", 
        "value": "值2"
      }
    ]
  }
}
```

### 4. 更新记录
```json
{
  "tool": "mingdao_update_row",
  "parameters": {
    "appKey": "your_app_key",
    "sign": "your_signature",
    "worksheetId": "worksheet_id",
    "rowId": "row_id",
    "controls": [
      {
        "controlId": "control_id_1",
        "value": "新值1"
      }
    ]
  }
}
```

### 5. 创建工作表
```json
{
  "tool": "mingdao_create_worksheet",
  "parameters": {
    "appKey": "your_app_key",
    "sign": "your_signature",
    "name": "新工作表",
    "alias": "new_worksheet",
    "controls": [
      {
        "controlName": "标题",
        "type": 2,
        "required": true,
        "attribute": "1"
      },
      {
        "controlName": "数值",
        "type": 6,
        "required": false,
        "dot": 2
      }
    ]
  }
}
```

### 6. 批量创建记录
```json
{
  "tool": "mingdao_add_rows_batch",
  "parameters": {
    "appKey": "your_app_key",
    "sign": "your_signature",
    "worksheetId": "worksheet_id",
    "rows": [
      [
        {"controlId": "control_id_1", "value": "值1"},
        {"controlId": "control_id_2", "value": "值2"}
      ],
      [
        {"controlId": "control_id_1", "value": "值3"},
        {"controlId": "control_id_2", "value": "值4"}
      ]
    ]
  }
}
```

### 7. 创建角色
```json
{
  "tool": "mingdao_create_role",
  "parameters": {
    "appKey": "your_app_key",
    "sign": "your_signature",
    "name": "新角色",
    "description": "角色描述",
    "sheets": [
      {
        "worksheetId": "worksheet_id",
        "operate": ["view", "add", "edit"]
      }
    ]
  }
}
```

### 8. 创建选项集
```json
{
  "tool": "mingdao_create_option_set",
  "parameters": {
    "appKey": "your_app_key",
    "sign": "your_signature",
    "name": "新选项集",
    "options": [
      {
        "key": "option1",
        "value": "选项1",
        "color": "#FF0000",
        "index": 1
      },
      {
        "key": "option2",
        "value": "选项2",
        "color": "#00FF00",
        "index": 2
      }
    ]
  }
}
```

## 🎯 控件类型说明

完整的字段控件类型对照表（用于 `mingdao_get_worksheet_info` 返回值中的 `type` 字段）：

| 类型值 | 控件类型 | 说明 |
|--------|----------|------|
| 2 | Text | 文本 |
| 3 | Text-Phone | 电话号码 |
| 4 | Text-Phone | 电话号码 |
| 5 | Text-Email | 邮箱地址 |
| 6 | Number | 数值 |
| 7 | Text | 文本 |
| 8 | Number | 金额 |
| 9 | Option-Single Choice | 单选 |
| 10 | Option-Multiple Choices | 多选 |
| 11 | Option-Single Choice | 单选 |
| 15 | Date | 日期 |
| 16 | Date | 日期时间 |
| 24 | Option-Region | 地区 |
| 25 | Text | 文本 |
| 26 | Option-Member | 成员 |
| 27 | Option-Department | 部门 |
| 28 | Number | 数值 |
| 29 | Option-Linked Record | 关联记录 |
| 30 | Unknown Type | 未知类型 |
| 31 | Number | 数值 |
| 32 | Text | 文本 |
| 33 | Text | 文本 |
| 35 | Option-Linked Record | 关联记录 |
| 36 | Number-Yes1/No0 | 是否（1是/0否） |
| 37 | Number | 数值 |
| 38 | Date | 日期 |
| 40 | Location | 定位 |
| 41 | Text | 文本 |
| 46 | Time | 时间 |
| 48 | Option-Organizational Role | 组织角色 |
| 50 | Text | 文本 |
| 51 | Query Record | 查询记录 |

### 常用控件类型快速参考：
- **文本类**: 2, 3, 4, 5, 7, 25, 32, 33, 41, 50
- **数值类**: 6, 8, 28, 31, 36, 37
- **选项类**: 9, 10, 11, 24, 26, 27, 29, 35, 48
- **日期时间类**: 15, 16, 38, 46
- **特殊类**: 30, 40, 51

## 🔍 筛选和排序

工具支持复杂的筛选和排序功能：
- 使用`filters`参数进行条件筛选
- 使用`sortId`和`isAsc`进行排序
- 使用`keyWords`进行关键词搜索
- 使用`controls`参数指定返回的字段

### 筛选条件详解

`filters`参数支持复杂的筛选逻辑，结构如下：

```typescript
type Filters = {
  controlId: string;     // 字段ID
  dataType: number;      // 字段类型ID
  spliceType: number;    // 条件连接方式：1=And, 2=Or
  filterType: number;    // 表达式类型，参考FilterTypeEnum
  values?: string[];     // 条件值数组（选项类字段）
  value?: string;        // 单个条件值
  dateRange?: number;    // 日期范围（filterType为17或18时必填）
  minValue?: string;     // 自定义范围最小值
  maxValue?: string;     // 自定义范围最大值
  isAsc?: boolean;       // 升序排列
}[];
```

#### 常用FilterType枚举值：
- `2`: 等于 (Is/Equal)
- `1`: 包含 (Contains)
- `7`: 为空 (Empty)
- `8`: 不为空 (Not Empty)
- `13`: 大于 (Greater Than)
- `15`: 小于 (Less Than)
- `17`: 日期是 (Date Is)
- `24`: 关联字段是 (Associated Field Is)

#### 常用DateRange枚举值：
- `1`: 今天 (Today)
- `7`: 本月 (This Month)
- `15`: 本年 (This Year)
- `21`: 过去7天 (Last 7 Days)
- `18`: 自定义 (Custom)

## ⚠️ 注意事项

1. 所有API调用都需要有效的appKey和sign
2. 删除操作支持逻辑删除和物理删除
3. 创建和更新操作可以选择是否触发工作流
4. 分页查询最大支持1000条记录
5. 返回数据为JSON格式字符串

## 🚀 在Cursor中使用

配置`.cursor/mcp.json`：
```json
{
  "mcpServers": {
    "hap-mcp": {
      "command": "npx",
      "args": ["@mingdaocloud/hap-mcp"]
    }
  }
}
```

然后在Cursor中直接使用这些工具操作明道云数据！
