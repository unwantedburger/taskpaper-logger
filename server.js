const express = require("express");
const fs = require("fs/promises");
const cron = require("node-cron");
const { main } = require("./index");
const app = express();
const port = process.env.PORT || 3000;
const DATA_FILE = "destination.json";

app.use(express.json());

// API endpoint to get all records
app.get("/api/records", async (req, res) => {
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8");
    const records = JSON.parse(content);
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Error reading data file" });
  }
});

// API endpoint to trigger a new entry
app.post("/api/trigger", async (req, res) => {
  try {
    await main();
    res.json({ message: "New entry generated successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error generating a new entry." });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Read TaskPaper document and count tasks and projects
async function readTaskPaperFile(fileUrl) {
  const response = await axios.get(fileUrl);
  const content = response.data;
  const lines = content.split("\n");

  let date = new Date()
    .toISOString()
    .replace(/:\d\d\.\d{3}Z$/, "")
    .replace(/[-:]/g, "");

  let tasks = 0;
  let projects = 0;
  let done = 0;

  lines.forEach((line) => {
    const trimmedLine = line.trimStart();
    if (trimmedLine.endsWith(":")) {
      projects++;
    } else if (trimmedLine.startsWith("-") && !trimmedLine.includes("@done")) {
      tasks++;
    } else if (trimmedLine.includes("@done")) {
      done++;
    }
  });

  return { date, tasks, projects, done };
}

// Log task and project counts to a JSON file
async function logTaskProjectCounts(destinationFile, data) {
  let records = [];

  try {
    const content = await fs.readFile(destinationFile, "utf-8");
    records = JSON.parse(content);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  records.push(data);
  await fs.writeFile(
    destinationFile,
    JSON.stringify(records, null, 2),
    "utf-8"
  );
}

// Main function
async function main() {
  const taskProjectCounts = await readTaskPaperFile(process.env.TASKPAPER_URL);
  await logTaskProjectCounts(DATA_FILE, taskProjectCounts);
}

// Execute main function once every 24 hours
cron.schedule("0 0 * * *", main);
