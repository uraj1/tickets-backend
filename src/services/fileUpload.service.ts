import { progressQueue } from "./bullmq.service";
import { logger } from "./logger.service";

export const addFileUploadToQueue = async (
  id: string,
  buffer: Buffer,
  fileName: string,
  mimetype: string
) => {
  try {
    await progressQueue.add("finalize", {
      id,
      buffer,
      fileName,
      mimetype,
    });

    logger.info(`File upload added to queue for ID: ${id}`);
  } catch (error) {
    logger.error(`Failed to add file upload to queue for ID: ${id}`, {
      error: error,
    });
    throw error;
  }
};
