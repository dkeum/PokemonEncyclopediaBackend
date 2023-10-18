import express from "express";
import 'dotenv/config';
import cors from "cors";
import { MongoClient } from "mongodb";

import admin from 'firebase-admin';
import fs from 'fs';


const connectionString = "mongodb+srv://vercel-admin-user:PQqaEIYhj9qMY5U3@pokedex.hdijcp3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(connectionString);
let conn;
try {
  conn = await client.connect();
} catch(e) {
  console.error(e);
}

try{
    const credentials = JSON.parse(
        fs.readFileSync('./credentials.json')
    );
    admin.initializeApp({
        credential: admin.credential.cert(credentials),
    });
    }
catch(e){
    console.error(e);
}



const app = express();
app.use(cors(
    {
        origin: ["https://pokemon-encyclopedia-v1.vercel.app","http://localhost:3000"],
        methods: ["POST","PUT","GET"],
        credentials: true
    }
));

app.use(express.json());


app.get('/', async (req,res)=>{

     res.send("API is working")
})

app.use(async (req, res, next) => {
    const { authtoken } = req.headers;

    if (authtoken) {
        try {
            req.user = await admin.auth().verifyIdToken(authtoken);
        } catch (e) {
            return res.sendStatus(400);
        }
    }

    req.user = req.user || {};
    next();
});

app.get('/api/PokemonEncyclopedia_v1/pokemonencyclopedia/:pokemonId/', async (req,res)=>{
    let {pokemonId} = req.params;

    // const pokemon = await db.collection('pokemonInfo')
    pokemonId = parseInt(pokemonId);

    try{
        let db = conn.db("Pokedex");
        const pokemon = await db.collection('pokemonInfo').findOne({pokemonId});
        if (pokemon) {
            // const upvoteIds = pokemon.upvotes || [];
            res.json(pokemon);
        } else {
            res.send("Pokemon doesnt exist yet");
        }
    }
    catch(e){
        console.log(e);
        res.status(404).send("Database is having some difficulties");
    }

});

app.use((req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
});

app.put('/api/PokemonEncyclopedia_v1/pokemonencyclopedia/:pokemonId/upvote', async (req,res)=>{
    let {pokemonId} = req.params;

    pokemonId = parseInt(pokemonId);

    try{
        let db = conn.db("Pokedex");
        const pokemon = await db.collection('pokemonInfo').findOne({pokemonId});
        if(pokemon){
            await db.collection('pokemonInfo').updateOne({pokemonId}, 
            {
                $inc: { upvotes: 1 }
            });
            const updatedPokemon = await db.collection('pokemonInfo').findOne({ pokemonId });
            res.json(updatedPokemon);
        }
        else{
            res.send("Pokemon doesn't exist").status(404);
        }
    }catch(e){
        console.log(e);
        res.status(404).send("Database is having some difficulties");
    }
  
});

app.use((req, res, next) => {
    if (req.user) {
        next();
    } else {
        res.sendStatus(401);
    }
});

app.post('/api/PokemonEncyclopedia_v1/pokemonencyclopedia/:pokemonId/comments', async (req,res)=>{

    let {pokemonId} = req.params;
    pokemonId = parseInt(pokemonId);
    const {postedBy, text} = req.body;
    
    let db = conn.db("Pokedex");
    await db.collection('pokemonInfo').updateOne({ pokemonId }, {
        $push: { comments: { postedBy, text}  },
    });

    const pokemon = await db.collection('pokemonInfo').findOne({ pokemonId });

    if(pokemon){
        res.json(pokemon);
    }
    else{
        try{
        const newPokemon = {
            pokemonId,
            upvotes: 0,
            comments: [{ postedBy, text }],
        };
        await db.collection('pokemonInfo').insertOne(newPokemon);
        res.json(newPokemon);
        }
        catch(e) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    }

    
});


const PORT = process.env.PORT || 8000; 
app.listen(PORT, () => {
    console.log('Server is listening on port ' + PORT);
});

