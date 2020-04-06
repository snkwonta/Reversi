namess= new Array();
namess.push("Small", "Big", "Medium", "Miniscule");
namess.push("Red", "Blue", "Bad", "Good", "Round");
namess.push("Bear", "Dog", "Potato", "Orangutan", "Klingon");


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
    username= (namess[Math.floor((Math.random() * 10))] + "-" + namess[Math.floor((Math.random() * 10))] + "-" + namess[Math.floor((Math.random() * 10))]);
}

var chatroom = getURLParam('game_id');
if('undefined' == typeof chatroom || !chatroom){
    chatroom = 'Lobby';
}



var socket = io.connect();
socket.on('log',function(array){
    console.log.apply(console, array);
});

socket.on('join_room_response', function(payload){
    if(payload.result=='fail'){
        alert(payload.message);
        return;
    }
    if(payload.socket_id == socket.id){
        return;
    }

    var dom_elements = $('.socket_' + payload.socket_id);
    if(dom_elements.length == 0){
        var nodeA = $('<div></div>');
        nodeA.addClass('socket_' + payload.socket_id);
        var nodeB = $('<div></div>');
        nodeB.addClass('socket_' + payload.socket_id);
        var nodeC = $('<div></div>');
        nodeC.addClass('socket_' + payload.socket_id);

        nodeA.addClass('w-100');
        nodeB.addClass('col-9 text-right');
        nodeB.append('<h4>' + payload.username + '</h4>');

        nodeC.addClass('col-3 text-left');
        var cButton = makeInviteButton();
        nodeC.append(cButton);

        nodeA.hide();
        nodeB.hide();
        nodeC.hide();
        $('#players').append(nodeA,nodeB,nodeC);
        nodeA.slideDown(1000);
        nodeB.slideDown(1000);
        nodeC.slideDown(1000);

    }else {
        var cButton=makeInviteButton();
        $('.socket_' + payload.socket_id+' button').replaceWith(cButton);
        dom_elements.slideDown(1000);
    }

    var newHTML = '<p>' + payload.username + ' just entered the lobby </p>';
    var newNode = $(newHTML);
    newNode.hide();
    $('#messages').append(newNode);
    newNode.slideDown(1000);

    $('#messages').append('<p>New user has joined the room: ' + payload.username+'</p>');


});

socket.on('player_disconnected', function(payload){
    if(payload.result=='fail'){
        alert(payload.message);
        return;
    }
    if(payload.socket_id == socket.id){
        return;
    }

    var dom_elements = $('.socket_' + payload.socket.id);
    if(dom_elements.length == 0){
        dom_elements.slideUp(1000);


    }else {
        var cButton=makeInviteButton();
        $('.socket_' + payload.socket_id+' button').replaceWith(cButton);
        dom_elements.slideDown(1000);
    }

    var newHTML = '<p>' + payload.username + ' has left the lobby </p>';
    var newNode = $(newHTML);
    newNode.hide();
    $('#messages').append(newNode);
    newNode.slidedown(1000);

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

function makeInviteButton(){
    var newHTML='<button type=\'button\' class=\'btn btn-outline-primary\'> Invite </button>';
    var newNode=$(newHTML);
    return(newNode);
}


$(function(){
    var payload={};
    payload.room=chatroom;
    payload.username = username;

    console.log('***Client Log message: \join_room\' payload: '+JSON.stringify(payload));
    socket.emit('join_room', payload);

});

