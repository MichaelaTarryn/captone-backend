const app = require("express");
const express = require('express')
const router = express.Router();
const connection = require("../config/db.connection")
const bodyParser= require('body-parser');
const {compare,hash}=require("bcrypt");
const middleware=require("../middleware/auth")
const jwt =require("jsonwebtoken");

router.get("/",(req,res) =>{


 try{
    connection.query (" SELECT * FROM users",(err,results)=>{
        if(err) throw err
        res.send(results);
    })
 }
 catch(error){
    console.log(error)
    res.status(400).send (error); 
 }
})

//user register
router.post('/', bodyParser.json(), async (req, res) => {
    try{
         const bd = req.body;
    if (bd.userRole === "" || bd.userRole === null) {
      bd.userRole = "user";
    }
    
    const emailQ = "SELECT email from users WHERE ?";
    let email = {
      email: bd.email
    }
    connection.query(emailQ, email, async (err, results) => {
      if (err) throw err;
      if (!results.length >1 ) {
        res.json({
          alert: "Email Exists"
        });
      } else {
        // Encrypting a password
        // Default genSalt() is 10`
        bd.password = await hash(bd.password, 10);
        // bd.joinDate = `${new Date().toISOString().slice(0, 10)}`;
        // bd.id = await hash(bd.id, 10);
        const usernameQ = "SELECT username from users where ?";
        let username ={
            username:bd.username
        }
        connection.query (usernameQ, username , async (err, results)=>{
            if (err) throw err;
            if(results.length > 0){
                res.json({
                    alert:"username already exists please enter new one , thank you "
                });
            }else {
                // Query
        const strQry =
          `
      INSERT INTO users(email,fullname,password,username, userRole)
      VALUES(?, ?, ?, ?,?);
      `;
        //
        connection.query(strQry,
          [bd.email, bd.fullname, bd.password, bd.username, bd.userRole],
          (err, results) => {
            if (err) throw err;
            res.json({
              msg:"successfully register !"
            })
            // res.send(window.location.href="login.html")
            // res.sendFile(__dirname + "/login.html")
            ;
          })
            }
        })
        
      }
    })
      
    }catch (error){
      res.status(400).send(error);
      // console.log(error);
    }
    
  })
  //dumbtext
  // {
  //   "email":"mt",
  //   "fullname":"mt",
  //   "username":"mt22",
  //   "password":"mt"
    
  // }
  //login
  router.patch("/",bodyParser.json(),(req,res)=>{
    try{
const {email, password} =req.body
const strQry= `SELECT * FROM users  where email = '${email}'`

connection.query(strQry, async (err,results)=>{
 if (err) throw err

  if (!results.length) {
    res.status(401).json({
      msg: "Email not found, Please Register"
    });
  } else {
    const ismatch = await compare(password, results[0].password);
    if (ismatch) {
      const payload = {
        user: {
          id: results[0].ID,
          fullname: results[0].fullname,
          username: results[0].username,
          email: results[0].email,
          userRole: results[0].userRole,
        },
      };
      jwt.sign(
        payload,
        process.env.jwtSecret, {
          expiresIn: "365d",
        },
        (err, token) => {
          res.header({
            'x-auth-token': token
          })
          if (err) throw err;
          res.json({
            user: payload.user,
            token: token,
            msg: "Login Successful"

          });
          // res.json(payload.user);
        }
      );
    } else {
      res.json({
        msg: "You entered the wrong password"
      });
      // res.send("You entered the wrong password");
    }
  }
});


    }catch(error){
      res.status(400).send(error);
    }

    }
  )

  //  delete a user account
router.delete('/:id', middleware, async (req, res) => {
  // Query
  const strQry =
    `
  DELETE FROM users 
  WHERE ID = ?;
  `;
  connection.query(strQry, [req.params.id], (err, data, fields) => {
    if (err) throw err;
    res.send(`${data.affectedRows} successully deleted a user`);
  })
});

  module.exports = router