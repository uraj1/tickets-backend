import express, { Request, Response } from "express";
import {
  getAllTickets,
  searchTickets,
  verifyTicketPayment,
  markTicketAsGiven,
  updateTicket,
  toggleEntryMarked,
  getAllEmailTemplates,
  getEmailTemplateById,
  getCurrentOffer,
  getLatestAnalytics,
} from "../utils/dbUtils"; // Assuming these functions are defined in your dbUtils
import { isLoggedIn } from "../middleware/isLoggedIn";
import multer from "multer";
import { uploadToS3 } from "../services/s3.service";
import { logger } from "../services/logger.service";
import { emailQueue } from "../services/bullmq.service";

const ticketAdminRouter = express.Router();
ticketAdminRouter.use(isLoggedIn);

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new Error("Invalid file type. Only images and PDFs are allowed.")
      );
    }
    cb(null, true);
  },
});

ticketAdminRouter.get("/whoami", (req: any, res: any) => {
  try {
    if (req.user) {
      res.status(200).json({
        ...req.user,
        isLoggedIn: true,
      });
    } else {
      res.status(401);
    }
  } catch (e) {
    console.log("Error:", e)
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

/**
 * Route to fetch paginated and optionally searched tickets
 * @route GET /tickets
 * @queryParam {number} page - The current page number (default: 1)
 * @queryParam {number} limit - The number of items per page (default: 10)
 * @returns {Object} Paginated ticket data or an error message
 */
ticketAdminRouter.get("/tickets", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const result = await getAllTickets(page, limit, skip);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in fetching tickets:", error);
    res.status(500).json({ message: "Error fetching tickets", error });
  }
});

/**
 * Route to search tickets explicitly using the searchTickets function
 * @route GET /tickets/fuzzy
 * @queryParam {string} search - The search query for fuzzy search
 * @returns {Array} Tickets matching the search query
 */
ticketAdminRouter.get("/tickets/fuzzy", async (req: Request, res: any) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchQuery = (req.query.query as string) || "";

    if (!searchQuery) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const result = await searchTickets(searchQuery, page, limit);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in searching tickets:", error);
    res.status(500).json({ message: "Error searching tickets", error });
  }
});

/**
 * Route to verify payment for a specific ticket
 * @route POST /admin/verify-payment/:ticketId
 * @param {string} ticketId - The ID of the ticket to verify payment for
 * @returns {Object} Updated ticket information or an error message
 */
ticketAdminRouter.post(
  "/verify-payment/:ticketId",
  async (req: Request, res: any) => {
    try {
      const { ticketId } = req.params;

      const result = await verifyTicketPayment(ticketId);

      if (!result) {
        return res
          .status(404)
          .json({ message: "Ticket not found or payment verification failed" });
      }

      res
        .status(200)
        .json({ message: "Payment verified successfully", ticket: result });
    } catch (error) {
      console.error("Error in verifying payment:", error);
      res.status(500).json({ message: "Error verifying payment", error });
    }
  }
);

/**
 * Route to mark a ticket as given (delivered)
 * @route POST /admin/mark-ticket-given/:ticketId
 * @param {string} ticketId - The ID of the ticket to mark as given
 * @returns {Object} Updated ticket information or an error message
 */
ticketAdminRouter.post(
  "/mark-ticket-given/:ticketId",
  async (req: Request, res: any) => {
    try {
      const { ticketId } = req.params;
      const { ticketNumber } = await req.body;

      const result = await markTicketAsGiven(ticketId, ticketNumber);

      if (!result) {
        return res.status(404).json({
          message: "Ticket not found or ticket already marked as given",
        });
      }

      res.status(200).json({
        message: "Ticket marked as given successfully",
        ticket: result,
      });
    } catch (error) {
      console.error("Error in marking ticket as given:", error);
      res.status(500).json({ message: "Error marking ticket as given", error });
    }
  }
);

/**
 * Route to toggle the entry_marked field of a ticket
 * @route POST /admin/toggle-entry-marked/:ticketId
 * @param {string} ticketId - The ID of the ticket
 * @returns {Object} Updated ticket information or an error message
 */
ticketAdminRouter.post(
  "/toggle-entry-marked/:ticketId",
  async (req: Request, res: any) => {
    try {
      const { ticketId } = req.params;

      const result = await toggleEntryMarked(ticketId);

      if (!result) {
        return res.status(404).json({
          message: "Ticket not found",
        });
      }

      res.status(200).json({
        message: "Entry marked status toggled successfully",
        ticket: result,
      });
    } catch (error) {
      console.error("Error toggling entry_marked:", error);
      res.status(500).json({ message: "Error toggling entry_marked", error });
    }
  }
);

ticketAdminRouter.post(
  "/tickets/finalize",
  upload.single("file"),
  async (req: Request, res: any) => {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ message: "ID is required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { mimetype, buffer, size } = req.file;

      if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
        return res.status(400).json({
          message: "Invalid file type. Only images and PDFs are allowed.",
        });
      }

      if (size > MAX_FILE_SIZE) {
        return res.status(400).json({
          message: `File size exceeds the limit of ${
            MAX_FILE_SIZE / (1024 * 1024)
          } MB.`,
        });
      }

      const fileName = `payment_proof_${id}`;
      const base64data = Buffer.from(buffer as any, "binary");
      const s3Response = await uploadToS3(
        "bucket.tedx",
        base64data,
        fileName,
        mimetype
      );

      await updateTicket(id, { stage: "2", payment_proof: s3Response });

      logger.info(`File upload for ID: ${id}`);
      res.status(200).json({
        message: "File uploaded successfully",
        id,
        payment_proof: s3Response,
      });
    } catch (error: any) {
      logger.error(`Error during file upload: ${error.message}`);
      res.status(500).json({
        message: "File upload or queueing failed",
        error: error.message,
      });
    }
  }
);

ticketAdminRouter.get(
  "/email-templates",
  async (req: Request, res: Response) => {
    try {
      const result = await getAllEmailTemplates();

      const templates = result.templates.map((template) => ({
        id: template._id.toString(),
        name: template.templateName,
        subject: template.subject,
        body: template.body,
      }));

      res.status(200).json({ total: result.total, templates });
    } catch (error) {
      console.error("Error fetching email templates:", error);
      res
        .status(500)
        .json({ message: "Error fetching email templates", error });
    }
  }
);

/**
 * Route to send bulk emails to tickets marked as given using the email template.
 * @route POST /admin/send-bulk-emails
 * @param {string} templateId - The ID of the email template to be used.
 * @returns {Object} Success or error message
 */
ticketAdminRouter.post("/send-bulk-emails", async (req: Request, res: any) => {
  try {
    const { templateId } = req.body;

    if (!templateId) {
      return res.status(400).json({
        message: "Template ID is required to send bulk emails.",
      });
    }

    // Fetch the email template by ID
    const template = await getEmailTemplateById(templateId);

    if (!template) {
      return res.status(404).json({
        message: `Email template with ID ${templateId} not found.`,
      });
    }

    const { subject, body } = template;

    await emailQueue.add("bulk-email", {
      subject,
      body,
      templateId,
    });

    logger.info(`Bulk email job added using template ${templateId}.`);

    res.status(200).json({
      message: `Bulk emails job added successfully using template ${templateId}.`,
    });
  } catch (error) {
    logger.error(`Error sending bulk emails: ${error}`);
    res.status(500).json({
      message: "Error processing bulk emails",
      error: error,
    });
  }
});

ticketAdminRouter.get("/ticket-analytics", async (_, res: Response) => {
  try {
    const data = await getLatestAnalytics();
    res.status(200).json(data);
  } catch (e) {
    console.log("Error:", e)
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

ticketAdminRouter.get("/offers/active", async (_, res: Response) => {
  try {
    const activeOffers = await getCurrentOffer();
    
    res.status(200).json(activeOffers);
  } catch (e) {
    console.error("Error fetching active offers:", e);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default ticketAdminRouter;
