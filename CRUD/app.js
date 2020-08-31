var createError = require('http-errors');
var express = require('express');
var path = require('path');
var studentsRouter = require('./Routes/Students');
var coursesRouter = require('./Routes/Courses');
var Authentification=require('./Routes/Auth');
//const mydb=require('../Data/database');
//const mydb=require('../Data/database');
const mydb=require('./Data/database.js');

var app = express();
mydb.connectDb();



app.use(express.json());

app.use('/Students',studentsRouter);

app.use('/Courses',coursesRouter);

app.use('/Auth',Authentification);

app.listen(5000,()=>console.log("server is running at the port"));

module.exports = app;