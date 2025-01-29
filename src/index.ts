import app from './app'
import { logger } from "./services/logger.service";
import { connectToDatabase } from './services/database.service';

const PORT = 8080

async function main() {
  try {
    await connectToDatabase();
    const httpServer = app.listen(PORT, () => {
      console.log(`Server listening on PORT ${PORT}`)
    })
  } catch (error) {
    console.log()
  }
}

main();