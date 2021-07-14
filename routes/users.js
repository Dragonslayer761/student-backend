var express = require('express');
var router = express.Router();
var student = require('../public/json/student');
var course = require('../public/json/course');
var admin = require('../public/json/admin');
var jwt = require('jsonwebtoken');
var knex = require('knex');

//db connection
const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: '1234',
    database: 'Mainteny-Student'
  }
});

//db test
db.select('*').from('login').then(data =>{
  console.log(data[0])
})

//secret key
const key = "sEcReTKeY"

//middleware to set token to request body
const getToken = (req, res, next) => {
  const header = req.headers['authorization'];
  if (typeof header !== 'undefined') {
    req.token = header
    next()
  } else {
    res.sendStatus(403)
  }

}
//login and access token
router.post('/login', (req, res) => {
  const { username, password } = req.body
  let found = false
  for (let i = 0; i < admin.length; i++) {
    if (admin[i].username == username && admin[i].password == password) {
      found = true;
      break
    } else {
      found = false;
    }
  }

  if (found) {
    jwt.sign({
      route: "login route",
      username: username,
      password: password
    }, key, (err, token) => {
      res.send({ token })
    })
  } else {
    res.sendStatus(403)
  }
})

/* GET users listing. */
router.get('/', function (req, res, next) {
  db.select('*').from('course').then(data =>{
    res.send(data)
    })
});
//register
router.post('/register',(req, res)=>{
  const{username,fname,lname,email,phoneno,dob,country,joining_year,password} = req.body;
  
})
//get all student
router.get('/student', getToken, (req, res) => {
  res.send(JSON.stringify(student));
})



// get student by its id
router.get('/student/:id', getToken, (req, res) => {
  jwt.verify(req.token, key, (err, authData) => {
    if (err) {
      res.sendStatus(403)
    } else {
      const { id } = req.params
      let user = {}
      student.forEach((data) => {
        if (data.s_id === id) {
          user = data
        }
      })
      if (user) {
        res.send({user,authData})
      } else {
        res.sendStatus(404)
      }

    }
  })

});

//add new student
router.post('/student', getToken, (req, res) => {
  const { id, fname, lname, } = req.body;
  console.log(id, fname, lname);
  let token = "success"
  student.push()
});

// get all course details 
router.get('/courses', getToken, (req, res) => {
  res.send(course)
});


//export the route
module.exports = router;
