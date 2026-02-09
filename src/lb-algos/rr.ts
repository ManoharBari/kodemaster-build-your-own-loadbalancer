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
    if (this.servers.length === 0) {
      throw new Error("No healthy backend servers available");
    }

    const server = this.servers[this.currentIndex];
    this.currentIndex =
      (this.currentIndex + 1) % this.servers.length;

    return server;
  }
}
