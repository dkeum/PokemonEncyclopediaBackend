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



const app = express();
app.use(cors(
    {
        origin: ["https://pokemonencyclopedia.vercel.app"],
        methods: ["POST","PUT","GET"],
        credentials: true
    }
));

app.use(express.json());

app.get('/', async (req,res)=>{

     res.send("API is working")
})


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
            // res.sendStatus("404");
            res.send("Pokemon doesnt exist yet");
        }
    }
    catch(e){
        console.log(e);
        res.status(404).send("Database is having some difficulties");
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

