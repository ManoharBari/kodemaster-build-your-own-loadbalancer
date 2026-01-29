import express from "express";
import { Config } from './utils/config';

const app = express();
const PORT = 7000;

Config.load(); // Should throw and exit if invalid
const config = Config.getConfig();

app.get("/", (req, res) => {
  res.send("Load Balancer v1.0");
});

app.listen(PORT, () => {
  console.log(`Load Balancer running on port ${PORT}`);
});
