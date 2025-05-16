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
  origin:["http://localhost:5173", "https://hikmah-blog.web.app", "https://hikmah-blog.firebaseapp.com"],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());


// getting the server live 
app.get("/", (req, res)=>{
    res.send("Alhamdulillah, server is getting ready for assignment 11");

});
app.listen(port, ()=>{
    console.log(`app is listening to port ${port}`);
})
