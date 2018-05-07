const express = require('express')
const mongoose = require('mongoose')
const User = require('../models/user')
var router = express.Router()
const authGaurd = require('../middleware/auth')

// connecting to the database
mongoose.connect('mongodb://localhost/auth', (err)=>{
    (err) =>{
        console.log('connection to mongodb was failure')
    }
    console.log('connected to the database')
}) 


router.post('/', (req, res)=> {
    let userData = req.body
    let user = new User(userData)
    user.save().then(()=>{
        return user.generateAuthToken()
    }).then((token)=>{
        res.header('x-auth', token).status(200).send(user)
    }),(err)=>{
        res.status(400).send(err)
    }
})

router.get('/', authGaurd, (req, res) => {
    res.send(req.user)
})

module.exports = router