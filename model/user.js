const mongoose = require('mongoose');

//! Membuat Skema pengguna 
const UserSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }
}, { collection: 'user' });
const User = mongoose.model('User', UserSchema);

module.exports = User;