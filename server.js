const express = require('express')
const bodyParser = require('body-parser')

var app = express()

// routes for imports
const api = require('./routes/user')

app.use(bodyParser.json())


//routes for calling
app.use('/users', api)

app.listen(3000, () => {
    console.log('up on port 3000')
})