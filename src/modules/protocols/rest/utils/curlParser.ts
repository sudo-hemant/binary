import type { Header, QueryParam, RequestBody } from '../store/restSlice';

export interface ParsedCurlRequest {
  method: string;
  url: string;
  headers: Header[];
  body: RequestBody;
  params: QueryParam[];
}

export interface CurlParseResult {
  success: boolean;
  data?: ParsedCurlRequest;
  error?: string;
}

// Helper function to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Helper function to create default body
function createDefaultBody(): RequestBody {
  return {
    type: 'none',
    content: {
      raw: '',
      parsed: null,
      formatted: ''
    },
    validation: {
      isValid: true,
      error: null
    }
  };
}

// Common cURL flags mapping
const CURL_FLAGS = {
  // Method flags
  '-X': 'method',
  '--request': 'method',
  
  // Header flags
  '-H': 'header',
  '--header': 'header',
  
  // Data flags
  '-d': 'data',
  '--data': 'data',
  '--data-raw': 'data',
  '--data-binary': 'data',
  '--data-urlencode': 'data',
  
  // Cookie flags
  '-b': 'cookie',
  '--cookie': 'cookie',
  
  // Follow redirects (ignore these)
  '-L': 'ignore',
  '--location': 'ignore',
  
  // User agent
  '-A': 'header',
  '--user-agent': 'header',
  
  // Referer
  '-e': 'header',
  '--referer': 'header',
  
  // Other common flags to ignore
  '-s': 'ignore',
  '--silent': 'ignore',
  '-v': 'ignore',
  '--verbose': 'ignore',
  '-k': 'ignore',
  '--insecure': 'ignore',
  '--compressed': 'ignore',
  '-i': 'ignore',
  '--include': 'ignore'
};

// Clean and normalize the cURL command
function cleanCurlCommand(command: string): string {
  return command
    // Handle line continuations
    .replace(/\\\s*\n\s*/g, ' ')
    // Normalize quotes (convert smart quotes to regular quotes)
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // Clean up extra whitespace but preserve structure in quotes
    .trim();
}

// Simple argument parser that respects quotes
function parseArguments(command: string): string[] {
  const args: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < command.length; i++) {
    const char = command[i];
    
    if (!inQuotes && (char === '"' || char === "'")) {
      // Start of quoted string
      inQuotes = true;
      quoteChar = char;
      current += char;
    } else if (inQuotes && char === quoteChar) {
      // End of quoted string
      current += char;
      inQuotes = false;
    } else if (!inQuotes && /\s/.test(char)) {
      // Whitespace outside quotes - end current argument
      if (current.trim()) {
        args.push(current.trim());
        current = '';
      }
    } else {
      // Regular character
      current += char;
    }
  }
  
  // Add last argument if exists
  if (current.trim()) {
    args.push(current.trim());
  }
  
  return args;
}

// Remove surrounding quotes from a string
function unquote(str: string): string {
  if (!str) return str;
  
  // Remove outer quotes if they match
  if ((str.startsWith('"') && str.endsWith('"')) || 
      (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1);
  }
  
  return str;
}

// Create body from content
function createBodyFromContent(content: string, contentType?: string): RequestBody {
  const body = createDefaultBody();
  
  if (!content.trim()) {
    return body;
  }

  // Auto-detect JSON
  const trimmedContent = content.trim();
  if (contentType?.includes('application/json') || 
      (trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) ||
      (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'))) {
    
    body.type = 'json';
    body.content.raw = content;
    
    try {
      const parsed = JSON.parse(content);
      body.content.parsed = parsed;
      body.content.formatted = JSON.stringify(parsed, null, 2);
      body.validation.isValid = true;
    } catch {
      body.validation.isValid = false;
      body.validation.error = 'Invalid JSON format';
      body.content.formatted = content;
    }
  } else {
    // Treat as text
    body.type = 'text';
    body.content.raw = content;
    body.content.formatted = content;
    body.validation.isValid = true;
  }

  return body;
}

// Parse a header string like "Content-Type: application/json"
function parseHeaderString(headerStr: string): { key: string; value: string } | null {
  const colonIndex = headerStr.indexOf(':');
  if (colonIndex === -1) return null;
  
  const key = headerStr.substring(0, colonIndex).trim();
  let value = headerStr.substring(colonIndex + 1).trim();
  
  // Fix common issues
  if (value.endsWith('/') && !value.includes(' ')) {
    value = value.slice(0, -1) + '*/*';
  }
  
  return { key, value };
}

// Main parsing function
export function parseCurlCommand(curlCommand: string): CurlParseResult {
  try {
    if (!curlCommand.trim()) {
      return { success: false, error: 'cURL command is empty' };
    }

    // Clean the command
    const cleanCommand = cleanCurlCommand(curlCommand);
    
    // Parse into arguments
    const args = parseArguments(cleanCommand);
    
    if (args.length === 0 || !args[0].toLowerCase().includes('curl')) {
      return { success: false, error: 'Command must start with "curl"' };
    }

    // Initialize result
    let method = 'GET';
    let url = '';
    const headers: Header[] = [];
    let bodyContent = '';
    let contentType: string | undefined;

    // Process arguments
    for (let i = 1; i < args.length; i++) {
      const arg = args[i];
      const flagType = CURL_FLAGS[arg];
      
      if (flagType === 'ignore') {
        // Skip ignored flags
        continue;
      } else if (flagType === 'method') {
        // Method flag
        if (i + 1 < args.length) {
          method = unquote(args[i + 1]).toUpperCase();
          i++; // Skip next argument
        }
      } else if (flagType === 'header') {
        // Header flag
        if (i + 1 < args.length) {
          const headerStr = unquote(args[i + 1]);
          
          // Handle special header flags
          if (arg === '-A' || arg === '--user-agent') {
            headers.push({
              id: generateId(),
              key: 'User-Agent',
              value: headerStr,
              description: '',
              enabled: true
            });
          } else if (arg === '-e' || arg === '--referer') {
            headers.push({
              id: generateId(),
              key: 'Referer',
              value: headerStr,
              description: '',
              enabled: true
            });
          } else {
            // Regular header
            const parsed = parseHeaderString(headerStr);
            if (parsed) {
              headers.push({
                id: generateId(),
                key: parsed.key,
                value: parsed.value,
                description: '',
                enabled: true
              });
              
              if (parsed.key.toLowerCase() === 'content-type') {
                contentType = parsed.value;
              }
            }
          }
          i++; // Skip next argument
        }
      } else if (flagType === 'data') {
        // Data flag
        if (i + 1 < args.length) {
          bodyContent = unquote(args[i + 1]);
          // Auto-set method to POST if not explicitly set
          if (method === 'GET') {
            method = 'POST';
          }
          i++; // Skip next argument
        }
      } else if (flagType === 'cookie') {
        // Cookie flag
        if (i + 1 < args.length) {
          headers.push({
            id: generateId(),
            key: 'Cookie',
            value: unquote(args[i + 1]),
            description: '',
            enabled: true
          });
          i++; // Skip next argument
        }
      } else if (!arg.startsWith('-')) {
        // This might be the URL
        const potentialUrl = unquote(arg);
        if (potentialUrl.includes('://') || potentialUrl.includes('.')) {
          url = potentialUrl;
        }
      }
    }

    // Validate we found a URL
    if (!url) {
      return { success: false, error: 'No URL found in cURL command' };
    }

    // Parse URL to extract query parameters
    let baseUrl = url;
    const params: QueryParam[] = [];
    
    try {
      const urlObj = new URL(url);
      baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
      
      urlObj.searchParams.forEach((value, key) => {
        params.push({
          id: generateId(),
          key,
          value,
          description: '',
          enabled: true
        });
      });
    } catch {
      // If URL parsing fails, use original URL
      baseUrl = url;
    }

    // Create body
    const body = createBodyFromContent(bodyContent, contentType);

    return {
      success: true,
      data: {
        method,
        url: baseUrl,
        headers,
        body,
        params
      }
    };

  } catch (error) {
    return {
      success: false,
      error: `Failed to parse cURL command: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

