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
    config?: Config,
  ) {
    this.allServers = allServers;
    this.healthyServers = healthyServers;

    // Read interval from config (default: 10 seconds)
    this.intervalMs = (config?.health_check_interval ?? 10) * 1000;

    // Initial population
    this.updateHealthyServers();
  }

  public updateHealthyServers(): void {
    this.healthyServers.length = 0;

    for (const server of this.allServers) {
      if (server.getStatus() === BEServerHealth.HEALTHY) {
        this.healthyServers.push(server);
      }
    }
  }

  public handleFailure(server: BackendServerDetails): void {
    server.setStatus(BEServerHealth.UNHEALTHY);

    const index = this.healthyServers.indexOf(server);
    if (index !== -1) {
      this.healthyServers.splice(index, 1);
    }

    console.log(`[Passive] Server ${server.url} marked UNHEALTHY`);
  }

  private async checkOnce(): Promise<void> {
    await Promise.all(
      this.allServers.map(async (server) => {
        try {
          await server.ping();
        } catch {
          // ignore
        }
      }),
    );

    this.updateHealthyServers();
  }

  start(): void {
    if (this.intervalId) return;

    // Run immediately
    this.checkOnce().catch(() => {});

    this.intervalId = setInterval(() => {
      this.checkOnce().catch((err) => {
        console.error("Health check error:", err);
      });
    }, this.intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}
