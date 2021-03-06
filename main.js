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

var chat_room = getURLParam('game_id');
if('undefined' == typeof chat_room || !chat_room){
    chat_room = 'lobby';
}



var socket = io.connect();
socket.on('log',function(array){
    console.log.apply(console, array);
});

socket.on('join_room_response', function(payload){
    if(payload.result== 'fail'){
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
        var cButton = makeInviteButton(payload.socket_id);
        nodeC.append(cButton);

        nodeA.hide();
        nodeB.hide();
        nodeC.hide();
        $('#players').append(nodeA,nodeB,nodeC);
        nodeA.slideDown(1000);
        nodeB.slideDown(1000);
        nodeC.slideDown(1000);

    }else {
        uninvite(payload.socket_id);
        var cButton=makeInviteButton(payload.socket_id);
        $('.socket_' + payload.socket_id+' button').replaceWith(cButton);
        dom_elements.slideDown(1000);
    }

    var newHTML = '<p>' + payload.username + ' just entered the room </p>';
    var newNode = $(newHTML);
    newNode.hide();
    $('#messages').prepend(newNode);
    newNode.slideDown(1000);
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
    if(dom_elements.length != 0){
        dom_elements.slideUp(1000);
    }

    var newHTML = '<p>' + payload.username + ' has left the lobby </p>';
    var newNode = $(newHTML);
    newNode.hide();
    $('#messages').append(newNode);
    newNode.slideDown(1000);

});

function invite(who){
    var payload = {};
    payload.requested_user = who;
    console.log('***Client Log Message: \'invite\' payload: ' + JSON.stringify(payload));
    socket.emit('invite', payload);
}

socket.on('invite_response', function(payload){
    if(payload.result=='fail'){
        alert(payload.message);
        return;
    }
    var newNode = makeInvitedButton(payload.socket_id);
    $('.socket_'+payload.socket_id+' button').replaceWith(newNode);    
});

socket.on('invited', function(payload){
    if(payload.result=='fail'){
        alert(payload.message);
        return;
    }
    var newNode = makePlayButton(payload.socket_id);
    $('.socket_'+payload.socket_id+' button').replaceWith(newNode);    
});


function uninvite(who){
    var payload = {};
    payload.requested_user = who;
    console.log('***Client Log Message: \'uninvite\' payload: ' + JSON.stringify(payload));
    socket.emit('uninvite', payload);
}

socket.on('uninvite_response', function(payload){
    if(payload.result=='fail'){
        alert(payload.message);
        return;
    }
    var newNode = makeInviteButton(payload.socket_id);
    $('.socket_'+payload.socket_id+' button').replaceWith(newNode);    
});

socket.on('uninvited', function(payload){
    if(payload.result=='fail'){
        alert(payload.message);
        return;
    }
    var newNode = makeInviteButton(payload.socket_id);
    $('.socket_'+payload.socket_id+' button').replaceWith(newNode);    
});

function game_start(who){
    var payload = {};
    payload.requested_user = who;
    console.log('***Client Log Message: \'game_start\' payload: ' + JSON.stringify(payload));
    socket.emit('game_start', payload);
}

//play
socket.on('game_start_response', function(payload){
    if(payload.result=='fail'){
        alert(payload.message);
        return;
    }
    var newNode = makeEngageButton(payload.socket_id);
    $('.socket_'+payload.socket_id+' button').replaceWith(newNode); 
    
    //go to new page
    window.location.href = 'game.html?username='+username+'&game_id='+payload.game_id;
});

function send_message(){
    var payload={};
    payload.room=chat_room;
    payload.message=$('#send_message_holder').val();
    console.log('***Client Log message: \send message\' payload: '+JSON.stringify(payload));
    socket.emit('send_message', payload);
    $('#send_message_holder').val('');
}


socket.on('send_message_response', function(payload){
    if(payload.result=='fail'){
        alert(payload.message);
        return;
    }
    var newHTML = '<p>' + payload.username+ ' says: ' + payload.message + '</p>';
    var newNode = $(newHTML);
    newNode.hide();
    $('#messages').append(newNode);
    newNode.slideDown(1000);


});


function makeInviteButton(socket_id){
    var newHTML='<button type=\'button\' class=\'btn btn-outline-primary\'>Invite</button>';
    var newNode = $(newHTML);
    newNode.click(function(){
        invite(socket_id);
    });
    return(newNode);
}

function makeInvitedButton(socket_id){
    var newHTML='<button type=\'button\' class=\'btn btn-primary\'>Invited</button>';
    var newNode = $(newHTML);
    newNode.click(function(){
        uninvite(socket_id);
    });
    return(newNode);
}

function makePlayButton(socket_id){
    var newHTML='<button type=\'button\' class=\'btn btn-success\'>Play</button>';
    var newNode=$(newHTML);
    newNode.click(function(){
        game_start(socket_id);
    });
    return(newNode);
}

function makeEngageButton(){
    var newHTML='<button type=\'button\' class=\'btn btn-danger\'>Engaged</button>';
    var newNode=$(newHTML);
    return(newNode);
}


$(function(){
    var payload={};
    payload.room=chat_room;
    payload.username = username;

    console.log('***Client Log message: \join_room\' payload: '+JSON.stringify(payload));
    socket.emit('join_room', payload);

    $('#quit').append ('<a href="lobby.html?username='+username+'"class="btn btn-danger btn-default active" role="button" aria-pressed="true">Quit</a>')

});

var old_board = [
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],
                    ['?','?','?','?','?','?','?','?'],

                ];

var my_color = ' ';

socket.on('game_update', function(payload){
    console.log('***Client Log Message: \'game_update\'\n\tpayload: ' + JSON.stringify(payload));
    if(payload.result=='fail'){
        console.log(payload.message);
        window.location.href = 'lobby.html?username='+username;
        return;
    }

    var board = payload.game.board;
    if('undefined'== typeof board || !board){
        console.log('Internal error: recieved a maldformed board update form the server');
        return;
    }

    //update color
    var row, column;
    if(socket.id == payload.game.player_white.socket){
        my_color = 'white';
    }else if(socket.id == payload.game.player_black.socket){
        my_color = 'black';
    }else{
        window.location.href='lobby.html?username='+username;
        return;
    }

    $('#my_color').html('<h3 id="my_color">I am '+my_color+'</h3>');
    $('#my_color').append('<h4>It is '+payload.game.whose_turn+'\'s turn</h4>')

    var whitesum = 0;
    var blacksum = 0;
    for(row = 0; row<8; row++){
        for(column = 0; column<8; column++){

            if(board[row][column] == 'b'){
                blacksum++;
            }
            if(board[row][column] == 'w'){
                whitesum++;
            }
            //check if board has changed
            if(old_board[row][column]!= board[row][column]){
                if(old_board[row][column]=='?' && board[row][column] == ' '){
                    $('#'+row+'_'+column).html('<img src="chinese-checkers.png" alt="empty"/>');
                }else if(old_board[row][column]=='?' && board[row][column] == 'w'){
                    $('#'+row+'_'+column).html('<img src="chinese-checkers-5.png" alt="white"/>');
                }else if(old_board[row][column]=='?' && board[row][column] == 'b'){
                    $('#'+row+'_'+column).html('<img src="chinese-checkers-2.png" alt="black"/>');
                }else if(old_board[row][column]==' ' && board[row][column] == 'w'){
                    $('#'+row+'_'+column).html('<img src="chinese-checkers-5.png" alt="white"/>');
                }else if(old_board[row][column]==' ' && board[row][column] == 'b'){
                    $('#'+row+'_'+column).html('<img src="chinese-checkers-2.png" alt="black"/>');
                }else if(old_board[row][column]=='w' && board[row][column] == ' '){
                    $('#'+row+'_'+column).html('<img src="chinese-checkers.png" alt="empty"/>');
                }else if(old_board[row][column]=='b' && board[row][column] == ' '){
                    $('#'+row+'_'+column).html('<img src="chinese-checkers.png" alt="empty"/>');
                }else if(old_board[row][column]=='w' && board[row][column] == 'b'){
                    $('#'+row+'_'+column).html('<img src="chinese-checkers-2.png" alt="black"/>');
                }else if(old_board[row][column]=='b' && board[row][column] == 'w'){
                    $('#'+row+'_'+column).html('<img src="chinese-checkers-5.png" alt="white"/>');
                } else{
                    $('#'+row+'_'+column).html('<img src="chinese-checkers.png" alt="error"/>');
                }
            }
            $('#'+row+'_'+column).off('click');
            $('#'+row+'_'+column).removeClass('hovered_over');

            if(payload.game.whose_turn === my_color){
                if(payload.game.legal_moves[row][column] === my_color.substring(0,1)){
                    if((board[row][column]) == ' '){
                        $('#'+row+'_'+column).addClass('hovered_over');
                        $('#'+row+'_'+column).click(function(r,c){
                            return function(){
                                var payload = {};
                                payload.row = r;
                                payload.column = c;
                                payload.color= my_color;
                                console.log('*** Client Log Message \'play_token\' payload: ' + JSON.stringify(payload));
                                socket.emit('play_token', payload);
                            };
                        }(row,column));
                    } 

                }
            }
                

            }
        }

    $('#blacksum').html(blacksum);
    $('#whitesum').html(whitesum);
    old_board = board;
});

socket.on('play_token_response', function(payload){
    console.log('***Client Log Message: \'play_token_response\'\n\tpayload: ' + JSON.stringify(payload));
    if(payload.result=='fail'){
        console.log(payload.message);
        alert(payload.message);
        return;
    }
});

socket.on('game_over', function(payload){
    console.log('***Client Log Message: \'game_over\'\n\tpayload: ' + JSON.stringify(payload));
    if(payload.result=='fail'){
        console.log(payload.message);
        return;
    }

    $('#game_over').html('<h1>Game Over</h1><h2>'+payload.who_won+'won</h2>');
    $('#game_over').append('<a href="lobby.html?username='+username+'"class="btn btn-success btn-lg active" role="button" aria-pressed="true">Return to lobby</a>');
});
