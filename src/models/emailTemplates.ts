import { ObjectId } from "mongodb";

export default class EmailTemplates {
  constructor(
    public templateName: string,
    public subject: string,
    public body: string,
    public thumbnail?: string,
    public id?: ObjectId
  ) {}
}