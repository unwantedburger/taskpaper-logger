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

  let tasks = {
    total: 0,
    critical: 0,
    high: 0,
    mid: 0,
    low: 0,
    evokedset: 0,
    unprioritised: 0,
    done: 0,
  };
  let done = 0;
  let projects = 0;

  const valueStrings = ["@critical", "@high", "@mid", "@low"];

  lines.forEach((line) => {
    const trimmedLine = line.trimStart();
    if (trimmedLine.endsWith(":")) {
      projects++;
      return;
    } else if (trimmedLine.startsWith("-")) {
      // These are all the tasks.

      tasks.total++;

      // If it contains @done write to done and move on

      if (trimmedLine.includes("@done")) {
        tasks.done++;
        return;
      }

      // Loop through then valueStrings
      let categorized = false;
      for (let i = 0; i < valueStrings.length; i++) {
        // If the current valuestring is included in the task.
        if (trimmedLine.includes(valueStrings[i])) {
          console.log(trimmedLine);
          // Log it and break the loop.

          console.log(valueStrings[i].slice(1));
          tasks[valueStrings[i].slice(1)]++;
          categorized = true;
          break;
        }
      }
      // If it contains evokedset pris stick it in evokedest
      if (
        trimmedLine.includes("@e1") ||
        trimmedLine.includes("@e2") ||
        trimmedLine.includes("@e3")
      ) {
        // console.log("yas");
        tasks.evokedset++;
        categorized = true;
        return;
      } else {
        if (!categorized) {
          // If it's not part of the array, log it as unlabelled

          tasks.unprioritised++;
          return null;
        }
      }
    }
  });
  console.log({ tasks, projects });

  checkSum(tasks);

  return { date, tasks, projects };
}

function checkSum(tasks) {
  // Remove the total from the object.
  const { total, ...taskValues } = tasks;

  // Iterate over and sum them up
  let sum = 0;
  for (let key in taskValues) {
    sum += taskValues[key];
  }

  console.log({ sum, total });
  // Compare with total
  if (sum === total) {
    console.log("Sum is equal to total.");
  } else {
    console.log("Sum is not equal to total.");
  }
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
