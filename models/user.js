const mongoose = require('mongoose')
const validator = require('Validator')
const jwt = require('jsonwebtoken')
var bcrypt = require('bcryptjs')
var _ = require('lodash')


// Creating new user instance 
var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        minlenght: 3,
        required: true,
        unique: true,
        validate: {
            validator: validator.isEmail, //validation for email using validator package
            message: '{VALUE} is not a valid Email!' // Message to display
        }
    },
    password: {
        type: String,
        minlenght: 6,
        required: true
    },

    // used for authentication purpose
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})


// getting JSON value of only id and user
UserSchema.methods.toJSON = function () {
    var userObject = this.toObject() // converting to the object for mongodb storage
    return _.pick(userObject, ['_id', 'email']) // plucking only id and user 
}


// generating user authentication token using JWT
UserSchema.methods.generateAuthToken = function () {
    var access = 'auth'
    var token = jwt.sign({ _id: this._id.toHexString(), access }, 'dragonballz').toString() // adding salt

    this.tokens.push({ access, token })

    return this.save().then(() => {
        return token
    })

}

// varifying the user by token 
UserSchema.statics.findByToken = function (token) {
    var access = 'auth'
    var decoded

    try {
        decoded = jwt.verify(token, 'dragonballz')
    } catch (error) {
        return Promise.reject() //error handling for unauthorized entry
    }

    //finding the data in the database
    return this.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': access
    })

}

// login function
UserSchema.statics.findByCredentials = function (email, password) {

    return this.findOne({ email }).then((user) => {

        if (!user) {
            return Promise.reject() // When Email dosen't match
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user)
                } else {
                    reject() // When Password dosen't match
                }
            })
        })
    })
}

UserSchema.methods.removeToken = function (token) {

    return this.update({
        $pull:{
            tokens:{token}
        }
    })
    
}

//  Password hashing before saving to the database
UserSchema.pre('save', function (next) {
    if (this.isModified('password')) { // wheather the password has been hashed only for update
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(this.password, salt, (err, hash) => {
                this.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

// exporting the model User  
module.exports = mongoose.model('User', UserSchema)