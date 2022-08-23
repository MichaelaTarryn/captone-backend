const app = require("express");
const express = require('express')
const middleware=require("../middleware/auth");
const router = express.Router();
const connection = require("../config/db.connection");
const bodyParser= require('body-parser');
const jwt =require("jsonwebtoken");

//get all comments
  
router.get("/",(req,res) =>{
    try{
       connection.query (" SELECT * FROM comments",(err,results)=>{
           if(err) throw err
           res.send(results);
       })
    }
    catch(error){
       console.log(error)
       res.status(400).send (error); 
    }
   });
  //add a comment 
  router.post('/:id',middleware,bodyParser.json() ,async (req,res) =>{
    try{
         const bd=req.body

   const strC=`INSERT INTO comments(description, commentPost, commentuserId)  VALUES(?, ?, ?)`

   connection.query(strC,  [bd.description, req.params.id, req.user.id],
    (err, results) => {
      if (err) throw err;
      res.json({
        msg:"succeessfully add a comment !"
      })
      ;
    })
    }catch(error) {
        res.status(400).send(error)
    }
   
})
module.exports = router