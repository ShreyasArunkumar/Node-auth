const express = require('express')
const mongoose = require('mongoose')
const User = require('../models/user')
var router = express.Router()
const authGaurd = require('../middleware/auth')
const _ = require('lodash')

// connecting to the database
mongoose.connect('mongodb://localhost/auth', (err) => {
    (err) => {
        console.log('connection to mongodb was failure')
    }
    console.log('connected to the database')
})

// registering new user
router.post('/', (req, res) => {
    let userData = req.body
    let user = new User(userData)
    user.save().then(() => {
        return user.generateAuthToken()
    }).then((token) => {
        res.header('x-auth', token).status(200).send(user)
    }), (err) => {
        res.status(400).send(err)
    }
})


//login route
router.post('/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password'])

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).status(200).send(user)
        })
    }).catch((e) => {
        res.status(400).send(e)
    })

})


router.get('/', authGaurd, (req, res) => {
    res.send(req.user)
})

module.exports = router