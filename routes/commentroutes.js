const app = require("express");
const express = require('express')
const middleware=require("../middleware/auth");
const router = express.Router();
const connection = require("../config/db.connection");
const bodyParser= require('body-parser');
const jwt =require("jsonwebtoken");
  
  
  //add a comment 
  router.post('/:id/comments',middleware,bodyParser.json() ,async (req,res) =>{
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
})
module.exports = router