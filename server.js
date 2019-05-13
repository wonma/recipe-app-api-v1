const express = require('express')
const path = require('path')
console.log('asdfasdf')
const bodyParser = require('body-parser')
const _ = require('lodash')
const hbs = require('hbs')
// const bcrypt = require('bcryptjs') 
const cors = require('cors')
const app = express()

// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, './public')
const viewsPath = path.join(__dirname, './views')

// Setup handlebars engine and views location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
console.log('haha111')
// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

app.use(bodyParser.json())
app.use(cors())

const { ObjectID } = require('mongodb')
// const { mongoose } = require('./db/mongoose')

const { Recipe } = require('./models/recipe')
const { User } = require('./models/user')
const { auth } = require('./middleware/auth')

app.get('/', (req, res) => {
    res.render('index.hbs')
})

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
console.log('haha')


app.post('/recipes', auth,(req, res) => {
    const recipe = new Recipe({
        title: req.body.title,
        type: req.body.type,
        serving: req.body.serving,
        mainIngre: req.body.mainIngre,
        subIngre: req.body.subIngre,
        text: req.body.text,
        _creator: req.user._id
    })

    recipe.save().then(() => {
        res.send('Successfully saved')
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

app.post('/recipes/:id', auth, (req, res) => {
    const id = req.params.id
    if (!ObjectID.isValid(id)) {
        return res.status(404).send('id is invalidddddd')
    }


    Recipe.findOneAndUpdate({
        _id:id,
        _creator:req.user._id
    }, { $set: req.body }, {new: true}).then((recipe) => {
        if(!recipe) {
            return res.status(404).send('recipe not found')
        }
        res.send({recipe})
    }).catch((e) => {
        res.status(400).send()
    })
})



app.post('/users', (req, res) => {
    const body = _.pick(req.body, ['name', 'email', 'password'])
    if(body.password !== req.body.passwordConfirm) {
        return res.status(400).send('password error')
    }
    const user = new User(body)
    user.save().then(() => {  
            return user.generateAuthToken()
        }).then((token) => {
            res.send({token, user})
        }).catch((e) => {
            res.status(400).send(e)
        })
})

app.post('/users/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password'])
    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.send({token, user})
        })
    })
    .catch((e) => {
        res.status(400).send(e)
    })
})

app.post('/users/me/ingres', auth, (req, res) => {
    const filterIngre = req.body.filterIngre.map((ingre) => {
        return ingre.name
    })
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


app.post('/users/me/types', auth, (req, res) => {
    const filterTypes = req.body.filterTypes.map((type) => {
        return type.name
    })
    User.findOneAndUpdate({
        _id:req.user._id
    }, {$set: {filterType: filterTypes} }, {new: true}).then((user) => {
        if(!user) {
            return res.status(404).send('user not found')
        }
        res.send(user.filterType)
    }).catch((e) => {
        res.status(400).send('Something went wrong in server')
    })
})

app.get('/recipes/:id', auth, (req, res) => {
    const id = req.params.id
    if (!ObjectID.isValid(id)) {
        return res.status(404).send('id is invalidddddd')
    } 

    Recipe.findOne({
        _id:id,
        _creator: req.user._id
    }).then((recipe) => {
        if (!recipe) {
            return res.status(404).send('hmm 404 error, ID not found')
        }
        res.send({recipe})
    }).catch((e) => {
        res.status(400).send('Bad request! Invalid ID')
    })
})


app.delete('/recipes/:id', auth, (req, res) => {
    const id = req.params.id
    if (!ObjectID.isValid(id)) {
        return res.status(404).send('id is invalidddddd')
    } 

    Recipe.findOneAndDelete({
        _id:id,
        _creator: req.user._id
    }).then((recipe) => {
        if (!recipe) {
            return res.status(404).send('hmm 404 error, ID not found')
        }
        res.send({recipe})
    }).catch((e) => {
        res.status(400).send('Bad request! Invalid ID')
    })
})

app.delete('/users/me/token', auth, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send()
    }, () => {
        res.status(400).send()
    })
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`app is running on port`)
})



