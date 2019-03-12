const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const bcrypt = require('bcrypt')
const db = require('knex')({
    client: 'pg',
    connection: {
    host: '127.0.0.1',
    user: '',
    password: '',
    database: 'recipeapp'
    }
});

app.use(bodyParser.json())

app.use(cors())

app.post('/register', (req, res) => {

    const { name, email, password } = req.body
    
    const hash = bcrypt.hashSync(password, 10)
    const regex = /^.{4,}$/
    // Password must contain at least one letter, at least one number, 
    // and be longer than six charaters.
    if(!name || !email || !password){
        return res.status(400).json('blank')
    }
    if(!regex.test(password)) {
        return res.status(400).json('wrongpassword')
    }


    db.transaction(trx => {
        trx.insert({
            email: email,
            hash: hash
            }, 'email')     // 'email, password' into table 'login'
            .into('login')
            .then(loginEmail => {
               return trx.insert({  // error 2 - no 'return' (있어야할 이유 잘 모르겠음)
                    name: name,
                    email: loginEmail[0],
                    joined: new Date()
                }, '*')         //'email, name, joined' into table 'user'
                .into('users')
                .then(user => {
                    res.json(user[0])
                })
            })
            .then(trx.commit)
            .catch(trx.rollback)  
    })
    .catch(err => {
        res.status(400).json('existing')
    })

})


app.get('/main', (req, res) => {
    const { email } = req.body
    res.json('The email is being used')
})


app.get('/', (req, res) => {
    res.json('hahaha')
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`app is running on port ${process.env.PORT}`)
})

