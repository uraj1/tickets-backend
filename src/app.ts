import express from "express";
import CORS from "cors";
import bodyParser from "body-parser";
import { limiter } from "./config/rateLimit";
import ticketsRouter from "./routes/ticketRoute";
import logsRouter from "./routes/logsRouter";
import ticketAdminRouter from "./routes/ticketAdminRoute";

const app = express();

const corsOptions = {
  origin: true,
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(CORS(corsOptions));
app.get("/", (_, res) => {
  res.status(200).json({ message: "Server is healthy" });
});

app.use(limiter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));

app.use('/api/v1', ticketsRouter);
app.use('/logs', logsRouter);
app.use('/admin', ticketAdminRouter)

export default app;
