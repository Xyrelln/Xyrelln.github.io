import { ObjectId } from "mongodb";

export default interface Favorites {
    city: string;
    state: string;
    id?: ObjectId;
}