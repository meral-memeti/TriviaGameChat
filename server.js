var express = require('express');
var socket = require('socket.io');
var app = express();
var onlineUsers = {};

//This will make the server run on a certain port in this instance its on port 3000
var server = app.listen(3000, function() {
    console.log((new Date()) + " Server is running on port 3000");
});

//Serving static files in Express.
app.use("/", express.static("./public"));
var io = socket(server);

//socket.on()- this method takes an event name and callback function as parameters, connection in this case.
//wait for the connection event to log when a user is connected.
//with socket.id parameter we will access the unique sessionID of the socket connection.
io.on('connection', function(socket) {
    console.log('a user connected, id : ', socket.id);


    //This will check if the user has left the chat, if in case the user has left the chat, 
    //it will show the user's id and name of the respective user that has left the chat.
    socket.on('disconnect', function() {
        console.log('user disconnected. id :', socket.id, " , triviaId :", socket.triviaId);
        let disUserName = socket.triviaId;
        delete onlineUsers[disUserName];
        io.sockets.emit("userLeft", { name: disUserName });

    });

    //This will add the user when the user has provided their username.
    socket.on('userAdded', function(data) {
        onlineUsers[data.name] = socket.id;
        data.onlineUsers = onlineUsers;
        data.socketId = socket.id;
        io.sockets.emit("userAdded", data);
        socket.triviaId = data.name;
    });

    //This allows the users to send a broadcast message.
    socket.on('msg', function(data) {
        let socketId = socket.id;
        data.socketId = socketId;
        socket.broadcast.emit("msg", data);
    });


    //This will tell the server that a user is typing and it will display it to the other users.
    socket.on('typing', (data) => {
        if (data.typing == true)
            io.emit('display', data)
        else
            io.emit('display', data)
    })

    //This allows the users to send a multicast/unicast message to selected users only.
    socket.on('pm', function(data) {
        let socketId = socket.id;
        data.socketId = socketId;
        socket.to(data.toSocketId).emit("pm", data);
    });

});