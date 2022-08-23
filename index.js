const express = require("express");
const cors =require("cors");
const app= express();
const path = require('path')
const jwt = require("jsonwebtoken");
const userRoute=require("./routes/userRoutes");
const commentroutes=require("./routes/commentroutes");
const postroutes=require("./routes/postroutes");

const { dirname } = require("path");
const PORT = process.env.port
app.set(("port", process.env.PORT || 4000));
app.use(express.json());
app.use(cors());

app.get("/", (req,res)=>{
    res.sendFile(__dirname + "/public/index.html")
    // res.json({
    //     msg:"Hello you"
    // }),
    
})

app.use("/users" ,userRoute);

app.use("/post" ,postroutes);
app.use("/post" ,commentroutes);
app.listen(PORT ,(err) => {
    if(err) throw err
    console.log(`serve running at http://localhost:${PORT}`)
})