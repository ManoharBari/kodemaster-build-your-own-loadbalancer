import { LBServer } from "./load-balancer";
import { Config } from "./utils/config";

Config.load("config.json");
const lb = new LBServer();
lb.init();
