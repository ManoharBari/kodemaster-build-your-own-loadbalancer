import axios from "axios";
import axiosRetry from "axios-retry";

const httpClient = axios.create({
  timeout: 5000,
  transformResponse: [
    (data) => {
      console.log("[DEBUG] transformResponse received data type:", typeof data);
      if (typeof data === 'object') {
        console.log("[DEBUG] isBuffer:", typeof Buffer !== 'undefined' ? Buffer.isBuffer(data) : "Buffer undefined");
        try { console.log("[DEBUG] stringified:", JSON.stringify(data)); } catch (e) { }
      } else {
        console.log("[DEBUG] value:", data);
      }

      if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) {
        data = data.toString();
        console.log("[DEBUG] Converted Buffer to string:", data);
      }


      if (typeof data === "string") {
        try {
          return JSON.parse(data);
        } catch (e) {
          const trimmed = data.trim();
          console.log("[DEBUG] trimmed === 'Pong':", trimmed === 'Pong');
          console.log("[DEBUG] trimmed char codes:", trimmed.split('').map(c => c.charCodeAt(0)));
          console.log("[DEBUG] trimmed value (JSON):", JSON.stringify(trimmed));
          return trimmed;
        }
      }
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