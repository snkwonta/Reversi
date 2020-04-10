// var express = require('express');
// var app = express();
var app = require('express')();
//var cookieParser = require('cookie-parser');
var http = require('http').Server(app);
//app.use(cookieParser());
var io = require('socket.io')(http);
var port = 3000;

var players = [];

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

app.get('/game.html', function(req, res){
    res.sendFile(__dirname + "/game.html");
});

app.get('/game.css', function(req, res){
    res.sendFile(__dirname + "/game.css");
});

app.get('/chinese-checkers-2.png', function(req, res){
    res.sendFile(__dirname + "/chinese-checkers-2.png");
});
app.get('/chinese-checkers-3.png', function(req, res){
    res.sendFile(__dirname + "/chinese-checkers-3.png");
});
app.get('/chinese-checkers-5.png', function(req, res){
    res.sendFile(__dirname + "/chinese-checkers-5.png");
});
app.get('/chinese-checkers-6.png', function(req, res){
    res.sendFile(__dirname + "/chinese-checkers-6.png");
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
        log("Client disconnected" + JSON.stringify(players[socket.id]));

        if('undefined' !== typeof players[socket.id] && players[socket.id]){
            var username = players[socket.id].username;
            var room = players[socket.id].room;
            var payload={
                username: username,
                socket_id: socket.id
            };
            delete players[socket.id];
            io.in(room).emit('player_disconnected ', payload);
        }
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
        players[socket.id] = {};
        players[socket.id].username = username;
        players[socket.id].room = room;



        socket.join(room);
        var roomObject = io.sockets.adapter.rooms[room];

        var numClients = roomObject.length;
        var success_data = {
                                result:success_data,
                                room: room,
                                username: username,
                                socket_id: socket.id,
                                membership: (numClients + 1)
                            };
        io.in(room).emit('join_room_response', success_data);

        for(var socket_in_room in roomObject.sockets){
            var success_data = {
                result:success_data,
                room: room,
                username: players[socket_in_room].username,
                socket_id: socket_in_room,
                membership: (numClients + 1)
            };
            socket.emit('join_room_response', success_data);

        }
        log('join_room success');
        log('Room ' + room + ' was just joined by ' + username);

        if(room!=='lobby'){
            send_game_update(socket, room, 'initial update');
        }

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

        var username = players[socket.id].username;
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
        io.in(room).emit('send_message_response', success_data);
        log('Message sent to room ' + room + 'by ' + username + 'success_data: '+JSON.stringify(success_data));
    });

    socket.on('invite', function(payload){
        log("invite received with", JSON.stringify(payload));
        if(('undefined' === typeof payload || !payload)){
            var error_message = 'invite had no payload, command aborted';
            log(error_message);
            socket.emit('invite_response', {
                                                result: 'fail',
                                                message: error_message
                                            });
            return;

        }

        var username = players[socket.id].username;
        if(('undefined' === typeof username || !username)){
            var error_message = 'invite cant identify who sent the message, command aborted';
            log(error_message);
            socket.emit('invite_response', {
                                                result: 'fail',
                                                message: error_message
                                            });
            return;

        }

        var requested_user = payload.requested_user;
        if(('undefined' === typeof requested_user || !requested_user)){
            var error_message = 'invite did not specify a requested_user, command aborted';
            log(error_message);
            socket.emit('invite_response', {
                                                result: 'fail',
                                                message: error_message

                                            });
            return;

        }

        var room = players[socket.id].room;
        var roomObject = io.sockets.adapter.rooms[room];
        if(!roomObject.sockets.hasOwnProperty(requested_user)){
            var error_message = 'invite requesred a user that was  ot in the room, command aborted';
            log(error_message);
            socket.emit('invite_response', {
                                                result: 'fail',
                                                message: error_message

                                            });
            return;
        }
        var success_data = {
            result: 'success',
            socket_id: requested_user
        }
        socket.emit('invite_response', success_data);

        var success_data = {
            result: 'success',
            socket_id: socket.id
        }
        socket.to(requested_user).emit('invited', success_data);
        log('invite successful');
    });

    socket.on('uninvite', function(payload){
        log("uninvite received with", JSON.stringify(payload));
        if(('undefined' === typeof payload || !payload)){
            var error_message = 'uninvite had no payload, command aborted';
            log(error_message);
            socket.emit('uninvite_response', {
                                                result: 'fail',
                                                message: error_message
                                            });
            return;

        }

        var username = players[socket.id].username;
        if(('undefined' === typeof username || !username)){
            var error_message = 'uninvite cant identify who sent the message, command aborted';
            log(error_message);
            socket.emit('uninvite_response', {
                                                result: 'fail',
                                                message: error_message
                                            });
            return;

        }

        var requested_user = payload.requested_user;
        if(('undefined' === typeof requested_user || !requested_user)){
            var error_message = 'uninvite did not specify a requested_user, command aborted';
            log(error_message);
            socket.emit('uninvite_response', {
                                                result: 'fail',
                                                message: error_message

                                            });
            return;

        }

        var room = players[socket.id].room;
        var roomObject = io.sockets.adapter.rooms[room];
        if(!roomObject.sockets.hasOwnProperty(requested_user)){
            var error_message = 'invite requesred a user that was  ot in the room, command aborted';
            log(error_message);
            socket.emit('uninvite_response', {
                                                result: 'fail',
                                                message: error_message

                                            });
            return;
        }
        var success_data = {
            result: 'success',
            socket_id: requested_user
        }
        socket.emit('uninvite_response', success_data);

        var success_data = {
            result: 'success',
            socket_id: socket.id
        }
        socket.to(requested_user).emit('uninvited', success_data);
        log('uninvite successful');
    });

    socket.on('game_start', function(payload){
        log("uninvite received with", JSON.stringify(payload));
        if(('undefined' === typeof payload || !payload)){
            var error_message = 'game_start had no payload, command aborted';
            log(error_message);
            socket.emit('game_start_response', {
                                                result: 'fail',
                                                message: error_message
                                            });
            return;

        }

        var username = players[socket.id].username;
        if(('undefined' === typeof username || !username)){
            var error_message = 'game_start cant identify who sent the message, command aborted';
            log(error_message);
            socket.emit('game_start_response', {
                                                result: 'fail',
                                                message: error_message
                                            });
            return;

        }

        var requested_user = payload.requested_user;
        if(('undefined' === typeof requested_user || !requested_user)){
            var error_message = 'game_start did not specify a requested_user, command aborted';
            log(error_message);
            socket.emit('game_start_response', {
                                                result: 'fail',
                                                message: error_message

                                            });
            return;

        }

        var room = players[socket.id].room;
        var roomObject = io.sockets.adapter.rooms[room];
        //make sure someone is in the room
        if(!roomObject.sockets.hasOwnProperty(requested_user)){
            var error_message = 'game_start requesred a user that was  ot in the room, command aborted';
            log(error_message);
            socket.emit('game_start_response', {
                                                result: 'fail',
                                                message: error_message

                                            });
            return;
        }

        //everything is good and need game_id
        var game_id = Math.floor((1+Math.random())*0x1000).toString(16).substring(1);
        var success_data = {
            result: 'success',
            socket_id: requested_user,
            game_id: game_id
        }
        socket.emit('game_start_response', success_data);

        //tell other player to play

        var success_data = {
            result: 'success',
            socket_id: socket.id,
            game_id: game_id
        }
        socket.to(requested_user).emit('game_start_response', success_data);
        log('game_start successful');
    });

    socket.on('play_token', function(payload){
        log("uninvite received with", JSON.stringify(payload));
        if(('undefined' === typeof payload || !payload)){
            var error_message = 'play_token had no payload, command aborted';
            log(error_message);
            socket.emit('play_token_response', {
                                                result: 'fail',
                                                message: error_message
                                            });
            return;

        }

        //check player has been in room
        var player = players[socket.id];
        if(('undefined' === typeof player || !player)){
            var error_message = 'The server does not recognize you.';
            log(error_message);
            socket.emit('play_token_response', {
                                                result: 'fail',
                                                message: error_message
                                            });
            return;

        }

        var username = players[socket.id].username;
        if(('undefined' === typeof username || !username)){
            var error_message = 'play_token cannot identify who sent the message';
            log(error_message);
            socket.emit('play_token_response', {
                                                result: 'fail',
                                                message: error_message
                                            });
            return;

        }

        var game_id = players[socket.id].room;
        if(('undefined' === typeof game_id || !game_id)){
            var error_message = 'play_token cannot identify your game board';
            log(error_message);
            socket.emit('play_token_response', {
                                                result: 'fail',
                                                message: error_message
                                            });
            return;

        }

        var row = payload.row;
        if(('undefined' === typeof row || row < 0 || row > 7)){
            var error_message = 'play_token did not specify a valid row, command aborted';
            log(error_message);
            socket.emit('play_token_response', {
                                                result: 'fail',
                                                message: error_message
                                            });
            return;

        }

        var column = payload.column;
        if(('undefined' === typeof column || column < 0 || column > 7)){
            var error_message = 'play_token did not specify a valid column, command aborted';
            log(error_message);
            socket.emit('play_token_response', {
                                                result: 'fail',
                                                message: error_message
                                            });
            return;

        }

        var color = payload.color;
        if(('undefined' === typeof color || !color || (color!= 'white' && color != 'black'))){
            var error_message = 'play_token did not specify a valid color, command aborted';
            log(error_message);
            socket.emit('play_token_response', {
                                                result: 'fail',
                                                message: error_message
                                            });
            return;

        }

        var game = games[game_id];
        if(('undefined' === typeof game || !game)){
            var error_message = 'play_token did not your game, command aborted';
            log(error_message);
            socket.emit('play_token_response', {
                                                result: 'fail',
                                                message: error_message
                                            });
            return;

        }

        var success_data = {
                                result: 'success'

        }
        socket.emit('play_token_response', success_data);

        if(color == 'white'){
            game.board[row][column] = 'w';
            game.whose_turn = 'black';
        } else if(color == 'black'){
            game.board[row][column] = 'b';
            game.whose_turn = 'white';
        }

        var d = new Date();
        game.last_move_time = d.getTime();

        send_game_update(socket, game_id, 'played a token');
    });

});

//game state
var games = [];

function create_new_game(){
    var new_game = {};
    new_game.player_white = {};
    new_game.player_black = {};
    new_game.player_white.socket = '';
    new_game.player_black.socket = '';
    new_game.player_white.username = '';
    new_game.player_black.username = '';

    var d = new Date();
    new_game.last_move_time = d.getTime();

    new_game.whose_turn = 'white';
    new_game.board = [
                        [' ',' ',' ',' ',' ',' ',' ',' '],
                        [' ',' ',' ',' ',' ',' ',' ',' '],
                        [' ',' ',' ',' ',' ',' ',' ',' '],
                        [' ',' ',' ','w','b',' ',' ',' '],
                        [' ',' ',' ','b','w',' ',' ',' '],
                        [' ',' ',' ',' ',' ',' ',' ',' '],
                        [' ',' ',' ',' ',' ',' ',' ',' '],
                        [' ',' ',' ',' ',' ',' ',' ',' ']
                    ];

    return new_game;


}
function send_game_update(socket, game_id, message){
    //check if game_id already exists
    if(('undefined' === typeof games[game_id]) || !games[game_id]){
        console.log('No game exists. Creating '+game_id+' for '+socket.id);
        games[game_id] = create_new_game();

    }

    var roomObject;
    var numClients;
    do{
        roomObject = io.sockets.adapter.rooms[game_id];
        numClients = roomObject.length;
        if(numClients > 2){
            console.log('Too many clients in room: '+game_id+'#: '+numClients);
            if(games[game_id].player_white.socket == roomObject.sockets[0]){
                games[game_id].player_white.socket = '';
                games[game_id].player_white.username = '';
            }
            if(games[game_id].player_black.socket == roomObject.sockets[0]){
                games[game_id].player_black.socket = '';
                games[game_id].player_black.username = '';
            }
            var sacrifice = Object.keys(roomObject.sockets)[0];
            io.of('/').connected[sacrifice].leave(game_id);
        }

    }while((numClients-1)>2);
    //make sure only 2 people are in game room
    //assign socket color
    if((games[game_id].player_white.socket != socket.id) && games[game_id].player_black.socket != socket.id){
        console.log('Player is not assigned a color: ' + socket.id);
        if((games[game_id].player_black.socket != '') && (games[game_id].player_white.socket != '')){
            games[game_id].player_white.socket = '';
            games[game_id].player_black.socket = '';
            games[game_id].player_white.username = '';
            games[game_id].player_black.username = '';
        }
    }

    if(games[game_id].player_white.socket == ''){
        if(games[game_id].player_black.socket != socket.id){
            games[game_id].player_white.socket = socket.id;
            games[game_id].player_white.username = players[socket.id].username;
        }
    }

    if(games[game_id].player_black.socket == ''){
        if(games[game_id].player_white.socket != socket.id){
            games[game_id].player_black.socket = socket.id;
            games[game_id].player_black.username = players[socket.id].username;
        }
    }
    //send game update
    var success_data = {
        result: 'success',
        game: games[game_id],
        message: message,
        game_id: game_id
    };

    io.in(game_id).emit('game_update', success_data);
    //check if game is over 

    var row, column;
    var count = 0;
    for(row = 0; row < 8; row++){
        for(column = 0; column < 8; column++){
            if(games[game_id].board[row][column] != ' '){
                count++;
            }
        }
    }

    if(count == 64){
        var success_data = {
            result: 'success',
            game: games[game_id],
            who_won: 'everyone',
            game_id: game_id
        };

        io.in(game_id).emit('game_over', success_data);
        //delete old games
        setTimeout(function(id){
            return function(){
                delete games[id];
            }}(game_id)
            ,60*60*1000);
            


    }

}