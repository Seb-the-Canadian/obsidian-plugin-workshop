import { RateLimitError } from '../errors/rate-limit-error';

interface RateLimitConfig {
  maxRequests: number;
  timeWindowMs: number;
  retryDelayMs: number;
  maxRetries: number;
}

export class RateLimiter {
  private requestTimestamps: number[] = [];
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      maxRequests: 30, // GitHub's default rate limit per minute
      timeWindowMs: 60000, // 1 minute in milliseconds
      retryDelayMs: 1000, // Base delay of 1 second
      maxRetries: 3,
      ...config
    };
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private cleanOldTimestamps(): void {
    const now = Date.now();
    const windowStart = now - this.config.timeWindowMs;
    this.requestTimestamps = this.requestTimestamps.filter(timestamp => timestamp > windowStart);
  }

  private canMakeRequest(): boolean {
    this.cleanOldTimestamps();
    return this.requestTimestamps.length < this.config.maxRequests;
  }

  private async waitForNextWindow(): Promise<void> {
    if (this.requestTimestamps.length === 0) return;
    const oldestTimestamp = Math.min(...this.requestTimestamps);
    const waitTime = oldestTimestamp + this.config.timeWindowMs - Date.now();
    if (waitTime > 0) {
      await this.sleep(waitTime);
    }
  }

  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string = 'API call'
  ): Promise<T> {
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        if (!this.canMakeRequest()) {
          await this.waitForNextWindow();
        }

        this.requestTimestamps.push(Date.now());
        return await operation();
      } catch (error) {
        const isRateLimit = error.status === 429 || error.message?.includes('rate limit');
        const isLastAttempt = attempt === this.config.maxRetries - 1;

        if (!isRateLimit || isLastAttempt) {
          throw error;
        }

        const delayMs = this.config.retryDelayMs * Math.pow(2, attempt);
        console.warn(`Rate limit hit for ${context}. Retrying in ${delayMs}ms...`);
        await this.sleep(delayMs);
      }
    }

    throw new RateLimitError(`Rate limit exceeded for ${context} after ${this.config.maxRetries} retries`);
  }
} 