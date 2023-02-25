var mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    profilePic: {
        type: String,
        required: true,
    },
    account: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    earning: {
        type: Number,
        default: 0
    },
    spending: {
        essentials: {
            type: Number,
            default: 0,
        },
        housing: {
            type: Number,
            default: 0
        },
        food: {
            type: Number,
            default: 0,
        },
        medical: {
            type: Number,
            default: 0,
        },
        transport: {
            type: Number,
            default: 0,
        },
        luxury: {
            type: Number,
            default: 0,
        },
        gifts: {
            type: Number,
            default: 0,
        },
        misc: {
            type: Number,
            default: 0,
        }
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;