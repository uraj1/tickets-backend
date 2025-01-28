import { Bool } from "aws-sdk/clients/clouddirectory";
import { ObjectId } from "mongodb";

export default class Ticket {
  constructor(
    public name: string,
    public email: String,
    public rollNumber: string,
    public contactNumber: string,
    public degree: string,
    public year: string,
    public branch: string,
    public stage: string,
    public createdAt: Date,
    public payment_verified: Bool,
    public ticket_given: Bool,
    public payment_proof?: string,
    public sheetId?: string,
    public id?: ObjectId
  ) {}
}
