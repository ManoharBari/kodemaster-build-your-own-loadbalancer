import axios from "axios";
import axiosRetry from "axios-retry";

const httpClient = axios.create({
  timeout: 5000,
  transformResponse: [
    function (data) {
      // Handle the response data explicitly
      if (typeof data === "string") {
        // Try to parse as JSON first
        try {
          return JSON.parse(data);
        } catch (e) {
          // If it's not JSON, return the string as-is
          return data;
        }
      }
      // For non-string data, return as-is
      return data;
    },
  ],
});

axiosRetry(httpClient, {
  retries: 3,
  retryDelay: (retryCount) => 200 * Math.pow(2, retryCount - 1),
  retryCondition: (error) =>
    axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error),
});

export const HttpClient = httpClient;