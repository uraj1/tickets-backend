import { google } from "googleapis";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

const credentialsPath = "./fair-smoke-448809-s8-c3f78b08f95e.json";
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

/**
 * Authorizes the client using the credentials JSON file.
 */
async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));
  const { client_email, private_key } = credentials;
  const auth = new google.auth.JWT({
    email: client_email,
    key: private_key,
    scopes: SCOPES,
  });
  return auth;
}

/**
 * Appends data to the Google Sheet.
 * @param {string} range - The range to append to (e.g., "Sheet1").
 * @param {Array<Array<string | number>>} values - The rows to append.
 */
async function appendToSheet(
  range: string,
  values: Array<Array<string | number>>
) {
  const spreadsheetId = process.env.SPREADSHEET_ID;

  if (!spreadsheetId) {
    throw new Error("Spreadsheet ID not found in environment variables.");
  }

  const auth = await authorize();
  const sheets = google.sheets({ version: "v4", auth });

  const resource = {
    values,
  };

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "RAW", // Use "USER_ENTERED" if you want Google Sheets to interpret formulas or formats
    requestBody: resource,
  });

  console.log(`Appended rows: ${response.data.updates?.updatedRows || 0}`);
}

export { appendToSheet };
