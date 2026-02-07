import { ILbAlgorithm } from "./lb-algo.interface";
import { BackendServerDetails } from "../backend-server-details";
import { BEServerHealth } from "../utils/enums";

type WRRServer = {
  server: BackendServerDetails;
  weight: number;
  currentWeight: number;
};

export class WeightedRoundRobin implements ILbAlgorithm {
  private servers: WRRServer[] = [];
  private totalWeight = 0;

  constructor(servers: BackendServerDetails[]) {
    // Initialize WRR state
    this.servers = servers.map((server) => ({
      server,
      weight: server.serverWeight,
      currentWeight: 0,
    }));

    this.totalWeight = this.servers.reduce((sum, s) => sum + s.weight, 0);
  }

  nextServer(): BackendServerDetails {
    // 1️⃣ Filter healthy servers
    const healthyServers = this.servers.filter((s) => {
      const status = s.server.getStatus();
      return status === BEServerHealth.HEALTHY;
    });

    if (healthyServers.length === 0) {
      throw new Error("No healthy backend servers available");
    }

    // 2️⃣ Increase currentWeight by weight
    for (const s of healthyServers) {
      s.currentWeight += s.weight;
    }

    // 3️⃣ Pick server with highest currentWeight
    let selected = healthyServers[0];
    for (const s of healthyServers) {
      if (s.currentWeight > selected.currentWeight) {
        selected = s;
      }
    }

    // 4️⃣ Reduce selected server’s weight
    selected.currentWeight -= this.totalWeight;

    return selected.server;
  }
}
