const fs = require("fs/promises");
const axios = require("axios");
const config = require("./config.js");

async function readTaskPaperFile(fileUrl) {
  const content = await fs.readFile(fileUrl, "utf-8");
  const lines = content.split("\n");

  let date = new Date().toISOString().slice(0, 16).replace("T", "-");

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

async function logTaskProjectCounts(data) {
  const destinationFile = "destination.json";

  // Get the existing records
  let records;
  try {
    const response = await fs.readFile(destinationFile, "utf-8");
    records = JSON.parse(response);
  } catch (error) {
    if (error.code === "ENOENT") {
      records = [];
    } else {
      throw error;
    }
  }

  // Add the new record
  records.push(data);

  // Save the updated records to the local file
  await fs.writeFile(destinationFile, JSON.stringify(records, null, 2));
}

async function main() {
  const taskPaperUrl = config.TASKPAPER_URL;
  const data = await readTaskPaperFile(taskPaperUrl);
  await logTaskProjectCounts(data);
}

module.exports = { main };
