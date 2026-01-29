import express from "express";

const app = express();
const PORT = 7000;

app.get("/", (req, res) => {
  res.send("Load Balancer v1.0");
});

app.listen(PORT, () => {
  console.log(`Load Balancer running on port ${PORT}`);
});
