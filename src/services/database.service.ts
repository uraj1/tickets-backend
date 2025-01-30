import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

let db: mongoDB.Db | null = null;
let client: mongoDB.MongoClient | null = null;

export async function connectToDatabase(): Promise<mongoDB.Db> {
  if (db) {
    console.log("Using existing database connection");
    return db;
  }

  try {
    client = new mongoDB.MongoClient(process.env.MONGO_URI as string, {
      maxPoolSize: 10,
      minPoolSize: 5,
    });

    await client.connect();
    db = client.db(process.env.DB_NAME);
    console.log(`Connected to database: ${db.databaseName}`);

    return db;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

// Function to close the connection gracefully
export async function closeDatabaseConnection() {
  if (client) {
    await client.close();
    console.log("Database connection closed");
  }
}

export { db };
