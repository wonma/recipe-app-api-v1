const mongoose = require('mongoose')

// mongoose.Promise = global.Promise // Unsure but, tried deleting this on May 8th, 2019
mongoose.connect(process.env.MONGODB_ATLAS_URI, {
    dbName: 'RecipeApp',
    useNewUrlParser: true
})

// module.exports = { mongoose } // Unsure but, tried deleting this on May 8th, 2019