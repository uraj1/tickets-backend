import app from './app'
import { runAnalyticsScheduler } from './cron/analytics';
import { connectToDatabase } from './services/database.service';
import { CronJob } from 'cron';

const PORT = 8080

async function main() {
  try {
    await connectToDatabase();
    
    const job = new CronJob(
      '*/5 * * * *',
      function () {
        runAnalyticsScheduler();
      },
      null,
      true,
      'America/Los_Angeles'
    );
    
    const httpServer = app.listen(PORT, () => {
      console.log(`Server listening on PORT ${PORT}`)
    })
  } catch (error) {
    console.log()
  }
}

main();