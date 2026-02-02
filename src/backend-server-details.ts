import { BEServerHealth } from "./utils/enums";
import { HttpClient } from "./utils/http-client";

/**
 * Interface defining the contract for Backend Server Details
 */
export interface IBackendServerDetails {
  url: string;
  serverWeight: number;

  // Status management
  getStatus(): BEServerHealth;
  setStatus(status: BEServerHealth): void;

  // Metrics tracking
  incrementRequestsServed(): void;
  resetMetrics(): void;
}

/**
 * BackendServerDetails - Encapsulates the state and metrics of a backend server
 */
export class BackendServerDetails implements IBackendServerDetails {
  url: string;
  serverWeight: number;

  private status: BEServerHealth;
  requestsServedCount: number;

  constructor(url: string, weight: number = 1) {
    this.url = url;
    this.serverWeight = weight;
    this.status = BEServerHealth.UNHEALTHY;
    this.requestsServedCount = 0;
  }

  getStatus(): BEServerHealth {
    return this.status;
  }

  setStatus(status: BEServerHealth): void {
    this.status = status;
  }

  incrementRequestsServed(): void {
    this.requestsServedCount++;
  }

  resetMetrics(): void {
    this.requestsServedCount = 0;
  }

  // Additional helper methods for index.ts
  getRequestsServed(): number {
    return this.requestsServedCount;
  }

  isHealthy(): boolean {
    return this.status === BEServerHealth.HEALTHY;
  }

  getMetrics(): {
    url: string;
    status: BEServerHealth;
    weight: number;
    requestsServed: number;
  } {
    return {
      url: this.url,
      status: this.status,
      weight: this.serverWeight,
      requestsServed: this.requestsServedCount,
    };
  }

  toString(): string {
    const statusEmoji = this.status === BEServerHealth.HEALTHY ? "✅" : "❌";
    return `${statusEmoji} ${this.url} [Weight: ${this.serverWeight}, Requests: ${this.requestsServedCount}]`;
  }

  async ping(): Promise<boolean> {
    try {
      // Make GET request to /ping endpoint with resilient client
      const response = await HttpClient.get(`${this.url}/ping`);

      // If we get a successful response, mark as HEALTHY
      if (response.status >= 200 && response.status < 300) {
        this.setStatus(BEServerHealth.HEALTHY);
        return true;
      }

      // Unexpected status code
      this.setStatus(BEServerHealth.UNHEALTHY);
      return false;
    } catch (error) {
      // After all retries failed, mark as UNHEALTHY
      this.setStatus(BEServerHealth.UNHEALTHY);
      return false;
    }
  }
}
