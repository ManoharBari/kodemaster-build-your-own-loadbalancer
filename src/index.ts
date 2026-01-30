import express, { Request, Response } from "express";
import { Config } from "./utils/config";
import { BackendServerDetails } from "./backend-server-details";
import { BEServerHealth } from "./utils/enums";

// Load and validate configuration at startup
// This will fail fast if config is invalid
Config.load();
const config = Config.getConfig();

// Initialize backend servers from configuration
// Each server starts as UNHEALTHY until health checks verify they're alive
const backendServers: BackendServerDetails[] = config.be_servers.map(
  (server) => new BackendServerDetails(server.domain, server.weight),
);

console.log("\n📋 Backend Servers Initialized:");
backendServers.forEach((server, index) => {
  console.log(`   ${index + 1}. ${server.toString()}`);
});

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Basic health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    loadBalancer: {
      port: config.lbPORT,
      algorithm: config.lbAlgo,
      backendServers: backendServers.map((server) => server.getMetrics()),
    },
  });
});

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Load Balancer is running",
    config: {
      algorithm: config.lbAlgo,
      backends: backendServers.map((server) => ({
        url: server.url,
        weight: server.serverWeight,
        status: server.getStatus(),
        requestsServed: server.getRequestsServed(),
      })),
    },
  });
});

// Backend servers status endpoint
app.get("/servers", (req: Request, res: Response) => {
  res.status(200).json({
    servers: backendServers.map((server, index) => ({
      index,
      ...server.getMetrics(),
    })),
  });
});

// Endpoint to manually set server status (for testing)
app.post("/servers/:index/status", (req: Request, res: Response) => {
  const index = parseInt(req.params.index);
  const { status } = req.body;

  if (isNaN(index) || index < 0 || index >= backendServers.length) {
    return res.status(400).json({ error: "Invalid server index" });
  }

  if (!status || !Object.values(BEServerHealth).includes(status)) {
    return res.status(400).json({
      error: "Invalid status. Must be HEALTHY or UNHEALTHY",
    });
  }

  backendServers[index].setStatus(status);

  res.status(200).json({
    message: "Server status updated",
    server: backendServers[index].getMetrics(),
  });
});

// Endpoint to reset server metrics (for testing)
app.post("/servers/:index/reset", (req: Request, res: Response) => {
  const index = parseInt(req.params.index);

  if (isNaN(index) || index < 0 || index >= backendServers.length) {
    return res.status(400).json({ error: "Invalid server index" });
  }

  backendServers[index].resetMetrics();

  res.status(200).json({
    message: "Server metrics reset",
    server: backendServers[index].getMetrics(),
  });
});

// Start the server
app.listen(config.lbPORT, () => {
  console.log("=".repeat(50));
  console.log("🚀 Load Balancer Started");
  console.log("=".repeat(50));
  console.log(`📡 Listening on port: ${config.lbPORT}`);
  console.log(`⚡ Algorithm: ${config.lbAlgo.toUpperCase()}`);
  console.log(`🖥️  Backend Servers:`);
  config.be_servers.forEach((server, index) => {
    console.log(`   ${index + 1}. ${server.domain} (weight: ${server.weight})`);
  });
  console.log("=".repeat(50));
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n🛑 SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n🛑 SIGINT received. Shutting down gracefully...");
  process.exit(0);
});
