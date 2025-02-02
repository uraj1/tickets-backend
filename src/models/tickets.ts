import { ObjectId } from "mongodb";

export interface TemplateSent {
  templateId: ObjectId;
  sentAt: Date;
}

export default class Ticket {
  constructor(
    public name: string,
    public email: string,
    public rollNumber: string,
    public contactNumber: string,
    public degree: string,
    public year: string,
    public branch: string,
    public stage: string,
    public createdAt: Date,
    public payment_verified: boolean,
    public ticket_given: boolean,
    public ticket_number?: string,
    public payment_proof?: string,
    public entry_marked?: boolean,
    public sheetId?: string,
    public templatesSent?: TemplateSent[],
    public last_email_sent_at?: Date,
    public id?: ObjectId
  ) {}
}