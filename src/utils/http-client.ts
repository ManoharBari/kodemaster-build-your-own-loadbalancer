import axios from 'axios';
import axiosRetry from 'axios-retry';

// Create axios instance
const httpClient = axios.create({
  timeout: 5000,
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