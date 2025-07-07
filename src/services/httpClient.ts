import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig 
} from 'axios';

export interface ApiResponse<T = any> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  duration: number;
  timestamp: number;
  url: string;
}

export interface RequestConfig extends AxiosRequestConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class HttpClient {
  private axiosInstance: AxiosInstance;
  private requestStartTimes: Map<string, number> = new Map();

  constructor(baseURL?: string, timeout: number = 30000) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout,
      // headers: {
      //   'Content-Type': 'application/json',
      // },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Record start time for duration calculation
        const requestId = this.generateRequestId(config);
        this.requestStartTimes.set(requestId, Date.now());

        // Log request (optional)
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
        
        return config;
      },
      (error: AxiosError) => {
        console.log('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Calculate duration
        const requestId = this.generateRequestId(response.config);
        const startTime = this.requestStartTimes.get(requestId) || Date.now();
        const duration = Date.now() - startTime;
        this.requestStartTimes.delete(requestId);

        // Log response
        console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`);

        return response;
      },
      (error: AxiosError) => {
        // Calculate duration for failed requests
        if (error.config) {
          const requestId = this.generateRequestId(error.config);
          const startTime = this.requestStartTimes.get(requestId) || Date.now();
          const duration = Date.now() - startTime;
          this.requestStartTimes.delete(requestId);

          console.log(`❌ ${error.response?.status || 'ERR'} ${error.config.method?.toUpperCase()} ${error.config.url} (${duration}ms)`);
        }

        return Promise.reject(error);
      }
    );
  }

  private generateRequestId(config: any): string {
    return `${config.method}-${config.url}-${Date.now()}`;
  }

  private async executeRequest<T = any>(
    method: string,
    url: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    
    try {
      const response = await this.axiosInstance.request<T>({
        method,
        url,
        ...config,
      });

      const duration = Date.now() - startTime;

      // Convert Axios headers to plain object
      const headers: Record<string, string> = {};
      Object.entries(response.headers).forEach(([key, value]) => {
        headers[key] = String(value);
      });

      return {
        status: response.status,
        statusText: response.statusText,
        headers,
        data: response.data,
        duration,
        timestamp: Date.now(),
        url: response.config.url || url,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (axios.isAxiosError(error)) {
        const headers: Record<string, string> = {};
        if (error.response?.headers) {
          Object.entries(error.response.headers).forEach(([key, value]) => {
            headers[key] = String(value);
          });
        }

        return {
          status: error.response?.status || 0,
          statusText: error.response?.statusText || error.message,
          headers,
          data: error.response?.data || null,
          duration,
          timestamp: Date.now(),
          url: error.config?.url || url,
        };
      }

      // Handle non-Axios errors
      throw new Error(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>('GET', url, config);
  }

  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>('POST', url, { ...config, data });
  }

  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>('PUT', url, { ...config, data });
  }

  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>('PATCH', url, { ...config, data });
  }

  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>('DELETE', url, config);
  }

  async head<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>('HEAD', url, config);
  }

  async options<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>('OPTIONS', url, config);
  }

  // Generic method for any HTTP method
  async request<T = any>(method: string, url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(method.toUpperCase(), url, config);
  }

  // Utility methods
  setDefaultHeader(key: string, value: string): void {
    this.axiosInstance.defaults.headers.common[key] = value;
  }

  removeDefaultHeader(key: string): void {
    delete this.axiosInstance.defaults.headers.common[key];
  }

  setBaseURL(baseURL: string): void {
    this.axiosInstance.defaults.baseURL = baseURL;
  }

  setTimeout(timeout: number): void {
    this.axiosInstance.defaults.timeout = timeout;
  }

  // Add custom interceptors
  addRequestInterceptor(
    onFulfilled?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
    onRejected?: (error: any) => any
  ): number {
    return this.axiosInstance.interceptors.request.use(onFulfilled, onRejected);
  }

  addResponseInterceptor(
    onFulfilled?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
    onRejected?: (error: any) => any
  ): number {
    return this.axiosInstance.interceptors.response.use(onFulfilled, onRejected);
  }

  // Remove interceptors
  removeRequestInterceptor(interceptorId: number): void {
    this.axiosInstance.interceptors.request.eject(interceptorId);
  }

  removeResponseInterceptor(interceptorId: number): void {
    this.axiosInstance.interceptors.response.eject(interceptorId);
  }

  // Get underlying Axios instance for advanced usage
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Create and export a default instance
export const httpClient = new HttpClient();

// Export class for creating custom instances
export default HttpClient;