/**
 * Formats raw technical API & network errors into clean, user-friendly messages.
 */
export function formatErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const message = typeof error === 'string' 
    ? error 
    : error.message || error.error_description || String(error);

  const lower = message.toLowerCase();

  // Network / Host resolution / Offline detection
  if (
    lower.includes('unknownhostexception') ||
    lower.includes('fetch failed') ||
    lower.includes('network request failed') ||
    lower.includes('failed to fetch') ||
    lower.includes('no address associated with hostname') ||
    lower.includes('typeerror: network request failed')
  ) {
    return 'Network connection error. Unable to reach server. Please check your internet connection and try again.';
  }

  // Common authentication errors
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }

  if (lower.includes('email not confirmed')) {
    return 'Please verify your email address before signing in.';
  }

  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'An account with this email address already exists.';
  }

  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many request attempts. Please wait a moment and try again.';
  }

  return message;
}
