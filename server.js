const express = require('express')
const bodyParser = require('body-parser')
const _ = require('lodash') 
const bcrypt = require('bcryptjs') 
const cors = require('cors')
const app = express()
app.use(bodyParser.json())
app.use(cors())

const { ObjectID } = require('mongodb')
const { mongoose } = require('./db/mongoose')

const { Recipe } = require('./models/recipe')
const { User } = require('./models/user')
const { auth } = require('./middleware/auth')

// app.use(bodyParser.urlencoded({ extended: false })) // PATCT PUT 연동위해

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//   )
//   if (req.method === 'OPTIONS') {
//     res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
//     return res.status(200).json({})
//   }
//   next()
// })


app.get('/recipes', auth,(req, res) => {
    Recipe.find({
        _creator: req.user._id
    }).then((recipes) => {
        if(!recipes) {
            res.send([])
        }
        res.send({recipes})   
    }, (e) => {             
        res.status(400).send(e)
    })  
}) 


app.post('/recipes', auth,(req, res) => {
    const recipe = new Recipe({
        title: req.body.title,
        type: req.body.type,
        serving: req.body.serving,
        mainIngre: req.body.mainIngre,
        subIngre: req.body.subIngre,
        _creator: req.user._id
    })

    recipe.save().then(() => {
        res.send('Successfully saved ')
    }, (e) => {
        res.status(400).send('Hmm POST recipes request failed')
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
    user.save().then(() => {  
            return user.generateAuthToken()
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
            res.send({token, user})
            // res.send(token)
        })
    })
    .catch((e) => {
        res.status(400).send('no user')
    })
})

app.post('/users/me/ingres', auth, (req, res) => {

    // const body = _.pick(req.body, ['email', 'password'])    
    // User.findByCredentials(body.email, body.password).then((user) => {
    //     return user.generateAuthToken().then((token) => {
    //         res.send({token, user})
    //         // res.send(token)
    //     })
    // })
    // .catch((e) => {
    //     res.status(400).send('no user')
    // })
    const filterIngre = req.body.filterIngre.map((ingre) => {
        return ingre.name
    })
    // res.send({babo: 'babo'})
    User.findOneAndUpdate({
        _id:req.user._id
    }, {$set: {filterIngre: filterIngre} }, {new: true}).then((user) => {
        if(!user) {
            return res.status(404).send('user not found')
        }
        res.send(user.filterIngre)
    }).catch((e) => {
        res.status(400).send('Something went wrong in server')
    })
})


app.get('/', (req, res) => {
    res.json('hahaha')
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`app is running on port`)
})

