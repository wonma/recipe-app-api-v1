const mongoose = require('mongoose')

const Recipe = mongoose.model('Recipe', {
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    type:{
        type: String,
        required: true,
        default: 'any'
    },
    serving:{
        type: Number,        
        default: 1
    },
    text: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    mainIngre: [{
        name: {
            type: String,
            required: true,
            minlength: 1,
            trim: true
        },
        amount: {
            type: String,
            required: true
        }
    }],
    subIngre: [{
        name: {
            type: String,
            required: true,
            minlength: 1,
            trim: true
        },
        amount: {
            type: String,
            required: true
        }
    }],
    matchRate: {
        type: Number,        
        default: 0
    }

})

module.exports = {Recipe}