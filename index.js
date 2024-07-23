const express = require("express")
const cors = require("cors")
const app = express()
const mongoose = require("mongoose")
const chatRoute = require('./Routes/chatRoute')
const userRoute = require('./Routes/useRoute')
const messageRoute = require('./Routes/messageRoute')
const http = require('http')
const { Server } = require('socket.io');
app.use(cors());
const onlineUsers = [];

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    }
})


require('dotenv').config()
app.use(express.json())
app.use('/api/users', userRoute)
app.use('/api/chat', chatRoute)
app.use('/api/messages', messageRoute)


io.on('connection', (socket) => {
    console.log('A client connected.', socket.id);

    socket.on('onlineUser', (userName) => {
        const onlineUser = {
            socketId: socket.id,
            userName: userName,

        }
        onlineUsers.push(onlineUser)
        socket.userName = userName;
        console.log(`User ${socket.userName} connected.`);
        console.log(onlineUsers);
        io.sockets.emit('onlineUser', onlineUsers);
    });

    socket.on('message', (data) => {
        console.log('Received message:', data);
        console.log(data.nameReceiver)
        // io.to(socket.name === data.nameReceiver).emit('message', data); 
        const recipientSocket = onlineUsers.find(user => user.userName === data.nameReceiver);

        if (recipientSocket) {
            // If the recipient is online, send the private message to their socket
            io.to(recipientSocket.socketId).emit('message', data);
        } else {
            // Handle the case when the recipient is not online or not found
            console.log(`User ${data.nameReceiver} is not online or not found.`);
            // You can emit a message back to the sender indicating the error, if needed.
            // For example: io.to(socket.id).emit('message', { error: "Recipient not online." });
        }// Gửi tin nhắn đến tất cả các kết nối socket
    });
    // socket.on('onlineUser', (data) => {
    //     console.log('Received message:', data);
    //     io.emit('onlineUsers', data); // Gửi tin nhắn đến tất cả các kết nối socket
    // });



    socket.on('disconnect', () => {
        console.log('A client disconnected. ', socket.id);
    });

});




const port = process.env.PORT || 5000;
server.listen(port, (req, res) => {
    console.log(`Server running on port.... :${port}`)
});
console.log(process.env.ATLAS_URL)
mongoose.connect(process.env.ATLAS_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true

}).then(() => console.log('MongoDb connection'))
    .catch((error) => console.log("mongoDb failed", error))

