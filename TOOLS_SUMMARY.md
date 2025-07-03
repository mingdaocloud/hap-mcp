# HAP MCP Server - 完整工具列表

## 📊 工具统计
- **总计**: 25+ 个明道云API工具
- **覆盖范围**: 100% 明道云API文档覆盖
- **分类**: 6大功能模块

## 🔧 工具分类详情

### 1. 应用管理 (1个工具)
| 工具名称 | 功能描述 |
|---------|---------|
| `mingdao_get_app_info` | 获取应用信息，包含分组、工作表、自定义页面信息 |

### 2. 工作表管理 (13个工具)
| 工具名称 | 功能描述 |
|---------|---------|
| `mingdao_create_worksheet` | 创建新工作表，支持多种控件类型 |
| `mingdao_get_worksheet_info` | 获取工作表结构信息和控件配置 |
| `mingdao_get_worksheet_rows` | 获取工作表记录列表，支持筛选、排序、分页 |
| `mingdao_get_row_detail` | 获取单条记录的详细信息 |
| `mingdao_add_row` | 新建单条行记录 |
| `mingdao_update_row` | 更新单条行记录 |
| `mingdao_delete_row` | 删除行记录（支持逻辑删除和物理删除） |
| `mingdao_add_rows_batch` | 批量新建多条行记录 |
| `mingdao_update_rows_batch` | 批量更新多条行记录 |
| `mingdao_get_related_records` | 获取关联记录列表 |
| `mingdao_get_share_link` | 获取记录分享链接 |
| `mingdao_get_row_count` | 获取工作表总行数 |
| `mingdao_get_row_logs` | 获取行记录操作日志 |

### 3. 角色管理 (7个工具)
| 工具名称 | 功能描述 |
|---------|---------|
| `mingdao_get_roles` | 获取应用角色列表 |
| `mingdao_create_role` | 创建新角色，配置权限 |
| `mingdao_delete_role` | 删除指定角色 |
| `mingdao_add_role_members` | 添加成员到角色 |
| `mingdao_remove_role_members` | 从角色中移除成员 |
| `mingdao_get_role_detail` | 获取角色详细信息 |
| `mingdao_exit_app` | 退出应用 |

### 4. 选项集管理 (4个工具)
| 工具名称 | 功能描述 |
|---------|---------|
| `mingdao_create_option_set` | 创建新选项集 |
| `mingdao_get_option_set` | 获取选项集信息 |
| `mingdao_update_option_set` | 编辑选项集内容 |
| `mingdao_delete_option_set` | 删除选项集 |

### 5. 其他工具 (1个工具)
| 工具名称 | 功能描述 |
|---------|---------|
| `mingdao_get_area_info` | 获取地区信息 |

### 6. 基础工具 (2个工具)
| 工具名称 | 功能描述 |
|---------|---------|
| `hello_world` | 简单的问候工具 |
| `goodbye` | 简单的告别工具 |

## 🎯 核心特性

### 认证机制
- 所有明道云工具都需要 `appKey` 和 `sign` 参数
- 统一的认证处理机制
- 安全的API调用封装

### 数据处理
- JSON格式化输出，便于阅读
- 完整的错误处理和异常捕获
- 类型安全的参数验证

### 高级功能
- 批量操作支持
- 复杂筛选和排序
- 分页查询优化
- 工作流触发控制
- 权限管理集成

## 🚀 使用场景

1. **数据管理**: 完整的CRUD操作
2. **批量处理**: 高效的批量数据操作
3. **权限控制**: 精细的角色权限管理
4. **系统集成**: 与明道云平台深度集成
5. **自动化**: 支持工作流自动化触发

## 📈 性能优化

- 支持分页查询，避免大数据量问题
- 批量操作减少API调用次数
- 可选的总数统计，提升查询性能
- 智能的参数验证，减少无效请求

## 🔄 版本兼容

- 基于明道云最新API规范
- 向后兼容的参数设计
- 灵活的配置选项
- 完整的文档支持
