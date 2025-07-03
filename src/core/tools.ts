import { FastMCP } from "fastmcp";
import { z } from "zod";
import * as services from "./services/index.js";

/**
 * Register all tools with the MCP server
 *
 * @param server The FastMCP server instance
 */
export function registerTools(server: FastMCP) {
  // Greeting tool
  server.addTool({
    name: "hello_world",
    description: "A simple hello world tool",
    parameters: z.object({
      name: z.string().describe("Name to greet")
    }),
    execute: async (params) => {
      const greeting = services.GreetingService.generateGreeting(params.name);
      return greeting;
    }
  });

  // Farewell tool
  server.addTool({
    name: "goodbye",
    description: "A simple goodbye tool",
    parameters: z.object({
      name: z.string().describe("Name to bid farewell to")
    }),
    execute: async (params) => {
      const farewell = services.GreetingService.generateFarewell(params.name);
      return farewell;
    }
  });

  // Mingdao API Tools
  registerMingdaoTools(server);
}

/**
 * Helper function to extract API config from parameters
 */
function extractApiConfig(params: any) {
  const { appKey, sign, host, ...otherParams } = params;
  const config = { appKey, sign, ...(host && { host }) };
  return { config, requestData: otherParams };
}

/**
 * Register Mingdao API tools
 */
function registerMingdaoTools(server: FastMCP) {
  const apiConfig = z.object({
    appKey: z.string().describe("Mingdao AppKey for authentication"),
    sign: z.string().describe("Mingdao signature for authentication"),
    host: z.string().optional().describe("Optional custom host URL (e.g., https://domain.com). If provided, API calls will use host/api instead of https://api.mingdao.com")
  });

  // Application Tools
  server.addTool({
    name: "mingdao_get_app_info",
    description: "Get application information including groups, worksheets, and custom pages",
    parameters: apiConfig,
    execute: async (params) => {
      try {
        const { config } = extractApiConfig(params);
        const result = await services.mingdaoApi.getAppInfo(config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  // Worksheet Tools
  server.addTool({
    name: "mingdao_get_worksheet_info",
    description: `Get worksheet structure information including controls and configuration. The response includes field type information where each field has a 'type' value corresponding to the following field types:

    Field Type Reference:
    2=Text, 3=Text-Phone, 4=Text-Phone, 5=Text-Email, 6=Number, 7=Text, 8=Number, 9=Option-Single Choice, 10=Option-Multiple Choices, 11=Option-Single Choice, 15=Date, 16=Date, 24=Option-Region, 25=Text, 26=Option-Member, 27=Option-Department, 28=Number, 29=Option-Linked Record, 30=Unknown Type, 31=Number, 32=Text, 33=Text, 35=Option-Linked Record, 36=Number-Yes1/No0, 37=Number, 38=Date, 40=Location, 41=Text, 46=Time, 48=Option-Organizational Role, 50=Text, 51=Query Record`,
    parameters: apiConfig.extend({
      worksheetId: z.string().describe("Worksheet ID to get information for")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.getWorksheetInfo(requestData.worksheetId, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_get_worksheet_rows",
    description: "Get worksheet records list with filtering, sorting and pagination",
    parameters: apiConfig.extend({
      worksheetId: z.string().describe("Worksheet ID"),
      viewId: z.string().optional().describe("View ID for filtering"),
      pageSize: z.number().min(1).max(1000).default(50).describe("Number of records per page (max 1000)"),
      pageIndex: z.number().min(1).default(1).describe("Page number"),
      keyWords: z.string().optional().describe("Keywords for fuzzy search"),
      sortId: z.string().optional().describe("Field ID for sorting"),
      isAsc: z.boolean().default(false).describe("Sort in ascending order"),
      controls: z.array(z.string()).optional().describe("Specific control IDs to return"),
      filters: z.array(z.string()).optional().describe(`Filter conditions. This parameter allows you to specify a set of conditions that records must meet to be included in the result set. It is formatted as a JSON array, with its structure defined as follows:

      type Filters = { // filter object array
        controlId: string; // fieldId
        dataType: number; // fieldTypeId
        spliceType: number; // condition concatenation method, 1: And, 2: Or
        filterType: number; // expression type, refer to the FilterTypeEnum Reference for enumerable values
        values?: string[]; // values in the condition, for option-type fields, multiple values can be passed
        value?: string; // value in the condition, a single value can be passed according to the field type
        dateRange?: number; // date range, mandatory when filterType is 17 or 18, refer to the DateRangeEnum Reference for enumerable values
        minValue?: string; // minimum value for custom range
        maxValue?: string; // maximum value for custom range
        isAsc?: boolean; // ascending order, false: descending, true: ascending
      }[];

      For Option-Single Choice and Option-Multiple Choices fields, if this option field has options, then you need to get the corresponding key value from the options in the current field information via value, and pass it into values in array format. Do not use the options value of other fields as input conditions.
      For fields of type Option-Member/Option-Department/Option-Organizational Role/Option-Linked Record/Option-Region, the values parameter must be in the format of a string array like ["uuid"](uuid comes from rowid, filterType must be 24). If it is a string type value, you can pass it in using the value parameter(filterType must be 2).

      FilterTypeEnum Reference:
      1=Like(Contains), 2=Eq(Is/Equal), 3=Start(Starts With), 4=End(Ends With), 5=NotLike(Does Not Contain), 6=Ne(Is Not/Not Equal), 7=IsEmpty(Empty), 8=HasValue(Not Empty), 11=Between(Within Range), 12=NotBetween(Outside Range), 13=Gt(Greater Than), 14=Gte(Greater Than or Equal To), 15=Lt(Less Than), 16=Lte(Less Than or Equal To), 17=DateEnum(Date Is), 18=NotDateEnum(Date Is Not), 24=RCEq(Associated Field Is), 25=RCNe(Associated Field Is Not), 26=ArrEq(Array Equals), 27=ArrNe(Array Does Not Equal), 31=DateBetween(Date Within Range), 32=DateNotBetween(Date Not Within Range), 33=DateGt(Date Later Than), 34=DateGte(Date Later Than or Equal To), 35=DateLt(Date Earlier Than), 36=DateLte(Date Earlier Than or Equal To)

      DateRangeEnum Reference:
      1=Today, 2=Yesterday, 3=Tomorrow, 4=ThisWeek, 5=LastWeek, 6=NextWeek, 7=ThisMonth, 8=LastMonth, 9=NextMonth, 12=ThisQuarter, 13=LastQuarter, 14=NextQuarter, 15=ThisYear, 16=LastYear, 17=NextYear, 18=Customize, 21=Last7Day, 22=Last14Day, 23=Last30Day, 31=Next7Day, 32=Next14Day, 33=Next33Day`),
      notGetTotal: z.boolean().default(false).describe("Skip total count for better performance"),
      useControlId: z.boolean().default(false).describe("Return only control IDs"),
      getSystemControl: z.boolean().default(false).describe("Include system fields")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.getFilterRows(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_get_row_detail",
    description: "Get detailed information of a specific row record",
    parameters: apiConfig.extend({
      worksheetId: z.string().describe("Worksheet ID"),
      rowId: z.string().describe("Row record ID"),
      getSystemControl: z.boolean().default(false).describe("Include system fields")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.getRowById(
          requestData.worksheetId,
          requestData.rowId,
          requestData.getSystemControl,
          config
        );
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_add_row",
    description: "Create a new row record in worksheet",
    parameters: apiConfig.extend({
      worksheetId: z.string().describe("Worksheet ID"),
      controls: z.array(z.object({
        controlId: z.string().describe("Control ID"),
        value: z.string().describe("Control value")
      })).describe("Control data for the new record"),
      triggerWorkflow: z.boolean().default(true).describe("Whether to trigger workflow")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.addRow(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_update_row",
    description: "Update an existing row record in worksheet",
    parameters: apiConfig.extend({
      worksheetId: z.string().describe("Worksheet ID"),
      rowId: z.string().describe("Row record ID to update"),
      controls: z.array(z.object({
        controlId: z.string().describe("Control ID"),
        value: z.string().describe("New control value")
      })).describe("Control data to update"),
      triggerWorkflow: z.boolean().default(true).describe("Whether to trigger workflow")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.updateRow(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_delete_row",
    description: "Delete a row record from worksheet",
    parameters: apiConfig.extend({
      worksheetId: z.string().describe("Worksheet ID"),
      rowId: z.string().describe("Row record ID to delete"),
      triggerWorkflow: z.boolean().default(true).describe("Whether to trigger workflow"),
      ThoroughDelete: z.boolean().default(false).describe("Whether to permanently delete (true) or logical delete (false)")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.deleteRow(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_create_worksheet",
    description: "Create a new worksheet with specified controls",
    parameters: apiConfig.extend({
      name: z.string().describe("Worksheet name"),
      alias: z.string().describe("Worksheet alias"),
      sectionId: z.string().optional().describe("Section ID to place the worksheet"),
      controls: z.array(z.object({
        controlName: z.string().describe("Control name"),
        alias: z.string().optional().describe("Control alias"),
        type: z.number().describe("Control type (2:text, 6:number, 11:single select, 10:multi select, etc.)"),
        required: z.boolean().describe("Whether the control is required"),
        attribute: z.string().optional().describe("1:title, 0:non-title"),
        dot: z.number().optional().describe("Decimal places for number/amount controls (0-14)"),
        enumDefault: z.string().optional().describe("For member controls: 0=single, 1=multi; For relation controls: 1=single, 2=multi"),
        options: z.array(z.object({
          value: z.string().describe("Option name"),
          index: z.number().describe("Option order")
        })).optional().describe("Options for select controls"),
        max: z.number().optional().describe("Max value for level controls (0-10)"),
        dataSource: z.string().optional().describe("Data source ID for relation controls"),
        unit: z.number().optional().describe("Time unit for time controls")
      })).describe("Control definitions for the worksheet")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.createWorksheet(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  // Batch operations
  server.addTool({
    name: "mingdao_add_rows_batch",
    description: "Create multiple row records in worksheet at once",
    parameters: apiConfig.extend({
      worksheetId: z.string().describe("Worksheet ID"),
      rows: z.array(z.array(z.object({
        controlId: z.string().describe("Control ID"),
        value: z.string().describe("Control value")
      }))).describe("Array of row data, each row is an array of control data"),
      triggerWorkflow: z.boolean().default(true).describe("Whether to trigger workflow"),
      ReturnRowIds: z.boolean().default(false).describe("Return row IDs instead of count")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.addRows(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_update_rows_batch",
    description: "Update multiple row records in worksheet at once",
    parameters: apiConfig.extend({
      worksheetId: z.string().describe("Worksheet ID"),
      rowIds: z.array(z.string()).describe("Array of row IDs to update"),
      controls: z.array(z.object({
        controlId: z.string().describe("Control ID"),
        value: z.string().describe("New control value")
      })).describe("Control data to update for all rows"),
      triggerWorkflow: z.boolean().default(true).describe("Whether to trigger workflow")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.updateRows(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  // Additional worksheet operations
  server.addTool({
    name: "mingdao_get_related_records",
    description: "Get related records from linked worksheets",
    parameters: apiConfig.extend({
      worksheetId: z.string().describe("Worksheet ID"),
      rowId: z.string().describe("Row record ID"),
      controlId: z.string().describe("Related control ID"),
      pageSize: z.number().min(1).max(1000).default(50).describe("Number of records per page"),
      pageIndex: z.number().min(1).default(1).describe("Page number")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.getRelatedRecords(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_get_share_link",
    description: "Get sharing link for a record",
    parameters: apiConfig.extend({
      worksheetId: z.string().describe("Worksheet ID"),
      rowId: z.string().describe("Row record ID"),
      validTime: z.number().optional().describe("Link validity time in hours")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.getShareLink(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_get_row_count",
    description: "Get total number of rows in worksheet",
    parameters: apiConfig.extend({
      worksheetId: z.string().describe("Worksheet ID")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.getRowCount(requestData.worksheetId, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_get_row_logs",
    description: "Get operation logs for a specific row record",
    parameters: apiConfig.extend({
      worksheetId: z.string().describe("Worksheet ID"),
      rowId: z.string().describe("Row record ID"),
      pageSize: z.number().min(1).max(100).default(20).describe("Number of logs per page"),
      pageIndex: z.number().min(1).default(1).describe("Page number")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.getRowLogs(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  // Role management tools
  server.addTool({
    name: "mingdao_get_roles",
    description: "Get list of roles in the application",
    parameters: apiConfig,
    execute: async (params) => {
      try {
        const { config } = extractApiConfig(params);
        const result = await services.mingdaoApi.getRoles(config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_create_role",
    description: "Create a new role in the application",
    parameters: apiConfig.extend({
      name: z.string().describe("Role name"),
      description: z.string().optional().describe("Role description"),
      permissionWay: z.number().optional().describe("Permission method"),
      sheets: z.array(z.object({
        worksheetId: z.string().describe("Worksheet ID"),
        operate: z.array(z.string()).describe("Operations allowed")
      })).optional().describe("Worksheet permissions")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.createRole(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_delete_role",
    description: "Delete a role from the application",
    parameters: apiConfig.extend({
      roleId: z.string().describe("Role ID to delete")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.deleteRole(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_add_role_members",
    description: "Add members to a role",
    parameters: apiConfig.extend({
      roleId: z.string().describe("Role ID"),
      userIds: z.array(z.string()).describe("Array of user IDs to add to the role")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.addRoleMembers(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_remove_role_members",
    description: "Remove members from a role",
    parameters: apiConfig.extend({
      roleId: z.string().describe("Role ID"),
      userIds: z.array(z.string()).describe("Array of user IDs to remove from the role")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.removeRoleMembers(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_get_role_detail",
    description: "Get detailed information about a specific role",
    parameters: apiConfig.extend({
      roleId: z.string().describe("Role ID")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.getRoleDetail(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_exit_app",
    description: "Exit from the application",
    parameters: apiConfig,
    execute: async (params) => {
      try {
        const { config } = extractApiConfig(params);
        const result = await services.mingdaoApi.exitApp(config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  // Option set management tools
  server.addTool({
    name: "mingdao_create_option_set",
    description: "Create a new option set",
    parameters: apiConfig.extend({
      name: z.string().describe("Option set name"),
      options: z.array(z.object({
        key: z.string().describe("Option key"),
        value: z.string().describe("Option value"),
        color: z.string().optional().describe("Option color"),
        index: z.number().describe("Option order")
      })).describe("Array of options"),
      type: z.number().optional().describe("Option set type")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.createOptionSet(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_get_option_set",
    description: "Get option set information",
    parameters: apiConfig.extend({
      optionSetId: z.string().describe("Option set ID")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.getOptionSet(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_update_option_set",
    description: "Update an existing option set",
    parameters: apiConfig.extend({
      optionSetId: z.string().describe("Option set ID"),
      name: z.string().optional().describe("New option set name"),
      options: z.array(z.object({
        key: z.string().describe("Option key"),
        value: z.string().describe("Option value"),
        color: z.string().optional().describe("Option color"),
        index: z.number().describe("Option order")
      })).optional().describe("Updated array of options")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.updateOptionSet(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "mingdao_delete_option_set",
    description: "Delete an option set",
    parameters: apiConfig.extend({
      optionSetId: z.string().describe("Option set ID to delete")
    }),
    execute: async (params) => {
      try {
        const { config, requestData } = extractApiConfig(params);
        const result = await services.mingdaoApi.deleteOptionSet(requestData, config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  // Utility tools
  server.addTool({
    name: "mingdao_get_area_info",
    description: "Get geographical area information",
    parameters: apiConfig,
    execute: async (params) => {
      try {
        const { config } = extractApiConfig(params);
        const result = await services.mingdaoApi.getAreaInfo(config);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });
}