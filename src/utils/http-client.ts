import axios, { AxiosError, AxiosInstance } from "axios";
import axiosRetry, { IAxiosRetryConfig } from "axios-retry";

/**
 * Resilient HTTP Client with automatic retries and exponential backoff
 *
 * Features:
 * - Automatic retries on network errors and 5xx server errors
 * - Exponential backoff delay between retries
 * - Configurable timeout
 * - Does NOT retry on 4xx client errors
 */

// Create axios instance with global configuration
const httpClient: AxiosInstance = axios.create({
  timeout: 5000, // 5 seconds global timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Configure axios-retry with exponential backoff
const retryConfig: IAxiosRetryConfig = {
  retries: 3, // Attempt 3 retries

  /**
   * Exponential backoff delay strategy
   * Retry 1: 200ms
   * Retry 2: 400ms
   * Retry 3: 800ms
   */
  retryDelay: (retryCount: number) => {
    const delay = 200 * Math.pow(2, retryCount - 1);
    console.log(`⏳ Retry attempt ${retryCount}, waiting ${delay}ms...`);
    return delay;
  },

  /**
   * Retry condition: Only retry on network errors or 5xx server errors
   * DO NOT retry on 4xx client errors (user's fault, not transient)
   */
  retryCondition: (error: AxiosError) => {
    // Network error (no response received)
    if (axiosRetry.isNetworkError(error)) {
      console.log(`🔄 Network error detected, will retry...`);
      return true;
    }

    // Server error (5xx status codes)
    if (axiosRetry.isRetryableError(error)) {
      const status = error.response?.status;
      if (status && status >= 500 && status < 600) {
        console.log(`🔄 Server error ${status} detected, will retry...`);
        return true;
      }
    }

    // Don't retry on 4xx client errors or other errors
    const status = error.response?.status;
    if (status && status >= 400 && status < 500) {
      console.log(`❌ Client error ${status}, not retrying`);
    }

    return false;
  },

  // Log when all retries are exhausted
  onRetry: (retryCount: number, error: AxiosError, requestConfig: any) => {
    console.log(`🔁 Retry ${retryCount} for ${requestConfig.url}`);
  },
};

// Apply retry configuration to the axios instance
axiosRetry(httpClient, retryConfig);

/**
 * Export the configured HTTP client
 * Use this for all HTTP requests to get automatic retries
 */
export const HttpClient = httpClient;

/**
 * Alternative export for direct import
 */
export default HttpClient;
