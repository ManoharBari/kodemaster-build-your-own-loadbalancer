import { BEServerHealth } from "./utils/enums";

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
  private requestsServed: number;

  constructor(url: string, weight: number = 1) {
    this.url = url;
    this.serverWeight = weight;
    this.status = BEServerHealth.UNHEALTHY;
    this.requestsServed = 0;
  }

  getStatus(): BEServerHealth {
    return this.status;
  }

  setStatus(status: BEServerHealth): void {
    this.status = status;
  }

  incrementRequestsServed(): void {
    this.requestsServed += 1;
  }

  resetMetrics(): void {
    this.requestsServed = 0;
  }

  // Additional helper methods for index.ts
  getRequestsServed(): number {
    return this.requestsServed;
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
      requestsServed: this.requestsServed,
    };
  }

  toString(): string {
    const statusEmoji = this.status === BEServerHealth.HEALTHY ? "✅" : "❌";
    return `${statusEmoji} ${this.url} [Weight: ${this.serverWeight}, Requests: ${this.requestsServed}]`;
  }
}
