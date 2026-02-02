import axios from "axios";

const httpClient = axios.create({
  timeout: 5000,
});

const MAX_RETRIES = 3;

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (!config) {
      return Promise.reject(error);
    }

    // Initialize retryCount
    if (config.retryCount === undefined) {
      config.retryCount = 0;
    }

    // Check retryable conditions: Network Error or 503 Service Unavailable
    const shouldRetry =
      !error.response || // Network error often has no response
      error.code === 'ECONNABORTED' ||
      error.message === 'Network Error' ||
      error.response.status === 503;

    if (shouldRetry && config.retryCount < MAX_RETRIES) {
      config.retryCount += 1;

      // Exponential backoff: 200, 400, 800
      const delay = 200 * Math.pow(2, config.retryCount - 1);

      await new Promise(resolve => setTimeout(resolve, delay));

      return httpClient(config);
    }

    return Promise.reject(error);
  }
);

export const HttpClient = httpClient;