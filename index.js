const fs = require("fs/promises");
const axios = require("axios");
const AWS = require("aws-sdk");

// Configure AWS SDK using environment variables
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

async function readTaskPaperFile(fileUrl) {
  const response = await axios.get(fileUrl);
  const content = response.data;
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
  const params = {
    Bucket: "funbucket-57",
    Key: "destination.json",
  };

  // Get the existing records
  let records;
  try {
    const response = await s3.getObject(params).promise();
    records = JSON.parse(response.Body.toString());
  } catch (error) {
    if (error.code === "NoSuchKey") {
      records = [];
    } else {
      throw error;
    }
  }

  // Add the new record
  records.push(data);

  // Save the updated records to S3
  params.Body = JSON.stringify(records);
  await s3.putObject(params).promise();
}

async function main() {
  const taskPaperUrl = process.env.TASKPAPER_URL;
  const data = await readTaskPaperFile(taskPaperUrl);
  await logTaskProjectCounts(data);
}

module.exports = { main, s3 };
