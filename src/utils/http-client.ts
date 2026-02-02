import axios from "axios";
import axiosRetry from "axios-retry";

const httpClient = axios.create({
  timeout: 5000,
});

axiosRetry(httpClient, {
  retries: 3,
  retryDelay: (retryCount) => 200 * Math.pow(2, retryCount - 1),
  retryCondition: (error) =>
    axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error),
});

export const HttpClient = httpClient;