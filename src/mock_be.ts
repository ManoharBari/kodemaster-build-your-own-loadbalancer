import express from "express";

const app = express();

app.all("*", (req, res) => {
  console.log("Request received on LIVE server");
  res.send("LIVE");
});

app.listen(8081, () => {
  console.log("LIVE backend running on 8081");
});
