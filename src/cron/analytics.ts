import { saveAnalytics } from "../utils/dbUtils";
import { logger } from "../services/logger.service";

export const runAnalyticsScheduler = async () => {
  try {
    await saveAnalytics();
  } catch (error) {
    logger.info(`Error in saving analytics`, error);
    console.error("Error running analytics scheduler:", error);
  }
};
