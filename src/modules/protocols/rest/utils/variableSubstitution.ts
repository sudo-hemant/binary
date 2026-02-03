import type { EnvironmentVariable } from '../store/restSlice';

/**
 * Replace {{variableName}} placeholders with actual values from environment variables.
 * Only enabled variables are used for substitution.
 *
 * @param text - The text containing {{variable}} placeholders
 * @param variables - Array of environment variables
 * @returns The text with variables substituted
 */
export function substituteVariables(
  text: string,
  variables: EnvironmentVariable[]
): string {
  if (!text || !variables || variables.length === 0) {
    return text;
  }

  // Create a map of enabled variables for quick lookup
  const variableMap = new Map<string, string>();
  variables.forEach((v) => {
    if (v.enabled && v.key) {
      variableMap.set(v.key, v.value);
    }
  });

  // Replace all {{variableName}} occurrences
  return text.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
    const trimmedName = varName.trim();
    if (variableMap.has(trimmedName)) {
      return variableMap.get(trimmedName) || '';
    }
    // If variable not found, keep the original placeholder
    return match;
  });
}

/**
 * Substitute variables in an object's string values recursively.
 * Used for headers, params, and body content.
 */
export function substituteVariablesInObject<T>(
  obj: T,
  variables: EnvironmentVariable[]
): T {
  if (!obj || !variables || variables.length === 0) {
    return obj;
  }

  if (typeof obj === 'string') {
    return substituteVariables(obj, variables) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => substituteVariablesInObject(item, variables)) as T;
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = substituteVariables(value, variables);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = substituteVariablesInObject(value, variables);
      } else {
        result[key] = value;
      }
    }
    return result as T;
  }

  return obj;
}

/**
 * Check if a string contains any {{variable}} placeholders
 */
export function hasVariables(text: string): boolean {
  return /\{\{[^}]+\}\}/.test(text);
}

/**
 * Extract all variable names from a string
 */
export function extractVariableNames(text: string): string[] {
  const matches = text.match(/\{\{([^}]+)\}\}/g) || [];
  return matches.map((match) => match.slice(2, -2).trim());
}
