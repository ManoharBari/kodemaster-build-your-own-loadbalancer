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
  public readonly url: string;
  public readonly serverWeight: number;
  public requestsServed: number;

  private status: BEServerHealth;

  constructor(url: string, serverWeight: number = 1) {
    this.url = url;
    this.serverWeight = serverWeight;
    this.status = BEServerHealth.UNHEALTHY;
    this.requestsServed = 0;
  }

  public getStatus(): BEServerHealth {
    return this.status;
  }

  public setStatus(status: BEServerHealth): void {
    this.status = status;
  }

  public incrementRequestsServed(): void {
    this.requestsServed++;
  }

  public resetMetrics(): void {
    this.requestsServed = 0;
  }
}
