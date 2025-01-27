import { connectToDatabase } from "../services/database.service";
import Ticket from "../models/tickets";
import { ObjectId } from "mongodb";

/**
 * Create a document in the `tickets` collection
 * @param data - The document data to insert
 * @returns The inserted document's ID
 */
export const createTicket = async (data: Ticket) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("tickets");
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
export const updateTicket = async (id: string, updateData: Record<string, any>) => {
  try {
    const db = await connectToDatabase();
    const collection = db.collection("tickets");
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
    const db = await connectToDatabase();
    const collection = db.collection("tickets");
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