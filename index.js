const express = require("express");
const cors =require("cors");
const app= express();
const path = require('path')
const jwt = require("jsonwebtoken");
const userRoute=require("./routes/userRoutes");
const commentroutes=require("./routes/commentroutes");
const postroutes=require("./routes/postroutes");
// const Followersroutes=require("./routes/Followersroutes")
require("dotenv").config()
const { dirname } = require("path");
const PORT = process.env.PORT
app.set(("port",PORT || 4000));
app.use(express.json());
app.use(cors(), express.static("public"));

app.get("/", (req,res)=>{
    res.sendFile(__dirname + "/public/index.html")
    // res.json({
    //     msg:"Hello you"
    // }),
    
})

app.use("/users" ,userRoute);

app.use("/post" ,postroutes);
app.use("/comments" ,commentroutes);
// app.use("/followers" ,Followersroutes);
// app.use(cors({
//     origin: ['http://127.0.0.1:8080', 'http://localhost:8080'],
//     credentials: true
//  }));
app.listen(PORT ,(err) => {
    if(err) throw err
    console.log(`serve running at http://localhost:${PORT}`)
})
const {errorHandling} = require('./middleware/ErrorHandling');

app.use(errorHandling);