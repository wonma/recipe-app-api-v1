const mongoose = require('mongoose')

mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_ATLAS_URI || 'mongodb://localhost:27017/RecipeApp',
    { dbName: 'RecipeApp', useNewUrlParser:true })

module.exports = {mongoose}