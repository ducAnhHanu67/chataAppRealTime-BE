const mongoose = require('mongoose')

const chatShema = new mongoose.Schema(
    {
        members: Array,
    },
    {
        timestamps: true,
    }
);
const chatModel = mongoose.model('chat', chatShema);
module.exports = chatModel;
