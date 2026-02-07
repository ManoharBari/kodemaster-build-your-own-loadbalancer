import { ILbAlgorithm } from "./lb-algo.interface";
import { BackendServerDetails } from "../backend-server-details";
import { BEServerHealth } from "../utils/enums";

export class RoundRobin implements ILbAlgorithm {
  private servers: BackendServerDetails[];
  private currentIndex = 0;

  constructor(servers: BackendServerDetails[]) {
    this.servers = servers;
  }

  nextServer(): BackendServerDetails {
    // 1️⃣ Only pick healthy servers
    const healthyServers = this.servers.filter(
      (server) => server.getStatus() === BEServerHealth.HEALTHY,
    );

    // 2️⃣ If none are healthy → crash loudly
    if (healthyServers.length === 0) {
      throw new Error("No healthy backend servers available");
    }

    // 3️⃣ Pick the next server in round-robin order
    const server = healthyServers[this.currentIndex % healthyServers.length];

    // 4️⃣ Move index forward for next request
    this.currentIndex++;

    return server;
  }
}
