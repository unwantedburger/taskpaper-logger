const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const main = require("../index").main;
const s3 = require("../index").s3;

app.use(express.json());

app.get("/api/records", async (req, res) => {
  try {
    const params = {
      Bucket: "funbucket-57",
      Key: "destination.json",
    };
    const response = await s3.getObject(params).promise();
    res.json(JSON.parse(response.Body.toString()));
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

// Access key AKIAUYFIKSCL7BI62N3R
// Secret access key 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
