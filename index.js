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
     const regiterCampCollection = database.collection("registerCamp");
     const userCollection = database.collection("user")
     
    // ?JWT token
     app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    // token varify middleware
    
    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "forbidden! access denied" });
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "You dont have access Token! Unauthorized attempt!" });
        }
        req.decoded = decoded;
        next();
      });
    };
    // verify admin
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      next();
    };
    app.get("/camps", async(req, res)=>{
      const cursor =  campCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get("/camp/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campCollection.findOne(query);
      res.send(result);
    });
     // join camp/ registered camp related apis
    app.post("/registered-camps", async (req, res) => {
      const registeredCamp = req.body;
      const { campId } = registeredCamp;
      const result = await regiterCampCollection.insertOne(
        registeredCamp
      );
      const updateResult = await campCollection.updateOne(
        { _id: new ObjectId(campId) },
        {
          $inc: {
            participantCount: 1,
          },
        }
      );
      res.send(result);
    });
     
    app.get("/popular-camps", async (req, res) => {
      const result = await campCollection
        .find()
        .sort({ participantCount: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });




    // User add to DB
    // users related api

     app.get("/user/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });
    app.post("/user", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

      app.patch("/update-user/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const { name, photoURL, phoneNumber, address } = req.body;
      const filter = { email: email };
      const updateDoc = {
        $set: {
          name,
          photoURL,
          phoneNumber,
          address,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // admin access
    app.get("/user/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: "access denied!" });
      }
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
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
