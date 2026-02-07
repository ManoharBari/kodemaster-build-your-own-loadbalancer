import { BackendServerDetails } from "../backend-server-details";

export class HealthCheck {
  private allServers: BackendServerDetails[];
  private healthyServers: BackendServerDetails[];

  constructor(
    allServers: BackendServerDetails[],
    healthyServers: BackendServerDetails[],
  ) {
    this.allServers = allServers;
    this.healthyServers = healthyServers;
  }

  start(): void {
    // Later: periodically check server health
  }

  stop(): void {
    // Later: stop health checking
  }
}
