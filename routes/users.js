var express = require('express');
var router = express.Router();
var student = require('../public/json/student');
var course = require('../public/json/course');
var admin = require('../public/json/admin');
var jwt = require('jsonwebtoken');
var knex = require('knex');
var bcrypt = require('bcrypt')

//salt rounds

const saltRounds = 10

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
  db.select('*').from('course').then(data => {
    res.send(data)
  })
});

//register user
router.post('/register/admin', (req, res) => {
  const { a_id, full_name, email, password } = req.body;

  const salt = bcrypt.genSaltSync(saltRounds);
  let hash = bcrypt.hashSync(password, salt)
  db.transaction(trx => {
    trx.insert({
      a_id: a_id,
      full_name: full_name,
      email: email,
      password_hash: hash
    }).into('admin_user').returning('email')
      .then(email => {
        res.json(email[0]);
      }).then(trx.commit)
      .catch(trx.rollback)
  }).catch(err => res.status(404).json('unable to register'))
})

//register new student
router.post('/register/student',(req,res)=>{
  const{s_id,first_name,last_name,email,phone_number,date_of_birth,country,joining_date} = req.body;
  console.log(s_id)
  db.transaction(trx =>{
    trx.insert({
        s_id:s_id,
        first_name:first_name,
        last_name:last_name,
        email:email,
        phone_number:phone_number,
        date_of_birth:date_of_birth,
        country:country,
        joining_date:joining_date
    }).into('student').returning('first_name')
    .then(first_name=>{
      res.send(first_name[0])
    }).then(trx.commit)
    .catch(trx.rollback)
  }).catch(err => res.status(404).json(err.detail))
})

//get all student
router.get('/student', getToken, (req, res) => {
  db.select('first_name','last_name').from('student').then(name =>{
    res.send(name)
  }).catch(err => {
    res.sendStatus(404).send(err)
  })
})

// get student by its id
// router.get('/student/:id', getToken, (req, res) => {
//   const { username } = req.body;
//   console.log(username)
//   jwt.verify(req.token, key, (err, authData) => {
//     if (err) {
//       res.sendStatus(403)
//     } else {
//       const { id } = req.params
//       let user = {}
//       student.forEach((data) => {
//         if (data.s_id === id) {
//           user = data
//         }
//       })
//       if (user) {
//         res.send({ user, authData, username })
//       } else {
//         res.sendStatus(404)
//       }

//     }
//   })

// });


//add courses
router.post('/register/course',(req,res)=>{
  const {c_id,course_name,course_duration,t_credit,p_credit,j_credit}=req.body
  db.transaction(trx=>{
    trx.insert({
      c_id:c_id,
      course_name:course_name,
      course_duration:parseInt(course_duration),
      t_credit:parseInt(t_credit),
      p_credit:parseInt(p_credit),
      j_credit:parseInt(j_credit)
    }).into('course').returning('course_name')
    .then(course_name =>{
      res.json(course_name[0])
    })
    .then(trx.commit)
    .catch(trx.rollback)
  }).catch(err => res.status(404).json(err.detail))
})

//get all course
router.get('/course',(req,res)=>{
  db.select('c_id','course_name').from('course').then(course =>{
    res.send(course)
  }).catch(err => {
    res.sendStatus(404).send(err)
  })
})

//get student course relation
router.get('/student/course',(req,res)=>{
  db.select('c_id','s_id').from('student_course').then(course =>{
    res.send(course)
  }).catch(err => {
    res.sendStatus(404).send(err)
  })
})
//add course for student
router.post('/student/addcourse',(req,res)=>{
  const {s_id,c_id,}=req.body
  
})

//export the route
module.exports = router;
