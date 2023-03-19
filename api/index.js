const fs = require("fs/promises");
const axios = require("axios");
const express = require("express");
const cron = require("node-cron");
const { readTaskPaperFile, logTaskProjectCounts } = require("./../index");
const config = require("./../config");

const app = express();
const port = 3005;

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

async function main() {
  const taskPaperUrl = config.TASKPAPER_URL;
  const data = await readTaskPaperFile(taskPaperUrl);
  await logTaskProjectCounts(data);
}

// Schedule the cron job (runs every day at midnight)
cron.schedule("0 0 * * *", async () => {
  console.log("Cron job triggered");
  await main();
});
