import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const logsRouter = express.Router();

logsRouter.get("/", async (_, res: Response) => {
  try {
    const logFilePath = path.join("./", "job-logs.txt");

    fs.readFile(logFilePath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading the log file:", err.message);
        return res.status(500).json({ message: "Error reading logs" });
      }

      const logEntries = data.split("\n").map((line, index) => {
        const parts = line.split(" ");
        const timestamp = parts[0] + " " + parts[1];
        const level = parts[1];
        const message = parts.slice(3).join(" ");

        const date = new Date(timestamp);
        let isoTimestamp = "";
        if (date instanceof Date && !isNaN(date.getTime())) {
          isoTimestamp = date.toISOString();
        } else {
          isoTimestamp = new Date().toISOString();
        }

        return {
          _id: index.toString(),
          timestamp: isoTimestamp,
          level: level?.split(':')[0],
          message: message,
        };
      });

      res.status(200).json({ logs: logEntries });
    });
  } catch (err: any) {
    console.error("Unexpected error:", err.message);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});

export default logsRouter;
