import { Queue, Worker, Job } from "bullmq";
import { logger } from "./logger.service";
import { uploadToS3 } from "./s3.service";
import { getTicketById, updateTicket } from "../utils/dbUtils";
import { formatReadableDate } from "../utils/timeUtils";
import { appendToSheet } from "../utils/sheets";

const connection = { host: "localhost", port: 6379 };

export const progressQueue = new Queue("finalize", { connection });

const worker = new Worker(
  "finalize",
  async (job: Job) => {
    const { id, buffer, fileName, mimetype } = job.data;
    logger.info(`Processing file upload for ID: ${id}`);

    try {
      var base64data = Buffer.from(buffer, "binary");
      const s3Response = await uploadToS3(
        "bucket.tedx",
        base64data,
        fileName,
        mimetype
      );

      logger.info(`File uploaded to S3 for ID: ${id}. URL: ${s3Response}`);

      await updateTicket(id, { stage: "2", payment_proof: s3Response });
      const result = await getTicketById(id);
      const row = {
        Timestamp: formatReadableDate(result?.createdAt) || "undefined",
        Email: result?.email || "undefined",
        Name: result?.name || "undefined",
        "Roll Number": result?.rollNumber || "undefined",
        "Contact Number": result?.contactNumber || "undefined",
        Course: result?.degree || "undefined",
        Year: result?.year || "undefined",
        Branch: result?.branch || "undefined",
        payment_proof: result?.payment_proof || "null",
      };

      const values = Object.values(row);

      const sheetRange = "Sheet1!A1";

      const sheetValues = [values];
      await appendToSheet(sheetRange, sheetValues);

      logger.info(`Database updated for ID: ${id}`);
    } catch (error) {
      logger.error(`Error processing file upload for ID: ${id}: ${error}`);
      throw error;
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  logger.info(`Job ${job.id} completed successfully.`);
});

worker.on("failed", (job, err) => {
  logger.error(`Job ${job?.id} failed with error: ${err.message}`);
});
