/**
 * Converts an ISO 8601 timestamp to a readable date and time format.
 * @param isoString - The ISO 8601 timestamp to convert.
 * @returns A string representing the readable date and time.
 */
export const formatReadableDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
  
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
      }
  
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      };
  
      return date.toLocaleString("en-US", options); // Adjust the locale as needed
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };  