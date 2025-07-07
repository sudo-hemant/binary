import type { Header, QueryParam, RequestBody } from "../store/restSlice";

interface RESTRequest {
  method: string;
  url: string;
  headers: Header[];
  body: RequestBody;
  params: QueryParam[];
}

// Helper function to filter and process enabled key-value pairs
function getEnabledPairs<T extends { enabled: boolean; key: string; value: string }>(
  items: T[]
): T[] {
  return items.filter(item => item.enabled && item.key && item.value);
}

// Helper function to escape quotes in shell strings
function escapeShellString(str: string): string {
  // For single-quoted strings in shell, we need to end quote, add escaped quote, and start quote again
  // 'can'\''t' becomes can't
  return str.replace(/'/g, "'\\''");
}

// Helper function to escape double quotes in JSON strings
function escapeDoubleQuotes(str: string): string {
  return str.replace(/"/g, '\\"');
}

export function generateCurlCommand(request: RESTRequest): string {
  const { method, url, headers, body, params } = request;
  
  // Build URL with query parameters
  let finalUrl = url;
  const enabledParams = getEnabledPairs(params);
  if (enabledParams.length > 0) {
    const queryString = enabledParams
      .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');
    finalUrl += (url.includes('?') ? '&' : '?') + queryString;
  }

  // Start building curl command
  let curlCommand = `curl -X ${method.toUpperCase()}`;
  
  // Add URL (quoted to handle special characters)
  curlCommand += ` "${finalUrl}"`;
  
  // Add headers
  const enabledHeaders = getEnabledPairs(headers);
  enabledHeaders.forEach(header => {
    // Escape double quotes in header key and value
    const escapedKey = escapeDoubleQuotes(header.key);
    const escapedValue = escapeDoubleQuotes(header.value);
    curlCommand += ` \\\n  -H "${escapedKey}: ${escapedValue}"`;
  });
  
  // Add body for methods that support it
  if (body && body.type !== 'none' && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
    const bodyContent = body.content.raw;
    
    if (bodyContent) {
      // Handle different body types
      if (body.type === 'json') {
        // Use formatted JSON if valid, otherwise use raw
        const jsonContent = body.validation.isValid && body.content.formatted 
          ? body.content.formatted 
          : bodyContent;
        
        // Escape single quotes for shell
        const escapedBody = escapeShellString(jsonContent);
        curlCommand += ` \\\n  -H "Content-Type: application/json"`;
        curlCommand += ` \\\n  -d '${escapedBody}'`;
      } else if (body.type === 'text') {
        // For text, escape single quotes
        const escapedBody = escapeShellString(bodyContent);
        curlCommand += ` \\\n  -H "Content-Type: text/plain"`;
        curlCommand += ` \\\n  -d '${escapedBody}'`;
      }
    }
  }
  
  return curlCommand;
}
