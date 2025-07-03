# Changelog

All notable changes to this project will be documented in this file.

## [1.3.2] - 2025-01-03

### Enhanced
- **Field Type Documentation**: Added comprehensive field type reference to `mingdao_get_worksheet_info` tool
  - Complete field type mapping with 30+ control types
  - Detailed description for each field type (Text, Number, Option, Date, etc.)
  - Enhanced tool description with field type reference
  - Added usage examples showing field type interpretation

### Documentation Improvements
- Added complete field type reference table in MINGDAO_API_TOOLS.md
- Enhanced worksheet info examples with field type explanations
- Improved developer experience with detailed type specifications
- Added quick reference for common field type categories

## [1.3.1] - 2025-01-03

### Enhanced
- **Detailed Filters Documentation**: Added comprehensive documentation for the `filters` parameter in `mingdao_get_worksheet_rows` tool
  - Complete FilterTypeEnum reference with 20+ filter types
  - DateRangeEnum reference with 15+ date range options
  - Detailed parameter structure explanation
  - Usage examples for different field types
  - Special handling instructions for option fields and linked records

### Documentation Improvements
- Added advanced filtering examples in MINGDAO_API_TOOLS.md
- Enhanced parameter descriptions with technical specifications
- Improved developer experience with detailed enum references

## [1.3.0] - 2025-01-03

### Added
- **Custom Server Support**: Added optional `host` parameter to all API tools
  - When `host` is provided (e.g., `https://domain.com`), API calls use `host/api` instead of `https://api.mingdao.com`
  - Enables support for private deployments and custom Mingdao instances
  - Backward compatible - existing configurations continue to work

### Changed
- **Package Name**: Changed from `@mingdaocloud/hap` to `@mingdaocloud/hap-mcp`
- **Binary Name**: Changed from `hap` to `hap-mcp`
- **Enhanced API Configuration**: All tools now support flexible server configuration
- **Improved Documentation**: Added examples for custom server usage

### Technical Improvements
- Enhanced `MingdaoApiService` with dynamic base URL resolution
- Added `extractApiConfig` helper function for cleaner parameter handling
- Updated all 25+ tools to support the new host configuration
- Maintained full backward compatibility

## [1.2.0] - 2025-01-03

### Added
- **Complete API Coverage**: Added all remaining Mingdao API tools (25+ tools total)
- **Batch Operations**:
  - `mingdao_add_rows_batch` - Batch create multiple records
  - `mingdao_update_rows_batch` - Batch update multiple records
- **Extended Worksheet Operations**:
  - `mingdao_get_related_records` - Get related records from linked worksheets
  - `mingdao_get_share_link` - Get sharing links for records
  - `mingdao_get_row_count` - Get total row count in worksheets
  - `mingdao_get_row_logs` - Get operation logs for records
- **Role Management Tools**:
  - `mingdao_get_roles` - Get role list
  - `mingdao_create_role` - Create new roles
  - `mingdao_delete_role` - Delete roles
  - `mingdao_add_role_members` - Add members to roles
  - `mingdao_remove_role_members` - Remove members from roles
  - `mingdao_get_role_detail` - Get role details
  - `mingdao_exit_app` - Exit application
- **Option Set Management**:
  - `mingdao_create_option_set` - Create option sets
  - `mingdao_get_option_set` - Get option set information
  - `mingdao_update_option_set` - Update option sets
  - `mingdao_delete_option_set` - Delete option sets
- **Utility Tools**:
  - `mingdao_get_area_info` - Get geographical area information

### Changed
- **Package Name**: Changed from `@mingdaoai/hap` to `@mingdaocloud/hap`
- **Enhanced Documentation**: Updated all documentation with new tools and examples
- **Improved API Service**: Extended MingdaoApiService with all API endpoints

### Technical Improvements
- Complete API endpoint coverage for Mingdao platform
- Enhanced error handling across all tools
- Comprehensive parameter validation with Zod schemas
- Detailed JSDoc documentation for all new methods

## [1.1.0] - 2025-01-03

### Added
- **Complete Mingdao API Integration**: Added full support for Mingdao platform APIs
- **Application Management Tools**:
  - `mingdao_get_app_info` - Get application information and structure
- **Worksheet Management Tools**:
  - `mingdao_create_worksheet` - Create new worksheets with custom controls
  - `mingdao_get_worksheet_info` - Get worksheet structure and configuration
  - `mingdao_get_worksheet_rows` - Get worksheet records with filtering and pagination
  - `mingdao_get_row_detail` - Get detailed information of specific records
  - `mingdao_add_row` - Create new records in worksheets
  - `mingdao_update_row` - Update existing records
  - `mingdao_delete_row` - Delete records (logical or physical deletion)
- **MingdaoApiService**: Centralized API service for all Mingdao operations
- **Comprehensive Documentation**: Added detailed API tools documentation
- **Type Safety**: Full TypeScript support for all API parameters and responses

### Enhanced
- Updated README with Mingdao API tools information
- Added usage examples and configuration guides
- Improved error handling for API calls

### Technical Details
- All tools support both required authentication (appKey, sign)
- JSON response formatting for better readability
- Support for advanced features like filtering, sorting, pagination
- Configurable workflow triggers and deletion modes
- Support for all major control types in worksheet creation

## [1.0.0] - 2025-01-03

### Added
- Initial release of HAP MCP Server
- Basic FastMCP framework integration
- Hello world and goodbye tools
- TypeScript configuration
- Build and development scripts
- npm package configuration for @mingdaocloud/hap-mcp
- MIT license
- Basic documentation and usage guides

### Features
- Dual transport support (stdio and HTTP)
- Production-ready configuration
- Extensible architecture for custom tools
- Complete build and deployment pipeline
