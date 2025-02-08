import { ObjectId } from "mongodb";

export default class Admins {
  constructor(
    public email: string,
    public password: string,
    public isSuperAdmin: string,
    public createdAt: Date,
    public hasOnboarded: boolean,
    public _id?: ObjectId
  ) {}
}