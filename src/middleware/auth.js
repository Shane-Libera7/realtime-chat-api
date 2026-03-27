const express = require('express');
const jwt = require('jsonwebtoken');



//Authenticate JWT

function authenticate(req, res, next){
    const authHeader = req.headers.authorization;
    if (!authHeader){
        return res.status(401).json({ error: 'No token found'});
    }

    const auth = authHeader.split(" ");

    const token = auth[1];

    try{

        const validToken = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = validToken.userId;
        next();




    } catch(e){
        console.log(e);
        if (e instanceof jwt.TokenExpiredError){
            return res.status(403).json({ error: 'Token has expired'});
        } else if(e instanceof jwt.JsonWebTokenError ){
            return res.status(403).json({ error: 'Token is invalid'});
        } else{
        return res.status(500).json({ error: 'Something went wrong'});
        }
    }
}

module.exports = authenticate;