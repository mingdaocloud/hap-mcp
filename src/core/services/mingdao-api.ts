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

  constructor() {
    this.baseUrl = 'https://api.mingdao.com';
  }

  private getApiConfig(): MingdaoApiConfig {
    const appKey = process.env.MINGDAO_APP_KEY;
    const sign = process.env.MINGDAO_SIGN;
    const host = process.env.MINGDAO_HOST;

    if (!appKey || !sign) {
      throw new Error('MINGDAO_APP_KEY and MINGDAO_SIGN environment variables are required');
    }

    return {
      appKey,
      sign,
      ...(host && { host })
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    data?: any
  ): Promise<ApiResponse<T>> {
    const apiConfig = this.getApiConfig();

    // Determine the base URL based on host configuration
    let baseUrl = this.baseUrl;
    if (apiConfig.host) {
      // Remove trailing slash from host if present
      const cleanHost = apiConfig.host.replace(/\/$/, '');
      baseUrl = `${cleanHost}/api`;
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
  async getAppInfo(): Promise<ApiResponse> {
    return this.makeRequest('/v1/open/app/get', 'GET', {});
  }

  // Worksheet APIs
  async createWorksheet(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/addWorksheet', 'POST', data);
  }

  async getWorksheetInfo(worksheetId: string): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/getWorksheetInfo', 'POST', { worksheetId });
  }

  async getFilterRows(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/getFilterRows', 'POST', data);
  }

  async addRow(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/addRow', 'POST', data);
  }

  async getRowById(worksheetId: string, rowId: string, getSystemControl: boolean = false): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/getRowById', 'GET', {
      worksheetId,
      rowId,
      getSystemControl: getSystemControl.toString(),
    });
  }

  async updateRow(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/editRow', 'POST', data);
  }

  async deleteRow(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/deleteRow', 'POST', data);
  }

  // Batch operations
  async addRows(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/addRows', 'POST', data);
  }

  async updateRows(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/editRows', 'POST', data);
  }

  // Additional worksheet operations
  async getRelatedRecords(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/getRelationRows', 'POST', data);
  }

  async getShareLink(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/getRowShareUrl', 'POST', data);
  }

  async getRowCount(worksheetId: string): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/getRowsCount', 'POST', { worksheetId });
  }

  async getRowLogs(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/worksheet/getRowLogs', 'POST', data);
  }

  // Role management APIs
  async getRoles(): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/role/list', 'POST', {});
  }

  async createRole(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/role/add', 'POST', data);
  }

  async deleteRole(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/role/delete', 'POST', data);
  }

  async addRoleMembers(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/role/addMembers', 'POST', data);
  }

  async removeRoleMembers(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/role/removeMembers', 'POST', data);
  }

  async exitApp(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/role/quit', 'POST', data);
  }

  async getRoleDetail(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/role/get', 'POST', data);
  }

  // Option set APIs
  async createOptionSet(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/optionSet/add', 'POST', data);
  }

  async getOptionSet(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/optionSet/get', 'POST', data);
  }

  async updateOptionSet(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/optionSet/edit', 'POST', data);
  }

  async deleteOptionSet(data: any): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/optionSet/delete', 'POST', data);
  }

  // Report APIs
  async getPivotData(data: any): Promise<ApiResponse> {
    // Use api2.mingdao.com for pivot data API
    const apiConfig = this.getApiConfig();
    const host = apiConfig.host || 'https://api2.mingdao.com';
    const baseUrl = host.endsWith('/') ? host.slice(0, -1) : host;
    const url = `${baseUrl}/api/report/getPivotData`;

    const payload = {
      appKey: apiConfig.appKey,
      sign: apiConfig.sign,
      ...data
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get pivot data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Utility APIs
  async getAreaInfo(): Promise<ApiResponse> {
    return this.makeRequest('/v2/open/area/get', 'POST', {});
  }
}

export const mingdaoApi = new MingdaoApiService();
