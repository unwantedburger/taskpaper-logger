const fs = require("fs-extra");
const axios = require("axios");
const DATA_FILE = "destination.json";

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

// Export main function
module.exports = { main };
