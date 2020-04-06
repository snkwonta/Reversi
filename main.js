// namess= new Array("balloon", "cat", "dog", "mouse", "fish","rabbit", "hat", "dice", "button", "bat" , "wall")

//import { Socket } from "dgram";

// function make_user() {
// 	return{
// 		name: (namess[Math.floor((Math.random() * 10))] + "-" + namess[Math.floor((Math.random() * 10))] + "-" + namess[Math.floor((Math.random() * 10))]),
// 		color: "FFFFFF",
// 	}
// }

function getURLParam(whichParam){
    var pageURL = window.location.search.substring(1);
    var pageURLVariables = pageURL.split('&');
    for(var i = 0; i < pageURLVariables.length; i++){
        var paramName = pageURLVariables[i].split('=');
        if(paramName[0] == whichParam){
            return paramName[1];
        }
    }
}

var username = getURLParam('username');
if('undefined' == typeof username || !username){
    username = 'Your Username is ' + Math.random();
}

var chatroom = 'One_Room';

var socket = io.connect();
socket.on('log',function(array){
    console.log.apply(console, array);
});

socket.on('join_room_response', function(payload){
    if(payload.result=='fail'){
        alert(payload.message);
        return;
    }
    $('#messages').append('<p>New user has joined the room: ' + payload.username+'</p>');


});

socket.on('send_message_response', function(payload){
    if(payload.result=='fail'){
        alert(payload.message);
        return;
    }
    $('#messages').append('<p>' + payload.username+ ' says: ' + payload.message + '</p>');


});

function send_message(){
    var payload={};
    payload.room=chatroom;
    payload.username = username;
    payload.message=$('#send_message_holder').val();
    console.log('***Client Log message: \send message\' payload: '+JSON.stringify(payload));
    socket.emit('send_message', payload);


}


$(function(){
    var payload={};
    payload.room=chatroom;
    payload.username = username;

    console.log('***Client Log message: \join_room\' payload: '+JSON.stringify(payload));
    socket.emit('join_room', payload);

});

