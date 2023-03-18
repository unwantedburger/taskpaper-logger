const fs = require("fs-extra");
const cron = require("node-cron");
const readline = require("readline");

const CONFIG_FILE_NAME = "config.json";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// Configuration wizard
async function configurationWizard() {
  const targetFile = await askQuestion(
    "Please enter the path to the TaskPaper file: "
  );
  const destinationFile = await askQuestion(
    "Please enter the path to the destination file: "
  );

  const config = {
    targetFile,
    destinationFile,
  };

  await fs.writeJson(CONFIG_FILE_NAME, config);
  rl.close();
}

// Read TaskPaper document and count tasks and projects
async function readTaskPaperFile(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n");

  let date = new Date().toISOString().slice(2, 16);
  // .replace("T", "_")
  // .replace(":", ":");

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

// Log task and project counts to a file as a JSON object
async function logTaskProjectCounts(destinationFile, data) {
  const jsonData = JSON.stringify(data);
  await fs.appendFile(destinationFile, jsonData + ",\n", "utf-8");
}

// Main function to execute the scheduled task
async function main() {
  const config = await fs.readJson(CONFIG_FILE_NAME);
  const { targetFile, destinationFile } = config;

  const taskProjectCounts = await readTaskPaperFile(targetFile);
  await logTaskProjectCounts(destinationFile, taskProjectCounts);
}

// ...

// If the configuration file does not exist, run the configuration wizard
fs.pathExists(CONFIG_FILE_NAME)
  .then((exists) => {
    if (!exists) {
      return configurationWizard();
    }
  })
  .then(() => {
    // Run the main function directly to log tasks and projects immediately
    main();
  });

// // If the configuration file does not exist, run the configuration wizard
// fs.pathExists(CONFIG_FILE_NAME)
//   .then((exists) => {
//     if (!exists) {
//       return configurationWizard();
//     }
//   })
//   .then(() => {
//     // Schedule the main function to run every 24 hours
//     cron.schedule("0 0 * * *", main);
//   });
