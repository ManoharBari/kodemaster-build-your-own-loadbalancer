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
