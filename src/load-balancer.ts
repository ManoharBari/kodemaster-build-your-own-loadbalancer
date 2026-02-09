import express, { Express } from "express";
import { Server } from "http";
import { Config } from "./utils/config";
import { BackendServerDetails } from "./backend-server-details";
import { HttpClient } from "./utils/http-client";
import { ILbAlgorithm } from "./lb-algos/lb-algo.interface";
import { RoundRobin } from "./lb-algos/rr";
import { WeightedRoundRobin } from "./lb-algos/wrr";
import { HealthCheck } from "./utils/health-check";
import { createLbAlgorithm } from "./lb-algos/algorithm-factory";

export class LBServer {
  public app: Express;
  public server: Server | null = null;
  public backendServers: BackendServerDetails[];
  private config: Config;
  private lbAlgo!: ILbAlgorithm;
  private healthyServers: BackendServerDetails[];
  private healthCheck: HealthCheck;
  private statsInterval?: NodeJS.Timer;

  constructor(config: Config, servers: BackendServerDetails[]) {
    this.config = config;
    this.app = express();
    const rawConfig = Config.getConfig();

    this.backendServers = servers;
    this.healthyServers = [];

    this.healthCheck = new HealthCheck(
      this.backendServers,
      this.healthyServers,
      config,
    );

    // Pass healthyServers, not backendServers
    this.lbAlgo = createLbAlgorithm(rawConfig.lbAlgo, this.healthyServers);
    this.setupProxyHandler();

    console.log(
      `✅ Initialized ${this.backendServers.length} backend server(s)`,
    );
    this.backendServers.forEach((server, index) => {
      console.log(`[${index + 1}] ${server.url}`);
    });
  }

  public init(): void {
    this.healthCheck.start();

    this.statsInterval = setInterval(() => {
      this.printStats();
    }, 1000);
    
    this.server = this.app.listen(this.config.lbPort, () => {
      console.log(`🚀 Load Balancer running on port ${this.config.lbPort}`);
      console.log(
        `📊 Managing ${this.backendServers.length} backend server(s)`,
      );
    });
  }

  private printStats(): void {
    console.clear();

    console.log("📊 Load Balancer – Live Stats\n");

    const stats = this.backendServers.map((server) => ({
      URL: server.url,
      Status: server.getStatus(),
      Requests: server.requestsServedCount,
      Weight: server.serverWeight,
    }));

    console.table(stats);
  }

  private setupProxyHandler(): void {
    this.app.use(express.json());
    this.app.use(express.raw({ type: "*/*", limit: "10mb" }));

    this.app.use(async (req, res) => {
      const MAX_RETRIES = 3;
      let retries = 0;
      let lastError: any = null;

      while (retries < MAX_RETRIES) {
        const server = this.lbAlgo.nextServer();

        if (!server) {
          console.error("[LB] No healthy servers available");
          break;
        }

        try {
          console.log(`[LB] Attempt ${retries + 1} → ${server.url}`);

          server.incrementRequestsServed();

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
          return;
        } catch (err: any) {
          console.error(
            `[Passive] Server ${server.url} failed:`,
            err.code || err.message,
          );

          lastError = err;

          // Passive failure detection
          if (
            err.code === "ECONNREFUSED" ||
            err.code === "ECONNRESET" ||
            err.code === "ETIMEDOUT" ||
            err.code === "ENOTFOUND"
          ) {
            this.healthCheck.handleFailure(server);
          }

          retries++;
        }
      }

      console.error("[LB] All retries failed:", lastError?.message);
      res.status(500).send("All backend servers are unavailable");
    });
  }

  public close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.healthCheck.stop();
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
