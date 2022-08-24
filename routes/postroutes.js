const app = require("express");
const express = require('express')
const router = express.Router();
const connection = require("../config/db.connection")
const bodyParser= require('body-parser');
const {compare,hash}=require("bcrypt");
const middleware=require("../middleware/auth")
const jwt =require("jsonwebtoken");


// get all post 
router.get("/",(req,res) =>{
    try{
       connection.query (" SELECT * FROM post",(err,results)=>{
           if(err) throw err
           res.send(results);
       })
    }
    catch(error){
       console.log(error)
       res.status(400).send (error); 
    }
   }); 
   
  

//create a post
router.post('/', middleware, bodyParser.json(), async (req, res) => {
    try {
        const bd = req.body;
        // Query
    const strQry =
      `
      INSERT INTO post(img, caption, peopleTag, addlocation,likes,userId)
  VALUES(?, ?, ?, ?, ?,?);
  
  `;
  connection.query(strQry, [bd.img, bd.caption, bd.peopleTag, bd.addlocation, bd.likes, req.user.id], (err, data) => {
      if (err) throw err;
      // res.send(`${data.affectedRows}Successfully added a product`);
      res.json({
          status: 200,
          results: req.user,
          msg:'successully'
        })
    })
} catch (error) {
    res.send(error)
    // res.status(400).send(error);
}
  });



  // {
  //   "img":"lllddd",
  //   "caption":"akakaka",
  //   "peopleTag":"ssss",
  //   "addlocation":"sssss",
  //   "likes":0
  // }

  //get post with comment created with the comment too 
  router.get("/:id",(req,res)=>{
  //   try{
  //     connection.query ("SELECT * FROM post WHERE postid = ?",[req.params.id],(err,results)=>{
  //         if(err) throw err
  //         res.send(results);
  //     })
  //  }
  //  catch(error){
  //     console.log(error)
  //     res.status(400).send (error); 
  //  }

  /// joining three tables , post , users, comment

    try{
      const strQry = `SELECT p.postId, p.img, p.caption, p.peopleTag, p.addlocation, p.likes, p.userId, c.description,u.username
      FROM post p
      INNER JOIN comments c
      ON p.postId = c.commentPost 
      INNER JOIN users u 
      ON p.userId = u.ID
      WHERE p.postId = ${req.params.id}
      `
      connection.query (strQry,(err,results)=>{
          if(err) throw err
          res.json({
            results : results,
            msg : "joing two tables"
          });
      })
   }
   catch(error){
      console.log(error)
      res.status(400).send (error); 
   }

  }
  )

  //update a post
router.put('/:id', middleware, bodyParser.json(), async (req, res) => {
   try{
    const {
      img,
      caption,
      peopleTag,
      addlocation,
      likes
      } = req.body
  
    let sql = `UPDATE post SET ? WHERE postId = ${req.params.id} `
    let userId = req.user.id
    const post = {
      img,
      caption,
      peopleTag,
      addlocation,
      likes,
      userId
    }
    connection.query(sql,post, (err, result) => {
      if (err) throw Error
      res.send(result)
    })
   }catch(error){
    res.status(400).send(error)
   }
  });



  //delete a post
  router.delete('/:id', middleware, async (req, res) => {
   try{
     // Query
    const strQry =
      `
      DELETE FROM post
      WHERE postId = ?;
      `;
    connection.query(strQry, [req.params.id], (err, data, fields,results) => {
      if (err) throw err;
      res.json({
        status: 200,
        results: results,
        msg:'successully  delete'
      })
    })
   }catch(error){
    res.status(400).send(400)
   }
   
  });



  module.exports = router