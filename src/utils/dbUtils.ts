import { db } from "../services/database.service";
import Ticket from "../models/tickets";
import { ObjectId } from "mongodb";

const getCollection = () => {
  if (!db) {
    throw new Error(
      "Database not initialized. Ensure `connectToDatabase()` is called before using `db`."
    );
  }
  return db.collection("tickets");
};

/**
 * Create a document in the `tickets` collection
 * @param data - The document data to insert
 * @returns The inserted document's ID
 */
export const createTicket = async (data: Ticket) => {
  try {
    const collection = getCollection();
    const result = await collection.insertOne(data);
    console.log("Ticket inserted with ID:", result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw error;
  }
};

/**
 * Update a document in the `tickets` collection
 * @param id - The ID of the document to update
 * @param updateData - The data to update
 * @returns The result of the update operation
 */
export const updateTicket = async (
  id: string,
  updateData: Record<string, any>
) => {
  try {
    const collection = getCollection();
    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: updateData };
    const result = await collection.updateOne(filter, updateDoc);
    console.log(
      `Matched ${result.matchedCount} ticket(s), Modified ${result.modifiedCount} ticket(s)`
    );
    return result;
  } catch (error) {
    console.error("Error updating ticket:", error);
    throw error;
  }
};

/**
 * Get a document from the `tickets` collection by ID
 * @param id - The ID of the document to retrieve
 * @returns The ticket document, or null if not found
 */
export const getTicketById = async (id: string) => {
  try {
    const collection = getCollection();
    const filter = { _id: new ObjectId(id) };
    const ticket = await collection.findOne(filter);

    if (!ticket) {
      console.log(`Ticket with ID ${id} not found`);
      return null;
    }
    return ticket;
  } catch (error) {
    console.error("Error retrieving ticket:", error);
    throw error;
  }
};

/**
 * Perform a fuzzy search on the tickets collection
 * @param searchQuery - The query string to search for
 * @returns The search filter for MongoDB
 */
export const searchTickets = async (
  searchQuery: string,
  page: number,
  limit: number
) => {
  try {
    const collection = getCollection();

    // Calculate the number of documents to skip for pagination
    const skip = (page - 1) * limit;

    // Pipeline for the search operation
    const pipeline = [
      {
        $search: {
          text: {
            query: searchQuery,
            path: ["stage", "name", "email", "rollNumber", "contactNumber", "ticket_number"],
            fuzzy: {},
          },
        },
      },
      {
        $project: {
          stage: 1,
          name: 1,
          email: 1,
          rollNumber: 1,
          contactNumber: 1,
          degree: 1,
          year: 1,
          branch: 1,
          createdAt: 1,
          payment_proof: 1,
          score: { $meta: "searchScore" },
        },
      },
      {
        $sort: { score: -1 },
      },
      {
        $skip: skip, // Skip documents based on the page and limit
      },
      {
        $limit: limit, // Limit the number of documents per page
      },
    ];

    // Get the results from the aggregation pipeline
    const result = await collection.aggregate(pipeline).toArray();
    const total = result.length;

    return {
      total,
      page,
      limit,
      tickets: result,
    };
  } catch (error) {
    console.error("Error searching tickets:", error);
    throw error;
  }
};

/**
 * Get all tickets with pagination and fuzzy search functionality
 * @param page - The current page number
 * @param limit - The number of tickets per page
 * @param skip - The number of documents to skip for pagination
 * @returns The tickets matching the search query with pagination
 */
export const getAllTickets = async (
  page: number,
  limit: number,
  skip: number
) => {
  try {
    const collection = getCollection();

    const totalTickets = await collection.countDocuments();
    const tickets = await collection
      .find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray();

    return {
      total: totalTickets,
      page,
      limit,
      tickets,
    };
  } catch (error) {
    console.error("Error fetching paginated tickets:", error);
    throw error;
  }
};

/**
 * Verify the payment for a specific ticket
 * @param ticketId - The ID of the ticket to verify payment for
 * @returns The updated ticket information
 */
export const verifyTicketPayment = async (ticketId: string) => {
  try {
    const collection = getCollection();

    const filter = { _id: new ObjectId(ticketId) };

    const ticket = await collection.findOne(filter);
    if (!ticket) {
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    if (ticket.stage === "1" && !ticket.payment_proof) {
      throw new Error("Payment proof is required to verify payment at stage 1");
    }

    const updateDoc = { $set: { payment_verified: true } };

    const result = await collection.updateOne(filter, updateDoc);

    if (result.modifiedCount === 0) {
      throw new Error("Payment verification update failed");
    }

    const updatedTicket = await collection.findOne(filter);
    return updatedTicket;
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};

/**
 * Mark the ticket as given (delivered)
 * @param ticketId - The ID of the ticket to mark as given
 * @returns The updated ticket information
 */
export const markTicketAsGiven = async (
  ticketId: string,
  ticketNumber: string
) => {
  try {
    const collection = getCollection();

    const filter = { _id: new ObjectId(ticketId), payment_verified: true };

    const updateDoc = {
      $set: { ticket_given: true, ticket_number: ticketNumber },
    };

    const result = await collection.updateOne(filter, updateDoc);

    if (result.matchedCount === 0) {
      throw `Ticket payment is not verified`;
    }

    const updatedTicket = await collection.findOne({
      _id: new ObjectId(ticketId),
    });
    return updatedTicket;
  } catch (error) {
    console.error("Error marking ticket as given:", error);
    throw error;
  }
};

export const toggleEntryMarked = async (ticketId: string) => {
  try {
    const collection = getCollection();

    // Find the current state of entry_marked
    const ticket = await collection.findOne({ _id: new ObjectId(ticketId) });

    if (!ticket) {
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    const newEntryMarkedValue = !ticket.entry_marked; // Toggle between true and false

    const updateDoc = {
      $set: { entry_marked: newEntryMarkedValue },
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(ticketId) },
      updateDoc
    );

    if (result.matchedCount === 0) {
      throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    const updatedTicket = await collection.findOne({
      _id: new ObjectId(ticketId),
    });
    return updatedTicket;
  } catch (error) {
    console.error("Error toggling entry_marked:", error);
    throw error;
  }
};
