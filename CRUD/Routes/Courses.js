var express = require('express');
var router = express.Router();
const path = require('path');
const COURSES= path.join(__dirname, '..', 'Data/course.json');
const STUDENTS = path.join(__dirname, '..', 'Data/student.json');
var abc = require('../Data/abc');
let user = require('../Data/user');
var fs=require('fs');
const mydb=require('../Data/database.js');


/* GET all courses */
router.get('/', function(req, res, next) {
  let query = `SELECT * FROM courses`;

  let [err, data] = await to(mydb.executeQuery(query));

  if(err){
    return res.json({data:null, error: err});
  }

  return res.json({data, error: null});

});


/* GET a course by id */
router.get('/:c_id', (req, res, next) => {

    const found = COURSES.some( course => course.id === parseInt(req.params.c_id));

    if(found){
      res.json( COURSES.filter( course => course.id === parseInt(req.params.c_id)));
    } else {
      res.status(400).json( {error: `No course found with the id ${req.params.c_id}`});
    }
});

router.post( '/', abc.verifyToken, (req, res) => {
  

    let {name, description, availableSlots} = req.body;
    availableSlots = parseInt( availableSlots );

    if(!name || !description || !availableSlots)
      return res.status(400).json({error: 'Please provide all 4 details of the course: id, name, desciption, available slots'});

    if( availableSlots < 0)
      return res.status(400).json({error: 'Available slots should be positive'});

    const newCourse = {
        id,
        name,
        description,
        "enrolledStudents": [],
        availableSlots
    }
    let query = `INSERT INTO courses(name, description, available_slots) VALUES( \'${name}\', \'${description}\', ${available_slots})`;

    let [err, data] = await to(mydb.executeQuery(query));
    if(err){
      return res.json({ data:null, error: err});
    }
    
    return res.json({ data: "success", error: null });
   });
router.post( '/:c_id/enroll', abc.verifyToken, (req, res) => {

  const courseId= req.params.courseId;
  const studentId=req.body.studentId;
  var err,response;
  const checkIfCourseExistsSql=`SELECT * from courses where id='${courseId}';`;
  const checkIfStudentExistsSql=`SELECT * from users where id='${studentId}';`;

  
  [err,response]=await to(mydb.executeQuery(checkIfStudentExistsSql));
  if(err){
      dbHandleError(res,err);
  }
  if(response.length==0){
      console.log("Student doesn't exist");
      return res.json({
          success:false,
          msg:`Student '${studentId}' doesn't exists`,
      });
  }

   
  [err,response]=await to(mydb.executeQuery(checkIfCourseExistsSql));
  if(err){
      dbHandleError(res,err);
  }
  if(response.length==0){
      console.log("Course doesn't exist");
      return res.json({
          success:false,
          msg:`Course '${courseId}' doesn't exists`,
      });
  }

  const courseCapacity=response[0]['capacity'];
  const checkCourseEnrollmentsSql=`SELECT studentId from enrollment where courseId='${courseId}';`;

  [err,response]=await to(mydb.executeQuery(checkCourseEnrollmentsSql));
  if(err){
      dbHandleError(res,err);
  }
  if(response.length==courseCapacity){
      console.log("No seats available");
      return res.json({
          success:false,
          msg:`No seats available`,
      });
  }
      const checkIfAlreadyEnrolledSql=`SELECT * from enrollment where courseId='${courseId}' and studentId='${studentId}';`;

      [err,response]=await to(mydb.executeQuery(checkIfAlreadyEnrolledSql));
      if(err){
          dbHandleError(res,err);
      }
      console.log("duplicate ::",response);
      if(response.length!=0){
          console.log("Student already enrolled");
          return res.json({
              success:false,
              msg:`Student already enrolled`,
          });
      }
  
  const enrollstudentSql=`INSERT INTO enrollment (studentId,courseId) VALUES ('${studentId}', '${courseId}')`;

  [err,response]=await to(mydb.executeQuery(enrollstudentSql));
  if(err){
      dbHandleError(res,err);
  }
  console.log(`student '${studentId}' enrolled in course '${courseId}'`);
  return res.json({
      success:true,
      msg:`Student Successfully Enrolled`,
  });

});
router.put( '/:c_id/deregister', abc.verifyToken, (req, res) => {
  const courseId= req.params.courseId;
  const studentId=req.body.studentId;

  var err,response;


  const checkIfCourseExistsSql=`SELECT * from courses where id='${courseId}';`;
  const checkIfStudentExistsSql=`SELECT * from Maverick where id='${studentId}';`;

  // check whether student exists or not 
  [err,response]=await to(mydb.executeQuery(checkIfStudentExistsSql));
  if(err){
      dbHandleError(res,err);
  }
  if(response.length==0){
      console.log("Student doesn't exist");
      return res.json({
          success:false,
          msg:`Student '${studentId}' doesn't exists`,
      });
  }

  // check whether course exists or not 
  [err,response]=await to(mydb.executeQuery(checkIfCourseExistsSql));
  if(err){
      dbHandleError(res,err);
  }
  if(response.length==0){
      console.log("Course doesn't exist");
      return res.json({
          success:false,
          msg:`Course '${courseId}' doesn't exists`,
      });
  }

  //  to check if the student is enrolled in that course or not
  const checkIfEnrolledSql=`SELECT * from enrollment where courseId='${courseId}' and studentId='${studentId}';`;

  [err,response]=await to(mydb.executeQuery(checkIfEnrolledSql));
  if(err){
      dbHandleError(res,err);
  }
  if(response.length==0){
      console.log(`Student: ${studentId} is not enrolled in the course: ${courseId}`);
      return res.json({
          success:false,
          msg:`Student isn't enrolled in course`,
      });
  }


  // un-enroll the student into the course
  const unenrollstudentSql=`DELETE FROM enrollment where courseId='${courseId}' and studentId='${studentId}';`;

  [err,response]=await to(mydb.executeQuery(unenrollstudentSql));
  if(err){
      dbHandleError(res,err);
  }
  console.log(`student '${studentId}' deregistered from course '${courseId}'`);
  return res.json({
      success:true,
      msg:`Student Successfully Deregistered`,
  });



});
  
module.exports = router;