const fs = require("fs/promises");
const axios = require("axios");
const config = require("./config");

async function readTaskPaperFile(fileUrl) {
  let content;

  if (fileUrl.startsWith("http")) {
    const response = await axios.get(fileUrl);
    content = response.data;
  } else {
    content = await fs.readFile(fileUrl, "utf-8");
  }

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
  const destination = config.DESTINATION_JSON;

  let records;
  try {
    const fileContent = await fs.readFile(destination, "utf-8");
    records = JSON.parse(fileContent);
  } catch (error) {
    if (error.code === "ENOENT") {
      records = [];
    } else {
      throw error;
    }
  }

  records.push(data);

  await fs.writeFile(destination, JSON.stringify(records, null, 2));
}

async function main() {
  const taskPaperUrl = config.TASKPAPER_URL;
  const data = await readTaskPaperFile(taskPaperUrl);
  await logTaskProjectCounts(data);
}

module.exports = { readTaskPaperFile, logTaskProjectCounts };
