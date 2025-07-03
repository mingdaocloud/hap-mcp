import { FastMCP } from "fastmcp";
import { z } from "zod";
import * as services from "./services/index.js";

/**
 * Register all tools with the MCP server
 *
 * @param server The FastMCP server instance
 */
export function registerTools(server: FastMCP) {
  // Mingdao API Tools
  registerMingdaoTools(server);
}

/**
 * Register Mingdao API tools - converted from Python code
 */
function registerMingdaoTools(server: FastMCP) {

  // Get Worksheet Fields Tool
  server.addTool({
    name: "get_worksheet_fields",
    description: `Get the field structure and field types of the worksheet. The response includes field type information where each field has a 'type' value corresponding to the following field types:

    Field Type Reference:
    2=Text, 3=Text-Phone, 4=Text-Phone, 5=Text-Email, 6=Number, 7=Text, 8=Number, 9=Option-Single Choice, 10=Option-Multiple Choices, 11=Option-Single Choice, 15=Date, 16=Date, 24=Option-Region, 25=Text, 26=Option-Member, 27=Option-Department, 28=Number, 29=Option-Linked Record, 30=Unknown Type, 31=Number, 32=Text, 33=Text, 35=Option-Linked Record, 36=Number-Yes1/No0, 37=Number, 38=Date, 40=Location, 41=Text, 46=Time, 48=Option-Organizational Role, 50=Text, 51=Query Record`,
    parameters: z.object({
      worksheetId: z.string().describe("The ID of the specified worksheet which to get the fields information"),
      resultType: z.enum(['table', 'json']).default('table').describe("Result type: table for table styled text, json for JSON text")
    }),
    execute: async (params) => {
      try {
        const result = await services.mingdaoApi.getWorksheetInfo(params.worksheetId);
        
        if (result.error_code !== 1) {
          return JSON.stringify({ 
            success: false, 
            error: `Failed to get the worksheet information. ${result.error_msg}` 
          }, null, 2);
        }
        
        const data = result.data || {};
        const controls = data.controls || [];
        const { fieldsJson, fieldsTable } = getWorksheetFields(controls);
        
        if (params.resultType === 'json') {
          return JSON.stringify({ success: true, result: fieldsJson }, null, 2);
        } else {
          return JSON.stringify({ success: true, result: fieldsTable }, null, 2);
        }
      } catch (error) {
        return JSON.stringify({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }, null, 2);
      }
    }
  });

  // List Worksheet Records Tool
  server.addTool({
    name: "list_worksheet_records",
    description: "List records from the worksheet",
    parameters: z.object({
      worksheetId: z.string().describe("This parameter specifies the ID of the worksheet where the records are stored"),
      fieldIds: z.string().optional().describe("A comma-separated list of field IDs whose data to retrieve. If not provided, all fields' data will be fetched"),
      filters: z.array(z.object({
        controlId: z.string().describe("Field ID"),
        dataType: z.number().describe("Field type ID"),
        spliceType: z.number().describe("Condition concatenation method: 1=And, 2=Or"),
        filterType: z.number().describe("Expression type"),
        values: z.array(z.string()).optional().describe("Values in the condition"),
        value: z.string().optional().describe("Single value in the condition"),
        dateRange: z.number().optional().describe("Date range"),
        minValue: z.string().optional().describe("Minimum value for custom range"),
        maxValue: z.string().optional().describe("Maximum value for custom range"),
        isAsc: z.boolean().optional().describe("Ascending order")
      })).optional().describe(`Filter conditions array. Each filter object specifies conditions that records must meet.

      For Option-Single Choice and Option-Multiple Choices fields, get the corresponding key value from the options in the current field information via value, and pass it into values in array format. Do not use the options value of other fields as input conditions.
      For fields of type Option-Member/Option-Department/Option-Organizational Role/Option-Linked Record/Option-Region, the values parameter must be in the format of a string array like ["uuid"](uuid comes from rowid, filterType must be 24). If it is a string type value, you can pass it in using the value parameter(filterType must be 2).

      FilterTypeEnum Reference:
      1=Like(Contains), 2=Eq(Is/Equal), 3=Start(Starts With), 4=End(Ends With), 5=NotLike(Does Not Contain), 6=Ne(Is Not/Not Equal), 7=IsEmpty(Empty), 8=HasValue(Not Empty), 11=Between(Within Range), 12=NotBetween(Outside Range), 13=Gt(Greater Than), 14=Gte(Greater Than or Equal To), 15=Lt(Less Than), 16=Lte(Less Than or Equal To), 17=DateEnum(Date Is), 18=NotDateEnum(Date Is Not), 24=RCEq(Associated Field Is), 25=RCNe(Associated Field Is Not), 26=ArrEq(Array Equals), 27=ArrNe(Array Does Not Equal), 31=DateBetween(Date Within Range), 32=DateNotBetween(Date Not Within Range), 33=DateGt(Date Later Than), 34=DateGte(Date Later Than or Equal To), 35=DateLt(Date Earlier Than), 36=DateLte(Date Earlier Than or Equal To)

      DateRangeEnum Reference:
      1=Today, 2=Yesterday, 3=Tomorrow, 4=ThisWeek, 5=LastWeek, 6=NextWeek, 7=ThisMonth, 8=LastMonth, 9=NextMonth, 12=ThisQuarter, 13=LastQuarter, 14=NextQuarter, 15=ThisYear, 16=LastYear, 17=NextYear, 18=Customize, 21=Last7Day, 22=Last14Day, 23=Last30Day, 31=Next7Day, 32=Next14Day, 33=Next33Day`),
      sortId: z.string().optional().describe("The unique identifier of the field that will be used to sort the results"),
      sortIsAsc: z.boolean().optional().describe("Controls the direction of the sort"),
      limit: z.number().optional().describe("The maximum number of records that should be returned"),
      pageIndex: z.number().optional().describe("The page number when paginating through a list of records"),
      resultType: z.enum(['table', 'json']).default('table').describe("Result type: table for table styled text, json for JSON text")
    }),
    execute: async (params) => {
      try {
        // First get worksheet info to build schema
        const worksheetInfo = await services.mingdaoApi.getWorksheetInfo(params.worksheetId);
        if (worksheetInfo.error_code !== 1) {
          return JSON.stringify({
            success: false,
            error: `Failed to get worksheet information. ${worksheetInfo.error_msg}`
          }, null, 2);
        }

        const worksheetData = worksheetInfo.data || {};
        const worksheetName = worksheetData.name || 'Unknown Worksheet';
        const controls = worksheetData.controls || [];
        const { fields, schema, tableHeader } = getRecordSchema(controls, params.fieldIds);

        // Build query parameters
        const queryParams: any = {
          worksheetId: params.worksheetId,
          pageSize: Math.min(Math.max(params.limit || 50, 1), 1000),
          pageIndex: Math.max(params.pageIndex || 1, 1),
          useControlId: true,
          listType: 1
        };

        if (params.fieldIds) {
          const fieldIdList = params.fieldIds.split(',').map(id => id.trim()).filter(id => id);
          if (!fieldIdList.includes('rowid')) fieldIdList.push('rowid');
          if (!fieldIdList.includes('ctime')) fieldIdList.push('ctime');
          queryParams.controls = fieldIdList;
        }

        if (params.filters && params.filters.length > 0) {
          queryParams.filters = params.filters;
        }

        if (params.sortId) {
          queryParams.sortId = params.sortId;
          queryParams.isAsc = params.sortIsAsc !== false;
        }

        const result = await services.mingdaoApi.getFilterRows(queryParams);

        if (result.error_code !== 1) {
          return JSON.stringify({
            success: false,
            error: `Failed to get the records. ${result.error_msg}`
          }, null, 2);
        }

        const data = result.data || {};
        const rows = data.rows || [];
        const total = data.total || 0;

        if (params.resultType === 'json') {
          const jsonResult = {
            fields,
            rows: rows.map((row: any) => getRowFieldValue(row, schema)),
            total,
            payload: {
              worksheetId: queryParams.worksheetId,
              ...(queryParams.controls && { controls: queryParams.controls }),
              ...(queryParams.filters && { filters: queryParams.filters }),
              ...(queryParams.sortId && { sortId: queryParams.sortId, isAsc: queryParams.isAsc }),
              pageSize: queryParams.pageSize,
              pageIndex: queryParams.pageIndex
            }
          };
          return JSON.stringify({ success: true, result: jsonResult }, null, 2);
        } else {
          let resultText = `Found ${total} rows in worksheet "${worksheetName}".`;
          if (total > 0) {
            const limit = queryParams.pageSize;
            resultText += ` The following are ${total < limit ? total : limit} pieces of data presented in a table format:\n\n${tableHeader}`;
            for (const row of rows) {
              const resultValues = [];
              for (const field of fields) {
                const fieldId = field.fieldId;
                const value = row[fieldId] || '';
                resultValues.push(handleValueType(value, schema[fieldId] || {}));
              }
              resultText += '\n|' + resultValues.join('|') + '|';
            }
          }
          return JSON.stringify({ success: true, result: resultText }, null, 2);
        }
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, null, 2);
      }
    }
  });

  // List Worksheets Tool
  server.addTool({
    name: "list_worksheets",
    description: "List worksheets within an application",
    parameters: z.object({
      resultType: z.enum(['table', 'json']).default('table').describe("Result type: table for table styled text, json for JSON text")
    }),
    execute: async (params) => {
      try {
        const result = await services.mingdaoApi.getAppInfo();

        if (result.error_code !== 1) {
          return JSON.stringify({
            success: false,
            error: `Failed to access the application. ${result.error_msg}`
          }, null, 2);
        }

        const data = result.data || {};
        const sections = data.sections || [];

        if (params.resultType === 'json') {
          const worksheets: any[] = [];
          for (const section of sections) {
            worksheets.push(...extractWorksheets(section, 'json', 0));
          }
          return JSON.stringify({ success: true, result: worksheets }, null, 2);
        } else {
          let worksheets = '|worksheetId|worksheetName|description|\n|---|---|---|';
          for (const section of sections) {
            worksheets += extractWorksheets(section, 'table', 0);
          }
          return JSON.stringify({ success: true, result: worksheets }, null, 2);
        }
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, null, 2);
      }
    }
  });

  // Get Worksheet Pivot Data Tool
  server.addTool({
    name: "get_worksheet_pivot_data",
    description: "Retrieve statistical pivot table data from a specified worksheet",
    parameters: z.object({
      worksheetId: z.string().describe("The ID of the specified worksheet which to get the record data"),
      xColumnFields: z.array(z.object({
        controlId: z.string().describe("Field ID"),
        displayName: z.string().describe("Display name"),
        particleSize: z.number().optional().describe("Field type is date or area, set the statistical dimension")
      })).describe("The column fields that make up the pivot table's X-axis groups"),
      yRowFields: z.array(z.object({
        controlId: z.string().describe("Field ID"),
        displayName: z.string().describe("Display name"),
        particleSize: z.number().optional().describe("Field type is date or region, set the statistical dimension")
      })).optional().describe("The row fields that make up the pivot table's Y-axis groups"),
      valueFields: z.array(z.object({
        controlId: z.string().describe("Field ID"),
        displayName: z.string().describe("Display name"),
        aggregation: z.enum(['SUM', 'AVG', 'MIN', 'MAX', 'COUNT']).describe("Aggregation method")
      })).describe("The aggregated value fields in the pivot table"),
      filters: z.array(z.object({
        controlId: z.string().describe("Field ID"),
        dataType: z.number().describe("Field type ID"),
        spliceType: z.number().describe("Condition concatenation method: 1=And, 2=Or"),
        filterType: z.number().describe("Expression type"),
        values: z.array(z.string()).optional().describe("Values in the condition"),
        value: z.string().optional().describe("Single value in the condition"),
        dateRange: z.number().optional().describe("Date range"),
        minValue: z.string().optional().describe("Minimum value for custom range"),
        maxValue: z.string().optional().describe("Maximum value for custom range"),
        isAsc: z.boolean().optional().describe("Ascending order")
      })).optional().describe(`Filter conditions array. Each filter object specifies conditions that records must meet.

      For Option-Single Choice and Option-Multiple Choices fields, get the corresponding key value from the options in the current field information via value, and pass it into values in array format. Do not use the options value of other fields as input conditions.
      For fields of type Option-Member/Option-Department/Option-Organizational Role/Option-Linked Record/Option-Region, the values parameter must be in the format of a string array like ["uuid"](uuid comes from rowid, filterType must be 24). If it is a string type value, you can pass it in using the value parameter(filterType must be 2).

      FilterTypeEnum Reference:
      1=Like(Contains), 2=Eq(Is/Equal), 3=Start(Starts With), 4=End(Ends With), 5=NotLike(Does Not Contain), 6=Ne(Is Not/Not Equal), 7=IsEmpty(Empty), 8=HasValue(Not Empty), 11=Between(Within Range), 12=NotBetween(Outside Range), 13=Gt(Greater Than), 14=Gte(Greater Than or Equal To), 15=Lt(Less Than), 16=Lte(Less Than or Equal To), 17=DateEnum(Date Is), 18=NotDateEnum(Date Is Not), 24=RCEq(Associated Field Is), 25=RCNe(Associated Field Is Not), 26=ArrEq(Array Equals), 27=ArrNe(Array Does Not Equal), 31=DateBetween(Date Within Range), 32=DateNotBetween(Date Not Within Range), 33=DateGt(Date Later Than), 34=DateGte(Date Later Than or Equal To), 35=DateLt(Date Earlier Than), 36=DateLte(Date Earlier Than or Equal To)

      DateRangeEnum Reference:
      1=Today, 2=Yesterday, 3=Tomorrow, 4=ThisWeek, 5=LastWeek, 6=NextWeek, 7=ThisMonth, 8=LastMonth, 9=NextMonth, 12=ThisQuarter, 13=LastQuarter, 14=NextQuarter, 15=ThisYear, 16=LastYear, 17=NextYear, 18=Customize, 21=Last7Day, 22=Last14Day, 23=Last30Day, 31=Next7Day, 32=Next14Day, 33=Next33Day`),
      sortFields: z.array(z.object({
        controlId: z.string().describe("Field ID used for sorting"),
        isAsc: z.boolean().describe("Sorting direction")
      })).optional().describe("The fields to used for sorting"),
      resultType: z.enum(['table', 'json']).default('table').describe("Result type: table for table styled text, json for JSON text")
    }),
    execute: async (params) => {
      try {
        const pivotData = {
          worksheetId: params.worksheetId,
          columns: params.xColumnFields,
          ...(params.yRowFields && params.yRowFields.length > 0 && { rows: params.yRowFields }),
          values: params.valueFields,
          ...(params.filters && params.filters.length > 0 && { filters: params.filters }),
          options: {
            showTotal: true,
            ...(params.sortFields && params.sortFields.length > 0 && { sort: params.sortFields })
          }
        };

        const result = await services.mingdaoApi.getPivotData(pivotData);

        // Check if the result has status property (pivot API response format)
        if ('status' in result && (result as any).status !== 1) {
          return JSON.stringify({
            success: false,
            error: (result as any).msg || 'Failed to get pivot data'
          }, null, 2);
        }

        const pivotResultData = 'data' in result ? result.data : result;

        if (params.resultType === 'table') {
          const tableResult = generatePivotTable(pivotResultData);
          return JSON.stringify({ success: true, result: tableResult }, null, 2);
        } else {
          const jsonResult = generatePivotJson(pivotResultData);
          return JSON.stringify({ success: true, result: jsonResult }, null, 2);
        }
      } catch (error) {
        return JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, null, 2);
      }
    }
  });

  // Additional Application Tools
  server.addTool({
    name: "get_app_info",
    description: "Get application information including groups, worksheets, and custom pages",
    parameters: z.object({}),
    execute: async () => {
      try {
        const result = await services.mingdaoApi.getAppInfo();
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });


  server.addTool({
    name: "get_worksheet_record_detail",
    description: "Get detailed information of a specific row record",
    parameters: z.object({
      worksheetId: z.string().describe("Worksheet ID"),
      rowId: z.string().describe("Row record ID"),
      getSystemControl: z.boolean().default(false).describe("Include system fields")
    }),
    execute: async (params) => {
      try {
        const result = await services.mingdaoApi.getRowById(
          params.worksheetId,
          params.rowId,
          params.getSystemControl
        );
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "add_worksheet_record",
    description: "Create a new row record in worksheet",
    parameters: z.object({
      worksheetId: z.string().describe("Worksheet ID"),
      controls: z.array(z.object({
        controlId: z.string().describe("Control ID"),
        value: z.string().describe("Control value")
      })).describe("Control data for the new record"),
      triggerWorkflow: z.boolean().default(true).describe("Whether to trigger workflow")
    }),
    execute: async (params) => {
      try {
        const result = await services.mingdaoApi.addRow(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "update_worksheet_record",
    description: "Update an existing row record in worksheet",
    parameters: z.object({
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
        const result = await services.mingdaoApi.updateRow(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "delete_worksheet_record",
    description: "Delete a row record from worksheet",
    parameters: z.object({
      worksheetId: z.string().describe("Worksheet ID"),
      rowId: z.string().describe("Row record ID to delete"),
      triggerWorkflow: z.boolean().default(true).describe("Whether to trigger workflow"),
      ThoroughDelete: z.boolean().default(false).describe("Whether to permanently delete (true) or logical delete (false)")
    }),
    execute: async (params) => {
      try {
        const result = await services.mingdaoApi.deleteRow(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "create_worksheet",
    description: "Create a new worksheet with specified controls",
    parameters: z.object({
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
        const result = await services.mingdaoApi.createWorksheet(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  // Batch operations
  server.addTool({
    name: "add_worksheet_records_batch",
    description: "Create multiple row records in worksheet at once",
    parameters: z.object({
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
        const result = await services.mingdaoApi.addRows(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "update_worksheet_records_batch",
    description: "Update multiple row records in worksheet at once",
    parameters: z.object({
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
        const result = await services.mingdaoApi.updateRows(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  // Additional worksheet operations
  server.addTool({
    name: "get_related_worksheet_records",
    description: "Get related records from linked worksheets",
    parameters: z.object({
      worksheetId: z.string().describe("Worksheet ID"),
      rowId: z.string().describe("Row record ID"),
      controlId: z.string().describe("Related control ID"),
      pageSize: z.number().min(1).max(1000).default(50).describe("Number of records per page"),
      pageIndex: z.number().min(1).default(1).describe("Page number")
    }),
    execute: async (params) => {
      try {
        const result = await services.mingdaoApi.getRelatedRecords(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "get_worksheet_record_share_link",
    description: "Get sharing link for a record",
    parameters: z.object({
      worksheetId: z.string().describe("Worksheet ID"),
      rowId: z.string().describe("Row record ID"),
      validTime: z.number().optional().describe("Link validity time in hours")
    }),
    execute: async (params) => {
      try {
        const result = await services.mingdaoApi.getShareLink(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "get_worksheet_record_count",
    description: "Get total number of rows in worksheet",
    parameters: z.object({
      worksheetId: z.string().describe("Worksheet ID")
    }),
    execute: async (params) => {
      try {
        const result = await services.mingdaoApi.getRowCount(params.worksheetId);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "get_worksheet_record_logs",
    description: "Get operation logs for a specific row record",
    parameters: z.object({
      worksheetId: z.string().describe("Worksheet ID"),
      rowId: z.string().describe("Row record ID"),
      pageSize: z.number().min(1).max(100).default(20).describe("Number of logs per page"),
      pageIndex: z.number().min(1).default(1).describe("Page number")
    }),
    execute: async (params) => {
      try {
        const result = await services.mingdaoApi.getRowLogs(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  // Role management tools
  server.addTool({
    name: "get_roles",
    description: "Get list of roles in the application",
    parameters: z.object({}),
    execute: async () => {
      try {
        const result = await services.mingdaoApi.getRoles();
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "create_role",
    description: "Create a new role in the application",
    parameters: z.object({
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
        const result = await services.mingdaoApi.createRole(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "delete_role",
    description: "Delete a role from the application",
    parameters: z.object({
      roleId: z.string().describe("Role ID to delete")
    }),
    execute: async (params) => {
      try {
        const result = await services.mingdaoApi.deleteRole(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "add_role_members",
    description: "Add members to a role",
    parameters: z.object({
      roleId: z.string().describe("Role ID"),
      userIds: z.array(z.string()).describe("Array of user IDs to add to the role")
    }),
    execute: async (params) => {
      try {
        const result = await services.mingdaoApi.addRoleMembers(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "remove_role_members",
    description: "Remove members from a role",
    parameters: z.object({
      roleId: z.string().describe("Role ID"),
      userIds: z.array(z.string()).describe("Array of user IDs to remove from the role")
    }),
    execute: async (params) => {
      try {
        const result = await services.mingdaoApi.removeRoleMembers(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "get_role_detail",
    description: "Get detailed information about a specific role",
    parameters: z.object({
      roleId: z.string().describe("Role ID")
    }),
    execute: async (params) => {
      try {
        const result = await services.mingdaoApi.getRoleDetail(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "exit_app",
    description: "Exit from the application",
    parameters: z.object({
      operatorId: z.string().describe("Member ID who is leaving the app.")
    }),
    execute: async (params) => {
      try {
        const result = await services.mingdaoApi.exitApp(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  // Option set management tools
  server.addTool({
    name: "create_option_set",
    description: "Create a new option set",
    parameters: z.object({
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
        const result = await services.mingdaoApi.createOptionSet(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "get_option_set",
    description: "Get option set information",
    parameters: z.object({
      optionSetId: z.string().describe("Option set ID")
    }),
    execute: async (params) => {
      try {
        const result = await services.mingdaoApi.getOptionSet(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "update_option_set",
    description: "Update an existing option set",
    parameters: z.object({
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
        const result = await services.mingdaoApi.updateOptionSet(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  server.addTool({
    name: "delete_option_set",
    description: "Delete an option set",
    parameters: z.object({
      optionSetId: z.string().describe("Option set ID to delete")
    }),
    execute: async (params) => {
      try {
        const result = await services.mingdaoApi.deleteOptionSet(params);
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });

  // Utility tools
  server.addTool({
    name: "get_area_info",
    description: "Get geographical area information",
    parameters: z.object({}),
    execute: async () => {
      try {
        const result = await services.mingdaoApi.getAreaInfo();
        return JSON.stringify(result, null, 2);
      } catch (error) {
        return JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, null, 2);
      }
    }
  });
}

// Helper function for worksheet fields processing
function getWorksheetFields(controls: any[]): { fieldsJson: any[], fieldsTable: string } {
  const fields: any[] = [];
  const fieldsTable = ['|fieldId|fieldName|fieldType|fieldTypeId|description|options|', '|---|---|---|---|---|---|'];
  
  for (const control of controls) {
    if (!control || typeof control !== 'object' || !('type' in control)) {
      continue;
    }
    
    if (getIgnoreTypes().has(control.type)) {
      continue;
    }
    
    let fieldTypeId = control.type;
    let fieldType = getFieldTypeById(control.type);
    
    if (fieldTypeId === 30) {
      const sourceControl = control.sourceControl || {};
      if (sourceControl.type && !getIgnoreTypes().has(sourceControl.type)) {
        fieldTypeId = sourceControl.type;
        fieldType = getFieldTypeById(sourceControl.type);
      } else {
        continue;
      }
    }
    
    const fieldId = control.controlId || '';
    const fieldName = control.controlName || '';
    const fieldDescription = (control.remark || '').replace(/\n/g, ' ').replace(/\t/g, '  ');
    
    const field = {
      id: fieldId,
      name: fieldName,
      type: fieldType,
      typeId: fieldTypeId,
      description: fieldDescription,
      options: extractOptions(control)
    };
    
    fields.push(field);
    fieldsTable.push(`|${field.id}|${field.name}|${field.type}|${field.typeId}|${field.description}|${field.options ? JSON.stringify(field.options) : ''}|`);
  }
  
  // Add system fields
  fields.push({
    id: 'ctime',
    name: 'Created Time',
    type: getFieldTypeById(16),
    typeId: 16,
    description: '',
    options: []
  });
  fieldsTable.push('|ctime|Created Time|Date|16|||');
  
  return {
    fieldsJson: fields,
    fieldsTable: fieldsTable.join('\n')
  };
}

function getFieldTypeById(fieldTypeId: number): string {
  const fieldTypeMap: { [key: number]: string } = {
    2: "Text", 3: "Text-Phone", 4: "Text-Phone", 5: "Text-Email", 6: "Number", 7: "Text", 8: "Number",
    9: "Option-Single Choice", 10: "Option-Multiple Choices", 11: "Option-Single Choice", 15: "Date", 16: "Date",
    24: "Option-Region", 25: "Text", 26: "Option-Member", 27: "Option-Department", 28: "Number",
    29: "Option-Linked Record", 30: "Unknown Type", 31: "Number", 32: "Text", 33: "Text",
    35: "Option-Linked Record", 36: "Number-Yes1/No0", 37: "Number", 38: "Date", 40: "Location",
    41: "Text", 46: "Time", 48: "Option-Organizational Role", 50: "Text", 51: "Query Record"
  };
  return fieldTypeMap[fieldTypeId] || '';
}

function getIgnoreTypes(): Set<number> {
  return new Set([14, 21, 22, 34, 42, 43, 45, 47, 49, 10010]);
}

function extractOptions(control: any): any[] {
  const options: any[] = [];
  
  if (!control || typeof control !== 'object' || !('type' in control)) {
    return options;
  }
  
  const controlType = control.type;
  
  if ([9, 10, 11].includes(controlType)) {
    const controlOptions = control.options || [];
    if (Array.isArray(controlOptions)) {
      options.push(...controlOptions.filter((opt: any) => 
        opt && typeof opt === 'object' && 'key' in opt && 'value' in opt
      ).map((opt: any) => ({ key: opt.key, value: opt.value })));
    }
  } else if ([28, 36].includes(controlType)) {
    const advancedSetting = control.advancedSetting || {};
    const itemnames = advancedSetting.itemnames || '';
    if (typeof itemnames === 'string' && itemnames.startsWith('[{')) {
      try {
        const parsed = JSON.parse(itemnames);
        if (Array.isArray(parsed)) {
          options.push(...parsed);
        }
      } catch (e) {
        // Ignore JSON parse errors
      }
    }
  } else if ([29, 35].includes(controlType)) {
    const dataSource = control.dataSource || '';
    if (typeof dataSource === 'string' && dataSource) {
      options.push({ source_worksheet_id: dataSource });
    }
  } else if (controlType === 30) {
    const sourceControl = control.sourceControl || {};
    if (sourceControl.type && !getIgnoreTypes().has(sourceControl.type)) {
      const controlOptions = control.options || [];
      if (Array.isArray(controlOptions)) {
        options.push(...controlOptions.filter((opt: any) => 
          opt && typeof opt === 'object' && 'key' in opt && 'value' in opt
        ).map((opt: any) => ({ key: opt.key, value: opt.value })));
      }
    }
  }
  
  return options;
}

// Helper functions for list worksheet records
function getRecordSchema(controls: any[], fieldIds?: string): { fields: any[], schema: any, tableHeader: string } {
  const allowFields = fieldIds ? new Set(fieldIds.split(',').map(id => id.trim()).filter(id => id)) : new Set();
  const fields: any[] = [];
  const schema: any = {};
  const fieldNames: string[] = [];

  for (const control of controls) {
    const controlId = control.controlId || '';
    const controlName = control.controlName || '';
    if (!controlId || !controlName) continue;

    const controlTypeId = getRealTypeId(control);
    if (getIgnoreTypes().has(controlTypeId) || (allowFields.size > 0 && !allowFields.has(controlId))) {
      continue;
    }

    fields.push({ fieldId: controlId, fieldName: controlName });
    schema[controlId] = { typeId: controlTypeId, options: setOption(control) };
    fieldNames.push(controlName);
  }

  if (allowFields.size === 0 || allowFields.has('ctime')) {
    fields.push({ fieldId: 'ctime', fieldName: 'Created Time' });
    schema['ctime'] = { typeId: 16, options: {} };
    fieldNames.push('Created Time');
  }

  fields.push({ fieldId: 'rowid', fieldName: 'Record Row ID' });
  schema['rowid'] = { typeId: 2, options: {} };
  fieldNames.push('Record Row ID');

  const tableHeader = '|' + fieldNames.join('|') + '|\n|' + Array(fieldNames.length).fill('---').join('|') + '|';

  return { fields, schema, tableHeader };
}

function getRealTypeId(control: any): number {
  const controlType = control.type || 0;
  if (controlType === 30) {
    return control.sourceControlType || controlType;
  }
  return controlType;
}

function setOption(control: any): any {
  const options: any = {};
  if (control.options) {
    for (const option of control.options) {
      const key = option.key || '';
      const value = option.value || '';
      if (key) {
        options[key] = value;
      }
    }
  } else if (control.advancedSetting?.itemnames) {
    try {
      const itemnames = JSON.parse(control.advancedSetting.itemnames);
      for (const item of itemnames) {
        const key = item.key || '';
        const value = item.value || '';
        if (key) {
          options[key] = value;
        }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }
  return options;
}

function getRowFieldValue(row: any, schema: any): any {
  const rowValue: any = { rowid: row.rowid || '' };
  for (const field in schema) {
    rowValue[field] = handleValueType(row[field] || '', schema[field] || {});
  }
  return rowValue;
}

function handleValueType(value: any, field: any): string {
  const typeId = field.typeId;
  if (typeId === 10) {
    value = typeof value === 'string' ? value : Array.isArray(value) ? value.join('、') : String(value);
  } else if ([28, 36].includes(typeId)) {
    value = field.options?.[value] || value;
  } else if ([26, 27, 48, 14].includes(typeId)) {
    value = processValue(value);
  } else if ([35, 29].includes(typeId)) {
    value = parseCascadeOrAssociated(field, value);
  } else if (typeId === 40) {
    value = parseLocation(value);
  }
  return richTextToPlainText(value) || '';
}

function processValue(value: any): string {
  if (typeof value === 'string') {
    if (value.startsWith('[{"accountId"')) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => item.fullname || '').join(', ');
        }
      } catch (e) {
        return '';
      }
    } else if (value.startsWith('[{"departmentId"')) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => item.departmentName || '').join('、');
        }
      } catch (e) {
        return '';
      }
    } else if (value.startsWith('[{"organizeId"')) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => item.organizeName || '').join('、');
        }
      } catch (e) {
        return '';
      }
    } else if (value.startsWith('[{"file_id"') || value === '[]') {
      return '';
    }
  } else if (value && typeof value === 'object' && 'accountId' in value) {
    return value.fullname || String(value);
  }
  return String(value);
}

function parseCascadeOrAssociated(field: any, value: any): string {
  const typeId = field.typeId;
  if (!value || typeof value !== 'string') return '';

  if ((typeId === 35 && value.startsWith('[')) || (typeId === 29 && value.startsWith('[{'))) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const firstItem = parsed[0];
        if (firstItem && typeof firstItem === 'object') {
          return firstItem.name || '';
        }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }
  return '';
}

function parseLocation(value: any): string {
  if (typeof value === 'string' && value.length > 10) {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') {
        return parsed.address || '';
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }
  return '';
}

function richTextToPlainText(richText: any): string {
  if (!richText) return '';
  if (typeof richText !== 'string') richText = String(richText);
  const text = richText.includes('<') ? richText.replace(/<[^>]+>/g, '') : richText;
  return text.replace(/\|/g, '▏').replace(/\n/g, ' ');
}

// Helper functions for list worksheets
function extractWorksheets(section: any, type: string, depth: number = 0): any[] | string {
  // Prevent infinite recursion
  if (depth > 10) {
    return type === 'json' ? [] : '';
  }

  const items: any[] = [];
  let tables = '';

  for (const item of section.items || []) {
    const itemType = item.type;
    const itemNotes = item.notes || '';

    // Only include worksheets (type 0) that are not marked as 'NO'
    if (itemType === 0 && itemNotes !== 'NO') {
      if (type === 'json') {
        const itemId = item.id || '';
        const itemName = item.name || '';
        if (itemId && itemName) {
          items.push({
            id: itemId,
            name: itemName,
            notes: itemNotes
          });
        }
      } else {
        const itemId = item.id || '';
        const itemName = item.name || '';
        if (itemId && itemName) {
          const safeId = safeString(itemId);
          const safeName = safeString(itemName);
          const safeNotes = safeString(itemNotes);
          tables += `\n|${safeId}|${safeName}|${safeNotes}|`;
        }
      }
    }
  }

  // Recursively process child sections
  for (const childSection of section.childSections || []) {
    if (type === 'json') {
      const childItems = extractWorksheets(childSection, 'json', depth + 1);
      items.push(...(childItems as any[]));
    } else {
      const childTables = extractWorksheets(childSection, 'table', depth + 1);
      tables += childTables as string;
    }
  }

  return type === 'json' ? items : tables;
}

function safeString(text: any): string {
  if (text == null) return '';
  text = String(text);
  // Replace characters that could break table format
  return text.replace(/\|/g, '▏').replace(/\n/g, ' ').replace(/\r/g, ' ').trim();
}

// Helper functions for pivot data processing
function generatePivotTable(data: any): string {
  if (!data) {
    return "|No data available|";
  }

  const metadata = data.metadata || {};
  const columns = metadata.columns || [];
  const rows = metadata.rows || [];
  const values = metadata.values || [];
  const rowsData = data.data || [];

  const header = [
    ...(rows.map((row: any) => row.displayName || '')),
    ...(columns.map((column: any) => column.displayName || '')),
    ...(values.map((value: any) => value.displayName || ''))
  ];

  const line = [
    ...Array(rows.length).fill('---'),
    ...Array(columns.length).fill('---'),
    ...Array(values.length).fill('--:')
  ];

  const table = [header, line];

  for (const row of rowsData) {
    const rowData = [];

    // Add row values
    for (const r of rows) {
      const key = r.controlId + (r.particleSize ? `-${r.particleSize}` : '');
      const value = row.rows?.[key] || '';
      rowData.push(replacePipe(String(value)));
    }

    // Add column values
    for (const c of columns) {
      const key = c.controlId + (c.particleSize ? `-${c.particleSize}` : '');
      const value = row.columns?.[key] || '';
      rowData.push(replacePipe(String(value)));
    }

    // Add value calculations
    for (const v of values) {
      const value = row.values?.[v.controlId] || '';
      rowData.push(replacePipe(String(value)));
    }

    table.push(rowData);
  }

  return table.map(row => '|' + row.join('|') + '|').join('\n');
}

function generatePivotJson(data: any): any {
  if (!data) {
    return { fields: { "x-axis": [], "y-axis": [], values: [] }, rows: [], summary: {} };
  }

  const metadata = data.metadata || {};
  const columns = metadata.columns || [];
  const rows = metadata.rows || [];
  const values = metadata.values || [];

  const fields = {
    "x-axis": columns.map((column: any) => ({
      fieldId: column.controlId || "",
      fieldName: column.displayName || ""
    })),
    "y-axis": rows.map((row: any) => ({
      fieldId: row.controlId || "",
      fieldName: row.displayName || ""
    })),
    values: values.map((value: any) => ({
      fieldId: value.controlId || "",
      fieldName: value.displayName || ""
    }))
  };

  const rowsData = [];
  const dataRows = data.data || [];

  for (const row of dataRows) {
    const rowData = { ...(row.rows || {}), ...(row.columns || {}), ...(row.values || {}) };
    rowsData.push(rowData);
  }

  return {
    fields,
    rows: rowsData,
    summary: metadata.totalRow || {}
  };
}

function replacePipe(text: string): string {
  if (!text) return '';
  return String(text).replace(/\|/g, '▏').replace(/\n/g, ' ');
}
