import express, { Express } from "express";
import { Server } from "http";
import { Config } from "./utils/config";
import { BackendServerDetails } from "./backend-server-details";

export class LBServer {
  public app: Express;
  public server: Server | null = null;
  public backendServers: BackendServerDetails[];
  private config: Config;

  constructor() {
    // Load configuration
    this.config = Config.load();
    // Initialize Express application
    this.app = express();

    // Initialize backend servers from config
    this.backendServers = this.config.backendServers.map(
      (serverConfig) => new BackendServerDetails(serverConfig.url),
    );

    console.log(
      `✅ Initialized ${this.backendServers.length} backend server(s)`,
    );
    this.backendServers.forEach((server, index) => {
      console.log(`   [${index + 1}] ${server.url}`);
    });
  }

  public init(): void {
    this.server = this.app.listen(this.config.lbPort, () => {
      console.log(`🚀 Load Balancer running on port ${this.config.lbPort}`);
      console.log(
        `📊 Managing ${this.backendServers.length} backend server(s)`,
      );
    });
  }

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log("🛑 Load Balancer shut down gracefully");
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}
