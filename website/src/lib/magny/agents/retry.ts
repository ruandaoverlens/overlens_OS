// ============================================================
// Retry utility with exponential backoff and jitter
// ============================================================

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  onRetry?: (attempt: number, error: Error) => void;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
};

/**
 * Executes `fn` up to `maxRetries + 1` times (initial attempt + retries).
 * Uses exponential backoff with full jitter between attempts:
 *   delay = random(0, min(maxDelayMs, baseDelayMs * 2^attempt))
 *
 * Throws the last error if all attempts fail.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const { maxRetries, baseDelayMs, maxDelayMs, onRetry } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  let lastError: Error = new Error("Unknown error");

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // No more retries — re-throw immediately so the caller gets the error.
      if (attempt === maxRetries) {
        break;
      }

      // Notify caller about the retry before sleeping.
      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      // Exponential backoff with full jitter:
      //   cap = min(maxDelayMs, baseDelayMs * 2^attempt)
      //   sleep = random(0, cap)
      const cap = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
      const delay = Math.floor(Math.random() * cap);

      await sleep(delay);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
