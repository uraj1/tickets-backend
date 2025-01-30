import { ObjectId } from "mongodb";

export default class Admins {
  constructor(
    public email: string,
    public hashedPassword: string,
    public _id?: ObjectId
  ) {}
}