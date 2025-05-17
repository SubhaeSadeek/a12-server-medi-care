require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5001;

const app = express();

// adding middleware
app.use(cors({
  origin:["http://localhost:5173"],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

//  id: mediCampManage
// pass: Si77MSrAvzCsHe3k



const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@cluster0.i6qlf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

     const database = client.db("mediCampManage");
     const campCollection = database.collection("camps");
     
    app.get("/popular-camps", async (req, res) => {
      const result = await campCollection
        .find()
        .sort({ participantCount: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// getting the server live 
app.get("/", (req, res)=>{
    res.send("Alhamdulillah, server is getting ready for assignment 12");

});
app.listen(port, ()=>{
    console.log(`app is listening to port ${port}`);
})
