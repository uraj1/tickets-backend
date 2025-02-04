import { ObjectId } from 'mongodb'

export default class Offers {
    constructor(
        public offer: string,
        public active: boolean,
        public price: string,
        public _id?: ObjectId
    ) {}
}
