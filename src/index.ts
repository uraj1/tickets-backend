import app from './app'
import { runAnalyticsScheduler } from './cron/analytics';
import { connectToDatabase } from './services/database.service';
import cron from "node-cron";

const PORT = 8080

async function main() {
  try {
    await connectToDatabase();
    
    cron.schedule("*/10 * * * *", () => {
      console.log("Running scheduled analytics update...");
      runAnalyticsScheduler();
    });
    
    const httpServer = app.listen(PORT, () => {
      console.log(`Server listening on PORT ${PORT}`)
    })
  } catch (error) {
    console.log()
  }
}

main();