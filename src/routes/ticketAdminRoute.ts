import express, { Request, Response } from "express";
import { getAllTickets, searchTickets, verifyTicketPayment, markTicketAsGiven } from "../utils/dbUtils"; // Assuming these functions are defined in your dbUtils

const ticketAdminRouter = express.Router();

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

    const skip = (page - 1) * limit;

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
ticketAdminRouter.post("/verify-payment/:ticketId", async (req: Request, res: any) => {
  try {
    const { ticketId } = req.params;
    
    const result = await verifyTicketPayment(ticketId);
    
    if (!result) {
      return res.status(404).json({ message: "Ticket not found or payment verification failed" });
    }
    
    res.status(200).json({ message: "Payment verified successfully", ticket: result });
  } catch (error) {
    console.error("Error in verifying payment:", error);
    res.status(500).json({ message: "Error verifying payment", error });
  }
});

/**
 * Route to mark a ticket as given (delivered)
 * @route POST /admin/mark-ticket-given/:ticketId
 * @param {string} ticketId - The ID of the ticket to mark as given
 * @returns {Object} Updated ticket information or an error message
 */
ticketAdminRouter.post("/mark-ticket-given/:ticketId", async (req: Request, res: any) => {
  try {
    const { ticketId } = req.params;
    const { ticketNumber } = await req.body
    
    const result = await markTicketAsGiven(ticketId, ticketNumber);
    
    if (!result) {
      return res.status(404).json({ message: "Ticket not found or ticket already marked as given" });
    }
    
    res.status(200).json({ message: "Ticket marked as given successfully", ticket: result });
  } catch (error) {
    console.error("Error in marking ticket as given:", error);
    res.status(500).json({ message: "Error marking ticket as given", error });
  }
});

export default ticketAdminRouter