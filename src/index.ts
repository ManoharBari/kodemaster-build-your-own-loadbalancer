import { LBServer } from "./load-balancer";
import { Config } from "./utils/config";
import { BackendServerDetails } from "./backend-server-details";

const config = Config.load("config.json");

const servers = config.backendServers.map(
  (s) => new BackendServerDetails(s.url, s.weight),
);

const lb = new LBServer(config, servers);
lb.init();
