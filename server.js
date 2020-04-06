// var express = require('express');
// var app = express();
var app = require('express')();
//var cookieParser = require('cookie-parser');
var http = require('http').Server(app);
//app.use(cookieParser());
var io = require('socket.io')(http);
var port = 3000;

http.listen(port, function(){
    console.log(`listening on port ${port}...`);
})

app.get('/', function(req, res){
    res.sendFile(__dirname + "/index.html");
});

app.get('/name.html', function(req, res){
    res.sendFile(__dirname + "/name.html");
});

app.get('/lobby.html', function(req, res){
    res.sendFile(__dirname + "/lobby.html");
});

app.get('/main.js', function(req, res){
    res.sendFile(__dirname + "/main.js");
});

io.on('connection', function(socket){
    function log(){
        var array=['*** Server Log Message:'];
        for(var i = 0; i < arguments.length; i++){
            array.push(arguments[i]);
            console.log(arguments[i]);
        }
        socket.emit('log', array);
        socket.broadcast.emit('log', array);
    }

    socket.on('disconnect', function(){
        log("disconnected")
    });

    socket.on('join_room', function(payload){
        log("server received join room command", payload);
        if(('undefined' === typeof payload || !payload)){
            var error_message = 'join_room had no payload, command aborted';
            log(error_message);
            socket.emit('join_room_response', {
                                                result: 'fail',
                                                message: error_message
            

            });
            return;

        }
        var room = payload.room;
        if(('undefined' === typeof room || !room)){
            var error_message = 'join_room did not specify a room, command aborted';
            log(error_message);
            socket.emit('join_room_response', {
                                                result: 'fail',
                                                message: error_message

            });
            return;

        }

        var username = payload.username;
        if(('undefined' === typeof username || !username)){
            var error_message = 'join_room did not specify a username, command aborted';
            log(error_message);
            socket.emit('join_room_response', {
                                                result: 'fail',
                                                message: error_message

            });
            return;

        }

        socket.join(room);
        var roomObject = io.sockets.adapter.rooms[room];
        if(('undefined' === typeof roomObject || !roomObject)){
            var error_message = 'join_room could not create a room (internal error), command aborted';
            log(error_message);
            socket.emit('join_room_response', {
                                                result: 'fail',
                                                message: error_message

            });
            return;

        }

        var numClients = roomObject.length;
        var success_data = {
                                result:success_data,
                                room: room,
                                username: username,
                                membership: (numClients + 1)
                            };
        io.sockets.in(room).emit('join_room_response', success_data);
        log('Room ' + room + ' was just joined by ' + username);

    });

    socket.on('send_message', function(payload){
        log("server received join room command", 'send_message', payload);
        if(('undefined' === typeof payload || !payload)){
            var error_message = 'send_message had no payload, command aborted';
            log(error_message);
            socket.emit('send_message_response', {
                                                result: 'fail',
                                                message: error_message
            

            });
            return;

        }
        var room = payload.room;
        if(('undefined' === typeof room || !room)){
            var error_message = 'send_message did not specify a room, command aborted';
            log(error_message);
            socket.emit('send_message_response', {
                                                result: 'fail',
                                                message: error_message

            });
            return;

        }

        var username = payload.username;
        if(('undefined' === typeof username || !username)){
            var error_message = 'send_message did not specify a username, command aborted';
            log(error_message);
            socket.emit('send_message_response', {
                                                result: 'fail',
                                                message: error_message

            });
            return;

        }

        var message = payload.message;
        if(('undefined' === typeof username || !username)){
            var error_message = 'send_message did not specify a message, command aborted';
            log(error_message);
            socket.emit('send_message_response', {
                                                result: 'fail',
                                                message: error_message

            });
            return;

        }

        var success_data = {
            result:'success',
            room:room,
            username: username,
            message:message
        }
        io.sockets.in(room).emit('send_message_response', success_data);
        log('Message sent to room ' + room + 'by ' + username);
    });

});