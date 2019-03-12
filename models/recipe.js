const mongoose = require('mongoose')

const Recipe = mongoose.model('Recipe', {
    text: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
})

module.exports = {Recipe}