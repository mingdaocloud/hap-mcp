/**
 * MingdaoAI API Service
 * Handles all API calls to Mingdao platform
 */

export interface MingdaoApiConfig {
  appKey: string;
  sign: string;
  host?: string;
  baseUrl?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  code?: number;
  error_code?: number;
  msg?: string;
  error_msg?: string;
  data?: T;
}

export class MingdaoApiService {
  private baseUrl: string;

  constructor(private config?: MingdaoApiConfig) {
    this.baseUrl = config?.baseUrl || 'https://api.mingdao.com';
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    data?: any,
    config?: MingdaoApiConfig
  ): Promise<ApiResponse<T>> {
    const apiConfig = config || this.config;

    if (!apiConfig?.appKey || !apiConfig?.sign) {
      throw new Error('AppKey and Sign are required for API calls');
    }

    // Determine the base URL based on host configuration
    let baseUrl = this.baseUrl;
    if (apiConfig.host) {
      // Remove trailing slash from host if present
      const cleanHost = apiConfig.host.replace(/\/$/, '');
      baseUrl = `${cleanHost}/api`;
    } else if (apiConfig.baseUrl) {
      baseUrl = apiConfig.baseUrl;
    }

    const url = `${baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    let requestData: any = data || {};
    
    if (method === 'POST') {
      requestData = {
        ...requestData,
        appKey: apiConfig.appKey,
        sign: apiConfig.sign,
      };
    }

    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if (method === 'GET') {
      const params = new URLSearchParams({
        appKey: apiConfig.appKey,
        sign: apiConfig.sign,
        ...data,
      });
      requestOptions.method = 'GET';
      const finalUrl = `${url}?${params.toString()}`;
      
      const response = await fetch(finalUrl, requestOptions);
      return await response.json();
    } else {
      requestOptions.body = JSON.stringify(requestData);
      const response = await fetch(url, requestOptions);
      return await response.json();
    }
  }

  // Application APIs
  async getAppInfo(config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v1/open/app/get', 'GET', {}, config);
  }

  // Worksheet APIs
  async createWorksheet(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/addWorksheet', 'POST', data, config);
  }

  async getWorksheetInfo(worksheetId: string, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/getWorksheetInfo', 'POST', { worksheetId }, config);
  }

  async getFilterRows(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/getFilterRows', 'POST', data, config);
  }

  async addRow(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/addRow', 'POST', data, config);
  }

  async getRowById(worksheetId: string, rowId: string, getSystemControl: boolean = false, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/getRowById', 'GET', {
      worksheetId,
      rowId,
      getSystemControl: getSystemControl.toString(),
    }, config);
  }

  async updateRow(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/editRow', 'POST', data, config);
  }

  async deleteRow(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/deleteRow', 'POST', data, config);
  }

  // Batch operations
  async addRows(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/addRows', 'POST', data, config);
  }

  async updateRows(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/editRows', 'POST', data, config);
  }

  // Additional worksheet operations
  async getRelatedRecords(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/getRelationRows', 'POST', data, config);
  }

  async getShareLink(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/getRowShareUrl', 'POST', data, config);
  }

  async getRowCount(worksheetId: string, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/getRowsCount', 'POST', { worksheetId }, config);
  }

  async getRowLogs(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/getRowLogs', 'POST', data, config);
  }

  // Role management APIs
  async getRoles(config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/role/list', 'POST', {}, config);
  }

  async createRole(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/role/add', 'POST', data, config);
  }

  async deleteRole(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/role/delete', 'POST', data, config);
  }

  async addRoleMembers(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/role/addMembers', 'POST', data, config);
  }

  async removeRoleMembers(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/role/removeMembers', 'POST', data, config);
  }

  async exitApp(config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/role/quit', 'POST', {}, config);
  }

  async getRoleDetail(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/role/get', 'POST', data, config);
  }

  // Option set APIs
  async createOptionSet(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/optionSet/add', 'POST', data, config);
  }

  async getOptionSet(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/optionSet/get', 'POST', data, config);
  }

  async updateOptionSet(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/optionSet/edit', 'POST', data, config);
  }

  async deleteOptionSet(data: any, config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/optionSet/delete', 'POST', data, config);
  }

  // Utility APIs
  async getAreaInfo(config: MingdaoApiConfig): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/area/get', 'POST', {}, config);
  }
}

export const mingdaoApi = new MingdaoApiService();
