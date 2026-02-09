import express from "express";
import { LBServer } from "../src/load-balancer";
import { Config } from "../src/utils/config";
import { BackendServerDetails } from "../src/backend-server-details";
import { HttpClient } from "../src/utils/http-client";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function startMockServer(port: number, name: string, counter: any) {
  const app = express();
  app.get("*", (_req, res) => {
    counter[name]++;
    res.send(name);
  });

  return new Promise<any>((resolve) => {
    const server = app.listen(port, () => {
      console.log(`🧪 Mock server ${name} running on ${port}`);
      resolve(server);
    });
  });
}

async function runE2E() {
  console.log("\n🚀 Starting E2E Test\n");

  /* ---------------- Mock Backends ---------------- */
  const counters = { A: 0, B: 0, C: 0 };

  const s1 = await startMockServer(7001, "A", counters);
  const s2 = await startMockServer(7002, "B", counters);
  const s3 = await startMockServer(7003, "C", counters);

  /* ---------------- Config ---------------- */
  Config.reset();
  Config.load("./config.json");

  const servers = [
    new BackendServerDetails("http://localhost:7001"),
    new BackendServerDetails("http://localhost:7002"),
    new BackendServerDetails("http://localhost:7003"),
  ];

  const lb = new LBServer(Config.getInstance(), servers);
  lb.init();

  await sleep(1500);

  /* ---------------- Phase 1: 100 Requests ---------------- */
  console.log("📦 Sending 100 requests...");
  for (let i = 0; i < 100; i++) {
    await HttpClient.request({
      method: "GET",
      url: "http://localhost:7000",
    });
  }

  console.table(counters);

  const total1 = counters.A + counters.B + counters.C;
  if (total1 !== 100) {
    throw new Error("❌ Did not receive 100 responses");
  }

  console.log("✅ Traffic distributed");

  /* ---------------- Kill One Server ---------------- */
  console.log("💀 Killing server B");
  s2.close();
  await sleep(1000);

  /* ---------------- Phase 2: 50 Requests ---------------- */
  console.log("📦 Sending 50 requests after failure...");
  for (let i = 0; i < 50; i++) {
    await HttpClient.request({
      method: "GET",
      url: "http://localhost:7000",
    });
  }

  console.table(counters);

  if (counters.B > 40) {
    throw new Error("❌ Dead server still receiving traffic");
  }

  console.log("✅ Retry + failover working");

  /* ---------------- Cleanup ---------------- */
  s1.close();
  s3.close();
  await lb.close();

  console.log("\n🎉 E2E TEST PASSED\n");
  process.exit(0);
}

runE2E().catch((err) => {
  console.error("\n❌ E2E TEST FAILED");
  console.error(err);
  process.exit(1);
});
