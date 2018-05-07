var User = require('../models/user')

var authentication = (req, res, next) => {
    var token = req.header('x-auth')

    User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject() //Error handling when there is no proper token verification
        }
        req.user = user // returning user value back
        req.token = token // returning token value back
        next()
    }).catch((e) => {
        res.status(401).send(e)
    })
}

module.exports = authentication