const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
app.use(cors());
app.use(express.json());
require('dotenv').config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eatq1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect();
    app.get('/users',async(req,res)=>{
        const userDB = client.db('userDB').collection('users');
        const cursor = userDB.find({});
        const result = await cursor.toArray();
        res.send(result);
    });
    app.post('/users',async(req,res)=>{
        const userDB = client.db('userDB').collection('users');
        const user = req.body;
        const result= await userDB.insertOne(user);
        res.send(result);
    });
    app.delete('/users/:id',async(req,res)=>{
        const id = req.params.id;
        const userDB = client.db('userDB').collection('users');
        const query = {_id: new ObjectId(id)};
        const result= await userDB.deleteOne(query);
        res.send(result);
    });

    // movies Api
    app.get('/movies',async(req,res)=>{
        const moviesDB = client.db('userDB').collection('movies');
        const cursor = moviesDB.find({});
        const result = await cursor.toArray();
        res.send(result);
    });

    app.get('/movies/:id',async(req,res)=>{
        const id = req.params.id;
        const moviesDB = client.db('userDB').collection('movies');
        const query = {_id: new ObjectId(id)};
        const result = await moviesDB.findOne(query);
        res.send(result);
    });


    app.post('/movies',async(req,res)=>{
        const moviesDB = client.db('userDB').collection('movies');
        const movie = req.body;
        const result= await moviesDB.insertOne(movie);
        res.send(result);
    });

    app.put('/movies/:id',async(req,res)=>{
        const id = req.params.id;
        const moviesDB = client.db('userDB').collection('movies');
        const updateDoc = { $set: req.body };
        const query = {_id: new ObjectId(id)};
        const result= await moviesDB.updateOne(query, updateDoc);
        res.send(result);
    });
    app.delete('/movies/:id',async(req,res)=>{
        const id = req.params.id;
        const moviesDB = client.db('userDB').collection('movies');
        const favsDB = client.db('userDB').collection('favs');
        const query = {_id: new ObjectId(id)};
        const query2 = {"movie._id": id};
        const result2= await favsDB.deleteMany(query2);
        const result= await moviesDB.deleteOne(query);
        res.send({result,result2});
    });
    // Favourites Movies list

    app.get('/favourites',async(req,res)=>{
        const moviesDB = client.db('userDB').collection('favs');
        const cursor = moviesDB.find({});
        const result = await cursor.toArray();
        res.send(result);
    })
    app.post('/favourites',async(req,res)=>{
        const moviesDB = client.db('userDB').collection('favs');
        
        const {movie,user} = req.body;
        const exitingMovies = await moviesDB.findOne({"movie._id": movie._id, "user.uid": user.uid});
  
        if(exitingMovies)
            {
            return res.status(400).send('Movie already in your favourites');
            }
        const result= await moviesDB.insertOne({movie,user});
        res.send(result);
    });
    app.delete('/favourites/:id',async(req,res)=>{
        const id = req.params.id;

        const moviesDB = client.db('userDB').collection('favs');
        const query = {_id: new ObjectId(id)};
        const result= await moviesDB.deleteOne(query);
        res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',async(req,res)=>{
    res.send('Hello World!');
})

app.listen(port,()=>{

    console.log(`Server is running on port ${port}`);
})