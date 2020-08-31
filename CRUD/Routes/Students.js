var express = require('express');
var router = express.Router();
const path = require('path');

var abc = require('../Data/abc');
var fs=require('fs');
const student_path = path.join(__dirname, '..', 'Data/student.json');
const mydb=require('..Data/database')


/* GET all students. */
router.get( '/', (req, res) => {
  let query = 'SELECT id, name, email, login_status FROM Maverick;';

  let [err, data] = await to(mydb.executeQuery(query));

  if(err){
    return res.json({data:null, error: err });
  }
  
  return res.json({data, error: null });
 });



router.get( '/', abc.verifyToken, (req, res) => {
  let query = `SELECT *, count(*) as cnt FROM Maverick where id= ${req.params.u_id};`;

  let [err, data] = await to(db.executeQuery(query));

  if(err){
    return res.json({data: null, error: err });
  }

  if( data[0].cnt==0)
      return res.json({ data: null, error: "No user is present with this id"});

  delete data[0].cnt;
  delete data[0].encrypted_pass;

  
  query = `SELECT name FROM courses WHERE id IN( SELECT course_id FROM enrollment WHERE user_id= ${req.params.u_id})`;

  let enrolled_in_courses;
  [err, enrolled_in_courses] = await to(mydb.executeQuery(query));

  if(err){
    return res.json({data: null, error: err });
  }

  let enrolled = [];
  enrolled_in_courses.forEach( (enr) => enrolled.push(enr.name));
  data[0]["enrolled_in_courses"] = enrolled;

  return res.json({data: data[0], error: null });
});

  
module.exports = router;