import { Int32, ObjectId } from "mongodb";

export default class Analytics {
  constructor(
    public totalTickets: Int32,
    public completedTicketsStage2: string,
    public verifiedPayments: Int32,
    public entriesMarked: Int32,
    public timestamp: Date,
    public totalRevenue: Int32,
    public _id?: ObjectId
  ) {}
}