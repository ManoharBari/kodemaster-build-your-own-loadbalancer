import express, { Express } from "express";
import { Server } from "http";
import { Config } from "./utils/config";
import { BackendServerDetails } from "./backend-server-details";
import { HttpClient } from "./utils/http-client";

export class LBServer {
  public app: Express;
  public server: Server | null = null;
  public backendServers: BackendServerDetails[];
  private config: Config;

  constructor() {
    this.config = Config.load();
    this.app = express();

    this.setupProxyHandler();

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

  private setupProxyHandler(): void {
    this.app.use(express.json());
    this.app.use(express.raw({ type: "*/*", limit: "10mb" }));

    this.app.use(async (req, res) => {
      try {
        const server = this.backendServers[0];

        server.incrementRequestsServed();

        // ✅ Use HttpClient directly - it's already an instance!
        const response = await HttpClient.request({
          method: req.method,
          url: `${server.url}${req.url}`,
          headers: req.headers,
          data: req.body,
        });

        // Forward response
        Object.entries(response.headers).forEach(([key, value]) => {
          if (value !== undefined) {
            res.setHeader(key, value);
          }
        });
        res.status(response.status).send(response.data);
      } catch (error: any) {
        res.status(500).json({
          error: "Backend server error",
          message: error.message,
        });
      }
    });
  }

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) reject(err);
          else {
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
