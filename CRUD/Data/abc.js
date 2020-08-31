 
var express = require('express');
var jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const user_path = path.join(__dirname, '/user.json');
var {to} = require('await-to-js');
var bcrypt = require('bcrypt');

const verifyToken = (req, res, next) => {

    let USERS = JSON.parse(fs.readFileSync(user_path));

    if(USERS.length == 0)
        return res.status(400).json( {"err": "User is not logged in"});
    const bearerHeader = req.headers['authorization'];
  
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
  
        req.token = bearerToken;

        jwt.verify( req.token, 'secretkey', (err, authData) => {
            if(err) {
                res.status(400).json({ "error": "Not verified successfully"}); 
            } 
            else {
                //console.log(authData);
                
                let u_found = USERS.find( user => user.email == authData.newStudent.email);
    
                if( !u_found)
                    return res.status(400).json({ "err": "The student is not signed up !!"});

                if(u_found.login_status == false)
                    return res.status(400).json({ "err": "The student is not logged in !!"});

                res.cur_user = authData.newStudent; 

                next();
            }
        })
        
    } else {
      res.status(400).json({error: 'Token not found'});
    } 
} 


const passwordd= async (password) => {
    const saltRounds = 10;
    const [err, encrypted_pass ] = await to( bcrypt.hash(password, saltRounds));

    if(err)
    {
        return res.send( {"msg": "Error while generating password hash"});
    }
    return encrypted_pass;
};


module.exports = {
    verifyToken,
    passwordd
};