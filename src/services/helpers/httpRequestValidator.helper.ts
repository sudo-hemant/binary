import type { RequestBody, QueryParam, Header } from '@/modules/protocols/rest/store/restSlice';

/**
 * Allowed HTTP methods
 */
const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const;

/**
 * Validate request URL and HTTP method
 */
export const validateRequestUrlAndMethod = (
  url: string,
  method: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate URL
  if (!url) {
    errors.push('URL is required');
  }

  // Validate method
  if (!method) {
    errors.push('HTTP method is required');
  } else if (!ALLOWED_METHODS.includes(method.toUpperCase() as any)) {
    errors.push(`Invalid HTTP method: ${method}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Parse request body based on content type
 * @throws Error if JSON parsing fails for JSON type
 */
export const parseRequestBodyByType = (body: RequestBody): unknown => {
  if (!body.content.raw) return undefined;
  
  switch (body.type) {
    case 'none':
      return undefined;

    case 'json':
      try {
        return JSON.parse(body.content.raw);
      } catch {
        throw new Error('Invalid JSON format in request body');
      }
      
    case 'text':
      return body.content.raw;

    // Future body types can be added here
    // case 'form-data':
    //   return parseFormData(body.content.raw);
    // case 'xml':
    //   return body.content.raw;
    // case 'binary':
    //   return parseBinary(body.content.raw);
      
    default:
      return body.content.raw;
  }
};

/**
 * Convert key-value pairs to object, filtering by enabled status
 * Works for both headers and query parameters
 */
export const processKeyValuePairs = (
  items: Array<QueryParam | Header>
): Record<string, string> => {
  const result: Record<string, string> = {};
  
  items.forEach((item) => {
    // TODO: CHECK WHAT TO DO IN CASE WHEN VALUE IS MISSING - do we pass empty value or ignore ?
    if (item.enabled && item.key) {
      result[item.key] = item.value;
    }
  });
  
  return result;
};