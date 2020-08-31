var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var {to} = require('await-to-js');
const path = require('path');
const fs = require('fs');
const user= path.join(__dirname, '..', 'Data/user.json');
const verifyToken = require('../Data/abc');
const mydb=require('../Data/database.js');



 
router.post('/Signup',async(req, res) => {


    let {userName, email, password} = req.body;

    var err,response;
    const checkIfUserExistsSql=`SELECT * from Maverick where email='${email}';`;
    [err,response]=await to(mydb.executeQuery(checkIfUserExistsSql));
    if(err){
       res.json({
           success:"Failed",
           Message:"Try again later"
       });
    }
    if(response.length!=0){
        console.log("Email already registered");
        return res.json({
            success:false,
            msg:`Email ${email} already registered. Please Login`,
        });
    }

        const [tmp, encrypted_pass] = await to( verifyToken.passwordd(password));
        console.log(encrypted_pass);
        let sql = `INSERT INTO Maverick(name, email,encripted_pass,Status)VALUES(\'${userName}\',\'${email}'\,\'${encrypted_pass}'\,'False')`;

        [err,response]=await to(mydb.executeQuery(sql));
        if(err){
            res.json("error");
        }
        
        console.log("Successfully inserted data into user table::Signup Done");
        return res.json({
            success:true,        
            msg:"signed up successfully"
        
        });
    
    
        

    

});



router.put('/login', async (req, res) => {

    /* let {email, password} = req.body;
    let USERS = JSON.parse(fs.readFileSync(user));
    let u_found = USERS.find( user => user.email == email);

    if(!u_found)
        res.status(400).json({ "err": "Not registered"});

    if(u_found.login_status == true)
        res.status(400).json({ "err": "Already Logged in"});
 */
let {email,password}=req.body;
    var ifUserExistsSql=`select * from Maverick where email = '${email}'`;
    var err,data;
    [err,data]=await to(mydb.executeQuery(ifUserExistsSql));
    if(err){
        res.json({
            message:"Errorrr"
        });
    }
    
    if(data.length==0){
         return res.json({
             msg: "Email not registered, please signup first"
         });
    }
    let [errr, isValid] = await to(bcrypt.compare(password,data[0].encripted_pass));

    if(errr){
        return res.status(400).json({ "error": "error while comparing"});
    }

    if(!isValid){
        return res.status(400).json({ "error": "Incorrect Password !"});
    }

    const newStudent = {
        email,
        password
    } 

   // u_found.login_status= true;

    //console.log(USERS[0]);
    //fs.writeFileSync( user, JSON.stringify( USERS, null, 2));

    jwt.sign( {newStudent}, 'secretkey', async(err, token) => {
        query = `UPDATE Maverick SET Status= true WHERE email= \'${email}\' `;
      

        [err, data] = await to(mydb.executeQuery(query));

        if(err){
        return res.json({ data: null, error: "Some error occured in logging in"});
        }

        return res.json({
            "accessToken" : token,
            error: err
        });
    });


});




router.get('/', (req, res) => {
    res.json({"user": user});
});


module.exports = router;