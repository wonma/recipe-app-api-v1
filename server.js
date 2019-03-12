const express = require('express')
const bodyParser = require('body-parser')
const _ = require('lodash') 
const bcrypt = require('bcryptjs') 
const cors = require('cors')
const app = express()


const { ObjectID } = require('mongodb')
const { mongoose } = require('./db/mongoose')

const { Recipe } = require('./models/recipe')
const { User } = require('./models/user')
const { auth } = require('./middleware/auth')

app.use(bodyParser.json())
app.use(cors())

app.get('/recipes', auth,(req, res) => {
    Recipe.find({
        _creator: req.user._id
    }).then((todos) => { // todos는 array임
        if(!todos) {
            res.send([])
        }
        res.send({todos})   
    }, (e) => {             
        res.status(400).send(e)
    })  
}) 


app.post('/recipes', auth,(req, res) => {
    const recipe = new Recipe({
        text: req.body.text,
        _creator: req.user._id
    })

    recipe.save().then(() => {
        res.send('Successfully saved ')
    }, (e) => {
        res.status(400).send(e)
    })
})

app.get('/recipes', auth,(req, res) => {
    Recipe.find({
        _creator: req.user._id
    }).then((recipes) => { // recipes는 array임
        res.send({recipes})   
    }, (e) => {             
        res.status(400).send(e)
    })  
}) 


app.post('/users', (req, res) => {
    const body = _.pick(req.body, ['name', 'email', 'password'])
    const user = new User(body)
    // console.log(user) // 이 user는 _id, email, password있고 tokens 값만 [] 인 상태
    user.save().then(() => {  
            return user.generateAuthToken()  // id + access + salt 조합으로 탄생, 값 뱉어내는 Promise임
        }).then((token) => {
            res.header('x-auth', token).send(user)
        }).catch((e) => {
            res.status(400).send(e)
        })
})

app.post('/users/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password'])
    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).status(200).send(user)
        })
    })
    .catch((e) => {
        res.status(400).send(e)
    })
})



app.get('/', (req, res) => {
    res.json('hahaha')
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`app is running on port`)
})

