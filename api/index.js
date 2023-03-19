const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const main = require("../index").main;
const fs = require("fs/promises");
const config = require("./../config");

app.use(express.json());

app.get("/api/records", async (req, res) => {
  try {
    const data = await fs.readFile(config.DESTINATION_JSON, "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/trigger", async (req, res) => {
  try {
    await main();
    res
      .status(200)
      .json({ message: "TaskPaper logging triggered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
