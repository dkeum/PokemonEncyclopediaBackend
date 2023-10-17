import { MongoClient } from 'mongodb';
let db

async function connectToDb(cb){
    const client = new MongoClient(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@pokedex.hdijcp3.mongodb.net/?retryWrites=true&w=majority`);
    await client.connect();
    db = client.db("Pokedex");
    cb();
}

export{db,connectToDb}