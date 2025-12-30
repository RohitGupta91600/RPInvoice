import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI!

export const client = new MongoClient(uri)
