import { emailQueue } from "./bullmq.service";
import { logger } from "./logger.service";

// This function adds an email job to the queue
export const addEmailToQueue = async (
  ticketId: string,
  subject: string,
  body: string
) => {
  try {
    await emailQueue.add("bulk-email", {
      ticketId,
      subject,
      body,
    });

    logger.info(`Email job added to queue for Ticket ID: ${ticketId}`);
  } catch (error) {
    logger.error(
      `Failed to add email job to queue for Ticket ID: ${ticketId}`,
      {
        error: error,
      }
    );
    throw error;
  }
};
