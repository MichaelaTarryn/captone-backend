const app = require("express");
const express = require('express')
const router = express.Router();
const connection = require("../config/db.connection")
const bodyParser = require('body-parser');
const {
  compare,
  hash
} = require("bcrypt");
const middleware = require("../middleware/auth")
const jwt = require("jsonwebtoken");


//get all users
router.get("/", (req, res) => {
  try {
    connection.query(" SELECT * FROM users", (err, results) => {
      if (err) throw err
      res.send(results);
    })
  } catch (error) {
    console.log(error)
    res.status(400).send(error);
  }
})

//get all users by their id 
router.get("/:id", (req, res) => {
  try {
    connection.query(" SELECT * FROM users WHERE ID = ?", [req.params.id], (err, results) => {
      if (err) throw err
      res.send(results);
    })
  } catch (error) {
    console.log(error)
    res.status(400).send(error);
  }
})

//get all users by their id  and posts
router.get("/:id/post", (req, res) => {
  try {
    connection.query(`SELECT postId, img, caption, likes, userId
     FROM users u
     INNER JOIN post p
     ON u.ID = p.userId  
     WHERE ID = ?`, [req.params.id], (err, results) => {
      if (err) throw err
      res.send(results);
    })
  } catch (error) {
    console.log(error)
    res.status(400).send(error);
  }
})
//get all users by their id  and posts without comments
router.get("/:id/post/:postId", (req, res) => {
  try {
    connection.query(`SELECT p.postId, p.img, p.caption, p.peopleTag, p.addlocation, p.likes, p.userId,u.username
     FROM post p 
     INNER JOIN users u
     ON p.userId = u.ID  
     WHERE postId = ?`, [req.params.postId], (err, results) => {
      if (err) throw err
      res.send(results);
    })
  } catch (error) {
    console.log(error)
    res.status(400).send(error);
  }
})
//get all users by their id  and posts with comments
router.get("/:id/post/:postId/comments", (req, res) => {
  try {
    const join1 = `SELECT *
    FROM post p
    JOIN users u
    ON p.userId = u.ID WHERE p.postId = ${req.params.postId}  `

    connection.query(join1, (err, posted_user) => {
      if (err) throw err
      // Join 2 requires three table joinrsrs
      const strQry = `
    SELECT p.postId, p.img, p.caption, p.peopleTag, p.addlocation, p.likes, p.userId, c.description, c.commentuserId,c.commentId, u.username
      FROM post p
      INNER JOIN comments c
      ON p.postId = c.commentPost 
      INNER JOIN users u
      ON c.commentuserId = u.ID 
      WHERE p.postId = ${posted_user[0].postId}
       `

      connection.query(strQry, (err, results) => {
        if (err) throw err
        res.json({
          posted_user: posted_user[0],
          comment: results
        });
      })
    })
  } catch (error) {
    res.status(400).send(error);

  }

});

//user register
router.post('/', bodyParser.json(), async (req, res) => {
  try {
    const bd = req.body;
    if (
      (bd.userRole === "" || bd.userRole === null)) {
      bd.userRole = "user";
    }

    const emailQ = "SELECT email from users WHERE email = ?";
    let email = {
      email: bd.email
    }
    connection.query(emailQ, email.email, async (err, results) => {
      if (err) throw err;
      if (results.length > 0) {
        res.json({
          msg: "Email Exists"
        });
      } else {
        // Encrypting a password
        // Default genSalt() is 10`
        bd.password = await hash(bd.password, 10);
        // bd.joinDate = `${new Date().toISOString().slice(0, 10)}`;
        // bd.id = await hash(bd.id, 10);
        const usernameQ = "SELECT username from users where ?";
        let username = {
          username: bd.username
        }
        connection.query(usernameQ, username, async (err, results) => {
          if (err) throw err;
          if (results.length > 0) {
            res.json({
              msg: "username already exists please enter new one , thank you "
            });
          } else {
            // Query
            const strQry =
              `
      INSERT INTO users(email,fullname,password,username,userRole)
      VALUES(?, ?, ?, ?,?);
      `;
            //
            connection.query(strQry,
              [bd.email, bd.fullname, bd.password, bd.username, bd.userRole],
              (err, results) => {
                if (err) throw err;
                res.json({
                  msg: "successfully register !"
                })
                // res.send(window.location.href="login.html")
                // res.sendFile(__dirname + "/login.html")
                ;
              })
          }
        })

      }
    })

  } catch (error) {
    res.status(400).send(error);
    // console.log(error);
  }

})
//dumbtext
// {
//   "email":"kehlani@gmail.com",
//   "fullname":"kehlani",
//   "username":"kehlani",
//   "password":"kehlani",
//   "userRole" : null,
// }
//login
router.patch("/", bodyParser.json(), (req, res) => {
  try {
    const {
      email,
      password
    } = req.body
    const strQry = `SELECT * FROM users  where email = '${email}'`

    connection.query(strQry, async (err, results) => {
      if (err) throw err
      if (results.length === 0) {
        res.status(401).json({
          msg: "Email not found, Please Register "
        });
      } else {
        const ismatch = await compare(password, results[0].password);
        if (ismatch === true) {
          const payload = {
            user: {
              id: results[0].ID,
              fullname: results[0].fullname,
              username: results[0].username,
              email: results[0].email,
              userRole: results[0].userRole,
              profilePic: results[0].profilePic,
              bio: results[0].bio,
              link: results[0].link,
              userJob: results[0].userJob,
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
            msg: "You entered the wrong password sorry"
          });
          // res.send("You entered the wrong password");
        }
      }
    })
  } catch (error) {
    res.status(400).send(error);
  }
});

//update a user account
router.put('/:id', middleware, bodyParser.json(), async (req, res) => {
  try {
    const {
      fullname,
      username,
      email,
      userRole,
      profilePic,
      bio,
      link,
      userJob
    } = req.body

    let sql = `UPDATE users SET ? WHERE id = ${req.params.id} `

    const users = {
      fullname,
      username,
      email,
      userRole,
      profilePic,
      bio,
      link,
      userJob
    }

    connection.query(sql, users, (err, result) => {
      if (err) throw err;
      res.json({
        msg: "Successfully update details"
      });
    })
  } catch (error) {
    res.status(400).send(error)
  }
});

// {
//   "ID": 2,
//   "email": "mt",
//   "fullname": "mt",
//   "password": "$2b$10$ccHhPAA0Knpq.CvR/3bsfeDqVxfdR.EuvAX6Pxzdz1RkMDXKuKkz6",
//   "username": "mt22",
//   "profilePic": "lorem",
//   "bio": "lorem",
//   "link": "lorem",
//   "followers": "null",
//   "userRole": "null",
//   "userJob":"sale consulant"
// }


//  delete a user account
router.delete('/:id', middleware, async (req, res) => {
  try {
    // Query
    const strQry =
      `
  DELETE FROM users 
  WHERE ID = ?;
  `;
    connection.query(strQry, [req.params.id], (err, data, fields) => {
      if (err) throw err;
      // res.send(`${data.affectedRows} successully deleted a user`);
      res.json({
        msg: "deleted user"
      });
    })
  } catch (error) {
    res.status(400).send(400)
  }

});

module.exports = router