// External Dependencies
import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

// Global Vairables
export const collections: { tickets?: mongoDB.Collection } = {};

// Initialize Connection
export async function connectToDatabase() {
  dotenv.config();

  const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    process.env.MONGO_URI as string
  );

  await client.connect();

  const db: mongoDB.Db = client.db(process.env.DB_NAME);

  const ticketCollection: mongoDB.Collection = db.collection(
    process.env.TICKET_COLLECTION_NAME as string
  );

  collections.tickets = ticketCollection;
  console.log(
    `Successfully connected to database: ${db.databaseName} and collection: ${ticketCollection.collectionName}`
  );
  return db;
}
