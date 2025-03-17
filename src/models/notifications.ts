import { ObjectId } from "mongodb";

export default class Notification {
  constructor(
    public ts: Date,
    public message: string,
    public read_by: ObjectId[],
    public _id?: ObjectId
  ) {}
}