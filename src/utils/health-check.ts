import { BackendServerDetails } from "../backend-server-details";
import { Config } from "./config";
import { BEServerHealth } from "./enums";

export class HealthCheck {
  private allServers: BackendServerDetails[];
  private healthyServers: BackendServerDetails[];
  private intervalId?: NodeJS.Timer;
  private intervalMs: number;

  constructor(
    allServers: BackendServerDetails[],
    healthyServers: BackendServerDetails[],
    config: Config,
  ) {
    this.allServers = allServers;
    this.healthyServers = healthyServers;

    // Read interval from config (default: 10 seconds)
    this.intervalMs = 10 * 1000;
  }

  start(): void {
    // Prevent double start
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      try {
        // 1️⃣ Ping all servers in parallel
        await Promise.all(this.allServers.map((server) => server.ping()));

        // 2️⃣ Update healthyServers array in-place
        this.healthyServers.length = 0;

        for (const server of this.allServers) {
          const status = server.getStatus();
          if (status === BEServerHealth.HEALTHY) {
            this.healthyServers.push(server);
          }
        }
      } catch (err) {
        console.error("Health check error:", err);
      }
    }, this.intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}
