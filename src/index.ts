import { LBServer } from "./load-balancer";
import { Config } from "./utils/config";
import { BackendServerDetails } from "./backend-server-details";

const config = Config.load("config.json");

const servers = config.backendServers.map(
  (s) => new BackendServerDetails(s.url, s.weight),
);

const lb = new LBServer(config, servers);
lb.init();

const shutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}, shutting down...`);

  try {
    await lb.close();
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown); 
process.on("SIGTERM", shutdown); 
