import axios from 'axios';
import axiosRetry from 'axios-retry';

// Create axios instance
const httpClient = axios.create({
  timeout: 5000,
  transformResponse: [function (data) {
    // Return data as-is without transformation
    // This handles both JSON and plain text responses
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        return data;
      }
    }
    return data;
  }],
});

// Configure retry logic
axiosRetry(httpClient, {
  retries: 3,
  retryDelay: (retryCount) => {
    return 200 * Math.pow(2, retryCount - 1);
  },
  retryCondition: (error) => {
    return axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error);
  },
});

export const HttpClient = httpClient;
export default HttpClient;