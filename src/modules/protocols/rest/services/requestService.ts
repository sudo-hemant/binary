import { httpClient, type ApiResponse } from '@/services/httpClient';
import { 
  validateRequestUrlAndMethod, 
  parseRequestBodyByType,
  processKeyValuePairs 
} from '@/services/helpers/httpRequestValidator.helper';
import type { QueryParam, Header, RequestBody } from '../store/restSlice';
import type { ErrorResponse } from '../types/error';

/**
 * Result type for executeHttpRequest - either success or error
 */
export type RequestResult = 
  | { success: true; response: ApiResponse; error: null }
  | { success: false; response: null; error: ErrorResponse };

/**
 * Create standardized error response from any error
 */
const createErrorResponse = (error: unknown): ErrorResponse => {
  if (error instanceof Error) {
    // Check if it's a CORS error or blocked by browser/devtools
    if (error.message.includes('CORS') || 
        error.message.includes('Cross-Origin') ||
        error.message.includes('blocked by CORS') ||
        error.message.includes('ERR_BLOCKED_BY_CLIENT') ||
        error.message.includes('ERR_BLOCKED_BY_RESPONSE') ||
        error.message.includes('net::ERR_BLOCKED_BY_CLIENT')) {
      return {
        type: 'cors',
        message: 'Request Blocked: CORS or Browser Policy',
        details: { 
          originalError: error.message,
          suggestion: 'This request was blocked by CORS policy or browser extensions (like ad blockers). Check browser console for details or try disabling extensions.'
        },
        timestamp: Date.now()
      };
    }
    // Check if it's a DNS resolution error
    else if (error.message.includes('ERR_NAME_NOT_RESOLVED') ||
              error.message.includes('ENOTFOUND')) {
      return {
        type: 'network',
        message: 'DNS Error: Domain name could not be resolved',
        details: { 
          originalError: error.message,
          suggestion: 'Check if the domain name is spelled correctly and exists. Try using a complete URL like https://jsonplaceholder.typicode.com'
        },
        timestamp: Date.now()
      };
    }
    // Check if it's a network error
    else if (error.message.includes('Network Error') || 
              error.message.includes('ERR_NETWORK') ||
              error.message.includes('ECONNREFUSED') ||
              error.message.includes('ECONNRESET')) {
      return {
        type: 'network',
        message: 'Network Error: Unable to connect to the server',
        details: { 
          originalError: error.message,
          suggestion: 'Check your internet connection and verify the server URL.'
        },
        timestamp: Date.now()
      };
    }
    // Check if it's a timeout error
    else if (error.message.includes('timeout') || 
              error.message.includes('ETIMEDOUT') ||
              error.message.includes('ECONNABORTED')) {
      return {
        type: 'timeout',
        message: 'Request timed out',
        details: {
          suggestion: 'The server is taking too long to respond. Try again or increase the timeout.'
        },
        timestamp: Date.now()
      };
    }
    // Default error
    else {
      return {
        type: 'unknown',
        message: error.message || 'An unexpected error occurred',
        timestamp: Date.now()
      };
    }
  } else {
    return {
      type: 'unknown',
      message: 'An unexpected error occurred',
      originalError: error,
      timestamp: Date.now()
    };
  }
};

/**
 * Process HTTP response status codes and create appropriate error responses
 */
const processHttpStatus = (response: ApiResponse): RequestResult => {
  const statusCode = response.status;
  
  switch (true) {
    // Status 0 - Usually network/connection issues
    case statusCode === 0:
      return {
        success: false,
        response: null,
        error: {
          type: 'network',
          message: 'Network Error: No response received from server',
          status: statusCode,
          statusText: response.statusText || 'No Response',
          details: 'This usually indicates a network connectivity issue, CORS error, or the server is unreachable.',
          timestamp: Date.now()
        }
      };

    // 1xx Informational responses
    case statusCode >= 100 && statusCode < 200:
      return {
        success: true,
        response,
        error: null
      };

    // 2xx Success responses
    case statusCode >= 200 && statusCode < 300:
      return {
        success: true,
        response,
        error: null
      };

    // 3xx Redirection responses
    case statusCode >= 300 && statusCode < 400:
      switch (statusCode) {
        case 301:
          return {
            success: false,
            response: null,
            error: {
              type: 'http_redirection',
              message: 'HTTP 301: Moved Permanently',
              status: statusCode,
              statusText: response.statusText,
              details: 'The resource has been moved permanently. Update your URL.',
              timestamp: Date.now()
            }
          };
        case 302:
          return {
            success: false,
            response: null,
            error: {
              type: 'http_redirection',
              message: 'HTTP 302: Found (Temporary Redirect)',
              status: statusCode,
              statusText: response.statusText,
              details: 'The resource has been temporarily moved.',
              timestamp: Date.now()
            }
          };
        case 304:
          return {
            success: true,
            response,
            error: null
          };
        default:
          return {
            success: false,
            response: null,
            error: {
              type: 'http_redirection',
              message: `HTTP ${statusCode}: ${response.statusText}`,
              status: statusCode,
              statusText: response.statusText,
              details: 'Redirection response received.',
              timestamp: Date.now()
            }
          };
      }

    // 4xx Client error responses
    case statusCode >= 400 && statusCode < 500:
      switch (statusCode) {
        case 400:
          return {
            success: false,
            response: null,
            error: {
              type: 'http_client',
              message: 'HTTP 400: Bad Request',
              status: statusCode,
              statusText: response.statusText,
              details: response.data || 'The request was malformed or invalid.',
              timestamp: Date.now()
            }
          };
        case 401:
          return {
            success: false,
            response: null,
            error: {
              type: 'http_client',
              message: 'HTTP 401: Unauthorized',
              status: statusCode,
              statusText: response.statusText,
              details: response.data || 'Authentication is required to access this resource.',
              timestamp: Date.now()
            }
          };
        case 403:
          return {
            success: false,
            response: null,
            error: {
              type: 'http_client',
              message: 'HTTP 403: Forbidden',
              status: statusCode,
              statusText: response.statusText,
              details: response.data || 'You do not have permission to access this resource.',
              timestamp: Date.now()
            }
          };
        case 404:
          return {
            success: false,
            response: null,
            error: {
              type: 'http_client',
              message: 'HTTP 404: Not Found',
              status: statusCode,
              statusText: response.statusText,
              details: response.data || 'The requested resource was not found.',
              timestamp: Date.now()
            }
          };
        case 405:
          return {
            success: false,
            response: null,
            error: {
              type: 'http_client',
              message: 'HTTP 405: Method Not Allowed',
              status: statusCode,
              statusText: response.statusText,
              details: response.data || 'The HTTP method is not allowed for this resource.',
              timestamp: Date.now()
            }
          };
        case 408:
          return {
            success: false,
            response: null,
            error: {
              type: 'timeout',
              message: 'HTTP 408: Request Timeout',
              status: statusCode,
              statusText: response.statusText,
              details: response.data || 'The server timed out waiting for the request.',
              timestamp: Date.now()
            }
          };
        case 429:
          return {
            success: false,
            response: null,
            error: {
              type: 'http_client',
              message: 'HTTP 429: Too Many Requests',
              status: statusCode,
              statusText: response.statusText,
              details: response.data || 'Rate limit exceeded. Please wait before making more requests.',
              timestamp: Date.now()
            }
          };
        default:
          return {
            success: false,
            response: null,
            error: {
              type: 'http_client',
              message: `HTTP ${statusCode}: ${response.statusText}`,
              status: statusCode,
              statusText: response.statusText,
              details: response.data || 'Client error occurred.',
              timestamp: Date.now()
            }
          };
      }

    // 5xx Server error responses
    case statusCode >= 500 && statusCode < 600:
      switch (statusCode) {
        case 500:
          return {
            success: false,
            response: null,
            error: {
              type: 'http_server',
              message: 'HTTP 500: Internal Server Error',
              status: statusCode,
              statusText: response.statusText,
              details: response.data || 'The server encountered an unexpected condition.',
              timestamp: Date.now()
            }
          };
        case 502:
          return {
            success: false,
            response: null,
            error: {
              type: 'http_server',
              message: 'HTTP 502: Bad Gateway',
              status: statusCode,
              statusText: response.statusText,
              details: response.data || 'The server received an invalid response from an upstream server.',
              timestamp: Date.now()
            }
          };
        case 503:
          return {
            success: false,
            response: null,
            error: {
              type: 'http_server',
              message: 'HTTP 503: Service Unavailable',
              status: statusCode,
              statusText: response.statusText,
              details: response.data || 'The server is temporarily unavailable.',
              timestamp: Date.now()
            }
          };
        case 504:
          return {
            success: false,
            response: null,
            error: {
              type: 'timeout',
              message: 'HTTP 504: Gateway Timeout',
              status: statusCode,
              statusText: response.statusText,
              details: response.data || 'The server did not receive a timely response from an upstream server.',
              timestamp: Date.now()
            }
          };
        default:
          return {
            success: false,
            response: null,
            error: {
              type: 'http_server',
              message: `HTTP ${statusCode}: ${response.statusText}`,
              status: statusCode,
              statusText: response.statusText,
              details: response.data || 'Server error occurred.',
              timestamp: Date.now()
            }
          };
      }

    // Default case for any other status codes
    default:
      return {
        success: false,
        response: null,
        error: {
          type: 'unknown',
          message: `HTTP ${statusCode}: ${response.statusText}`,
          status: statusCode,
          statusText: response.statusText,
          details: response.data || 'Unknown status code received.',
          timestamp: Date.now()
        }
      };
  }
};

/**
 * Execute raw HTTP request - internal function
 */
const executeRawRequest = async (
  url: string,
  method: string,
  requestBody: unknown,
  processedParams: Record<string, string>,
  processedHeaders: Record<string, string>
): Promise<ApiResponse> => {
  const config = {
    params: processedParams,
    headers: processedHeaders,
  };

  const methodUpper = method.toUpperCase();
  
  switch (methodUpper) {
    case 'GET':
      return await httpClient.get(url, config);
    
    case 'POST':
      return await httpClient.post(url, requestBody, config);
    
    case 'PUT':
      return await httpClient.put(url, requestBody, config);
    
    case 'PATCH':
      return await httpClient.patch(url, requestBody, config);
    
    case 'DELETE':
      return await httpClient.delete(url, config);
    
    case 'HEAD':
      return await httpClient.head(url, config);
    
    case 'OPTIONS':
      return await httpClient.options(url, config);
    
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
};

/**
 * Execute HTTP request with validation and error handling
 */
export const executeHttpRequest = async (
  url: string,
  method: string,
  params: QueryParam[],
  headers: Header[],
  body: RequestBody
): Promise<RequestResult> => {
  try {
    // Validate request first
    const validation = validateRequestUrlAndMethod(url, method);
    if (!validation.isValid) {
      return {
        success: false,
        response: null,
        error: {
          type: 'validation',
          message: validation.errors.join(', '),
          validationErrors: validation.errors,
          timestamp: Date.now()
        }
      };
    }

    // Process body
    let requestBody;
    try {
      requestBody = parseRequestBodyByType(body);
    } catch (error) {
      return {
        success: false,
        response: null,
        error: {
          type: 'validation',
          message: error instanceof Error ? error.message : 'Invalid request body format',
          timestamp: Date.now()
        }
      };
    }

    // Process params and headers
    const processedParams = processKeyValuePairs(params);
    const processedHeaders = processKeyValuePairs(headers);
    
    // Execute the actual HTTP request
    const response = await executeRawRequest(
      url, 
      method, 
      requestBody, 
      processedParams, 
      processedHeaders
    );
    
    // Process HTTP status codes using the dedicated function
    return processHttpStatus(response);
    
  } catch (error) {
    return {
      success: false,
      response: null,
      error: createErrorResponse(error)
    };
  }
};