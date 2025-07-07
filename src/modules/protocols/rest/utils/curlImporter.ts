import { parseCurlCommand, type ParsedCurlRequest } from './curlParser';

export interface ImportResult {
  success: boolean;
  data?: ParsedCurlRequest;
  error?: string;
  warnings?: string[];
}

// Function to handle cURL import with comprehensive error handling
export function handleCurlImport(curlCommand: string): ImportResult {
  // Step 1: Basic input validation
  if (!curlCommand.trim() || typeof curlCommand !== 'string') {
    return {
      success: false,
      error: 'Invalid input: cURL command must be a non-empty string'
    };
  }

  const trimmedCommand = curlCommand.trim();

  // Step 2: Parse the cURL command
  const parseResult = parseCurlCommand(trimmedCommand);
  
  if (!parseResult.success || !parseResult.data) {
    return {
      success: false,
      error: parseResult.error || 'Failed to parse cURL command'
    };
  }

  const parsed = parseResult.data;
  const warnings: string[] = [];

  // Step 3: Minimal validations and warnings (be permissive)
  
  // Don't validate URL format - let users test whatever they want
  // URL normalization will happen during request execution
  
  // Don't validate HTTP method - let users test whatever they want
  
  // Check for duplicate headers (just warn, don't block)
  const headerKeys = parsed.headers.map(h => h.key.toLowerCase());
  const duplicateHeaders = headerKeys.filter((key, index) => 
    headerKeys.indexOf(key) !== index
  );
  
  if (duplicateHeaders.length > 0) {
    warnings.push(`Note: Duplicate headers found: ${[...new Set(duplicateHeaders)].join(', ')}`);
  }

  // Minimal body validation
  if (parsed.body.type === 'json' && !parsed.body.validation.isValid) {
    warnings.push('Note: Request body contains invalid JSON syntax');
  }


  // Step 4: Return successful result
  return {
    success: true,
    data: parsed,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

// Function to format error messages for display
export function formatImportError(error: string): string {
  // Common error patterns and user-friendly messages
  const errorMappings: Record<string, string> = {
    'Command must start with "curl"': 'Please paste a valid cURL command starting with "curl"',
    'No valid URL found': 'Could not find a valid URL in the cURL command',
    'cURL command is empty': 'Please paste a cURL command',
    'Invalid JSON format': 'The request body contains invalid JSON'
  };

  // Check if we have a specific mapping
  for (const [pattern, message] of Object.entries(errorMappings)) {
    if (error.includes(pattern)) {
      return message;
    }
  }

  // Return original error if no mapping found
  return error;
}

// Function to format warnings for display
export function formatWarnings(warnings: string[]): string {
  if (warnings.length === 0) return '';
  
  if (warnings.length === 1) {
    return `Note: ${warnings[0]}`;
  }
  
  return `Notes:\n${warnings.map(w => `• ${w}`).join('\n')}`;
}