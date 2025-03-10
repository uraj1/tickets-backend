import { ObjectId } from "mongodb";

interface NoteItem {
    description: string;
    toggle?: boolean;
    tags?: Record<string, boolean>;
}

export default class Note {
    constructor(
        public heading: string,
        public items: NoteItem[] = [],
        public author: string,
        public createdBy: ObjectId,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date(),
        public isArchived: boolean = false,
        public _id?: ObjectId
    ) {}
}
