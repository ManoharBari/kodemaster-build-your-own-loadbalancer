import { BEServerHealth } from './utils/enums';

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
 * 
 * This class acts as an "Avatar" for each real backend server, tracking:
 * - Health status (HEALTHY/UNHEALTHY)
 * - Request count
 * - Server weight (for weighted load balancing)
 * - Active request state
 * 
 * Design Pattern: Encapsulation
 * By keeping all server-related state in one class, we make our load
 * balancing algorithms cleaner and easier to maintain.
 */
export class BackendServerDetails implements IBackendServerDetails {
  public readonly url: string;
  public readonly serverWeight: number;
  public requestsServed: number;
  
  private status: BEServerHealth;
  private isHandlingRequest: boolean;
  
  /**
   * Creates a new BackendServerDetails instance
   * 
   * @param url - The URL of the backend server (e.g., "http://localhost:8081")
   * @param serverWeight - The weight of the server for weighted algorithms (default: 1)
   * 
   * Note: Servers start as UNHEALTHY. Health checks (in later steps) will
   * mark them as HEALTHY once verified.
   */
  constructor(url: string, serverWeight: number = 1) {
    if (!url || url.trim() === '') {
      throw new Error('Backend server URL cannot be empty');
    }
    
    if (serverWeight < 1) {
      throw new Error('Server weight must be at least 1');
    }
    
    this.url = url;
    this.serverWeight = serverWeight;
    
    // Initialize as UNHEALTHY - don't send traffic until verified
    this.status = BEServerHealth.UNHEALTHY;
    
    // Initialize metrics
    this.requestsServed = 0;
    this.isHandlingRequest = false;
  }
  
  /**
   * Gets the current health status of the server
   * @returns The current health status (HEALTHY or UNHEALTHY)
   */
  public getStatus(): BEServerHealth {
    return this.status;
  }
  
  /**
   * Sets the health status of the server
   * @param status - The new health status to set
   */
  public setStatus(status: BEServerHealth): void {
    this.status = status;
  }
  
  /**
   * Increments the count of requests served by this server
   * Used for tracking load distribution and metrics
   */
  public incrementRequestsServed(): void {
    this.requestsServed++;
  }
  
  /**
   * Resets all metrics to zero
   * Useful for testing or periodic metric resets
   */
  public resetMetrics(): void {
    this.requestsServed = 0;
    this.isHandlingRequest = false;
  }
  
  /**
   * Gets the total number of requests served by this server
   * @returns The request count
   */
  public getRequestsServed(): number {
    return this.requestsServed;
  }
  
  /**
   * Marks the server as currently handling a request
   */
  public setHandlingRequest(handling: boolean): void {
    this.isHandlingRequest = handling;
  }
  
  /**
   * Checks if the server is currently handling a request
   * @returns true if handling a request, false otherwise
   */
  public isCurrentlyHandlingRequest(): boolean {
    return this.isHandlingRequest;
  }
  
  /**
   * Checks if the server is healthy and available to receive requests
   * @returns true if the server is healthy, false otherwise
   */
  public isHealthy(): boolean {
    return this.status === BEServerHealth.HEALTHY;
  }
  
  /**
   * Gets a summary of the server's current state
   * Useful for debugging and monitoring
   */
  public getMetrics(): {
    url: string;
    status: BEServerHealth;
    weight: number;
    requestsServed: number;
    isHandlingRequest: boolean;
  } {
    return {
      url: this.url,
      status: this.status,
      weight: this.serverWeight,
      requestsServed: this.requestsServed,
      isHandlingRequest: this.isHandlingRequest
    };
  }
  
  /**
   * Returns a string representation of the server
   * Useful for logging and debugging
   */
  public toString(): string {
    const statusEmoji = this.status === BEServerHealth.HEALTHY ? '✅' : '❌';
    return `${statusEmoji} ${this.url} [Weight: ${this.serverWeight}, Requests: ${this.requestsServed}]`;
  }
}