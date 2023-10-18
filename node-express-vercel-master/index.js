import express from "express";
import 'dotenv/config';
import cors from "cors";
import { MongoClient } from "mongodb";

const connectionString = "mongodb+srv://vercel-admin-user:PQqaEIYhj9qMY5U3@pokedex.hdijcp3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(connectionString);
let conn;
try {
  conn = await client.connect();
} catch(e) {
  console.error(e);
}
let db = conn.db("Pokedex");


const app = express();
// app.use(cors(
//     {
//         origin: ["https://pokemonencyclopedia.vercel.app"],
//         methods: ["POST","PUT","GET"],
//         credentials: true
//     }
// ));

app.use(express.json());

app.get('/', async (req,res)=>{
    let collection = await db.collection("pokemonInfo");
    let results = await collection.find({})
    .limit(50)
    .toArray();
     res.send(results).status(200);
     res.send("Api is working");
})

//api/PokemonEncyclopedia_v1/pokemonencyclopedia/:pokemonId/
app.get('/api/:pokemonId/', async (req,res)=>{
    let {pokemonId} = req.params;

    // const pokemon = await db.collection('pokemonInfo')
    pokemonId = parseInt(pokemonId);

    try{

        const pokemon = await db.collection('pokemonInfo').findOne({pokemonId});
        if (pokemon) {
            // const upvoteIds = pokemon.upvotes || [];
            res.json(pokemon);
        } else {
            // res.sendStatus("404");
            res.send("Pokemon doesnt exist yet");
        }
    }
    catch(e){
        console.log(e);
        res.status(404).send("Database is having some difficulties");
    }

});

// app.put('/api/PokemonEncyclopedia_v1/pokemonencyclopedia/:pokemonId/upvote', async (req,res)=>{
//     let {pokemonId} = req.params;

//     // const pokemon = await db.collection('pokemonInfo')
//     pokemonId = parseInt(pokemonId);

//     const pokemon = await db.collection('pokemonInfo').findOne({pokemonId});

//     if(pokemon){
//         await db.collection('pokemonInfo').updateOne({pokemonId}, 
//         {
//             $inc: { upvotes: 1 }
//         });
//         const updatedPokemon = await db.collection('pokemonInfo').findOne({ pokemonId });
//         res.json(updatedPokemon);
//     }
//     else{
//         res.send("Pokemon doesn't exist").status(404);
//     }
// });

// app.post('/api/PokemonEncyclopedia_v1/pokemonencyclopedia/:pokemonId/comments', async (req,res)=>{

//     let {pokemonId} = req.params;
//     pokemonId = parseInt(pokemonId);
//     const {postedBy, text} = req.body;

//     await db.collection('pokemonInfo').updateOne({ pokemonId }, {
//         $push: { comments: { postedBy, text}  },
//     });

//     const pokemon = await db.collection('pokemonInfo').findOne({ pokemonId });

//     if(pokemon){
//         res.json(pokemon);
//     }
//     else{
//         try{
//         const newPokemon = {
//             pokemonId,
//             upvotes: 0,
//             comments: [{ postedBy, text }],
//         };
//         await db.collection('pokemonInfo').insertOne(newPokemon);
//         res.json(newPokemon);
//         }
//         catch(e) {
//             console.error(error);
//             res.status(500).send("Internal Server Error");
//         }
//     }

    
// });


const PORT = process.env.PORT || 8000; 
app.listen(PORT, () => {
    console.log('Server is listening on port ' + PORT);
});

