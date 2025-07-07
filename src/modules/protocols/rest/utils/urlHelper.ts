/**
 * Check if URL needs protocol and suggest what to prepend
 */
export function shouldPrependProtocol(url: string): {
  needed: boolean;
  protocol: string;
  normalizedUrl: string;
} {
  if (!url || typeof url !== 'string') {
    return { needed: false, protocol: '', normalizedUrl: url };
  }

  const trimmedUrl = url.trim();
  
  // Already has protocol - no need to prepend
  if (trimmedUrl.includes('://')) {
    return { needed: false, protocol: '', normalizedUrl: trimmedUrl };
  }

  // Determine which protocol to use
  let protocol = 'https://';
  
  // Use http for localhost
  if (trimmedUrl.toLowerCase().startsWith('localhost')) {
    protocol = 'http://';
  }
  
  // Use http for IP addresses
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(trimmedUrl)) {
    protocol = 'http://';
  }

  return {
    needed: true,
    protocol: protocol,
    normalizedUrl: protocol + trimmedUrl
  };
}