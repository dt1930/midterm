

const game_width=320;
const game_height=600;
const game_ground=game_height-50;
let socket=io();
let game;
let bg,fruitImage,basketImage;
let userInfo;
let clickStart=false;
let startButton,resetButton;
let roleAssigned;
let numberOfUsers;
let roomFull=false;
let gameFinished=false;
let dataReceived=false;
let emitted=false;
let resetButtonCreated=false;
let startingTime=1; //number of minutes for the game
let gametime=startingTime*60; //number of seconds for the game
let bodyElement=document.getElementsByTagName('body')[0];
let info=document.getElementById('info');
let timer=document.getElementById('timer');
let userName=document.getElementById('username');
let userScore=document.getElementById('userScore');
let firstPlayer,secondPlayer,scoreInfo,totalFruits;
let winAudio = new Audio('./sounds/point_collection.mp3');
let lostAudio= new Audio('./sounds/missed_point.mp3');
userName.innerHTML=sessionStorage.getItem('name')+"||";
let roomNum=document.getElementById('roomNum');
roomNum.innerHTML=sessionStorage.getItem('room')+"||";
let role=document.getElementById('role');

socket.on("connect",()=>{
    console.log("I am connected to server via sockets as a client!")
    userInfo={
        'userName':sessionStorage.getItem('name'),
        'room':sessionStorage.getItem('room'),
    }
    socket.emit('userData',userInfo)
})

function setup(){
    bg=loadImage('./images/tree.png');
    high=loadImage('./images/high.png');
    medium=loadImage('./images/medium.png');
    low=loadImage('./images/low.png');
    fruitImage=loadImage('./images/fruit.png');
    basketImage=loadImage('./images/basket.png');
    game = new Game(game_width, game_height, game_ground);
    let cnv=createCanvas(game.w,game.h);
    cnv.position(25,50);
    socket.on('packed',()=>{
        textSize(20);
        fill(255,0,0);
        text('Sorry, this room is full!', (width/2-100), 20);
        roomFull=true;
    })
    socket.on('userCount',(data)=>{
        console.log(data);
        if (data==1){
            textSize(25);
            text('You will click on fruit!', (width/2-100), 20);
            roleAssigned="pluck";
        }
        else if (data==2){
            textSize(25);
            text('You will move the basket!', (width/2-120), 20);
            roleAssigned="drag";
        }
        fill(255,0,0);
        startButton = createButton('Start game!');
        startButton.position((width/2)-10,15);
        startButton.mousePressed(gameStart);
    })
}
function gameStart(){
    clickStart=true;
    startButton.hide();
    setInterval(timerUpdate,1000);
}
function timerUpdate(){
    if (gameFinished==false){
        let minutes=Math.floor(gametime/60);
        let seconds=gametime%60;
        seconds=seconds<10 ? "0"+seconds : seconds;
        let timerObj={
            min:minutes,
            sec:seconds
        }
        if (roleAssigned=="pluck"){
            socket.emit('timerStart',timerObj);
        }
        socket.on('timerStart',(data)=>{
            timer.innerHTML=data.min+":"+data.sec;
        })
        gametime--;
        if (gametime<0){
            gameFinished=true;
            emitted=false;
        }
    }
}

function draw(){
    if (clickStart){
        role.innerHTML=roleAssigned+"||";
        bodyElement.style.background='none';
        bodyElement.style.backgroundColor="yellow";
        background(bg);
        game.displayGame(); //game starts here
        info.style.display="block";
        for (let i=0; i<game.listOfFruits.length; i++){
            if (game.listOfFruits[i].y>=game_height){
                game.remove(game.listOfFruits[i]);
            }
        }
    }
    if (gameFinished==true){
        bodyElement.style.backgroundColor="orange"
        background(255, 215, 0);
        socket.emit('gameFinished',true);
        textSize(25);
        if (dataReceived==true){
            text(firstPlayer,(width/2-60), 100);
            text ("&",(width/2-40),140);
            text(secondPlayer, (width/2-60),180);
            text ("Cooperation rating:",20,220);
            let cooperationRating=Math.floor((scoreInfo/totalFruits)*100)
            if (cooperationRating>=75){
                image(high,60,250);
            }
            else if (cooperationRating>=50){
                image(medium,60,250);
            }
            else{
                image(low,60,250);
            }
            cooperationRating+="%"
            text (cooperationRating,235,220);
            if(resetButtonCreated==false){
                resetButtonCreated=true;
                resetButton = createButton('Restart game!');
                resetButton.position((width/2)-25,540);
                resetButton.mousePressed(gameReset);
            }
        }
    }
}
socket.on('resetGame',(data)=>{
    console.log("clicked")
    gametime=60;
    dataReceived=false;
    game = new Game(game_width, game_height, game_ground);
    resetButtonCreated=false;
    gameFinished=false;
    clickStart=true;
    resetButton.hide();
})
function gameReset(){
    if (emitted==false){
        socket.emit('resetGame',true);
        emitted=true;
    }
}
function mousePressed(){
    if (gameFinished==false){
        if (roleAssigned=="pluck"){
            for (let i=0; i<game.listOfFruits.length; i++){
                if (game.listOfFruits[i].x-game.listOfFruits[i].r<=mouseX && mouseX<=game.listOfFruits[i].x+game.listOfFruits[i].r &&
                    game.listOfFruits[i].y-game.listOfFruits[i].r<=mouseY && mouseY<=game.listOfFruits[i].y+game.listOfFruits[i].r &&
                    game.listOfFruits[i].clicked==false){
                    let clickedObjTime=game.listOfFruits[i].timestamp;
                    socket.emit("clickedObj",clickedObjTime);
                }
            }
        }
    }
}
socket.on('clickedObj',(data)=>{
    for (let i=0; i<game.listOfFruits.length;i++){
        if (game.listOfFruits[i].timestamp==data &&game.listOfFruits[i].clicked==false){
            game.listOfFruits[i].gravity();
            game.listOfFruits[i].clicked=true;
        }
    }
})
function mouseDragged(){
    if (roleAssigned=="drag"){
        if (gameFinished==false){
            let value=mouseX-(game.basket.w/2);
            socket.emit('baskDragPos',value);
        }
    }
}
function keyPressed(){
    if (roleAssigned=="drag"){
        if (gameFinished==false){
            if (game.basket.x<0){
                game.basket.x=0;
                game.basket.vx=20;
            }
            else if (game.basket.x+game.basket.w>game.w){
                game.basket.x=game.w-game.basket.w;
                game.basket.vx=-20
            }
            else{
                if (keyCode==LEFT_ARROW){
                    game.basket.vx=-20
                    
                }
                else if (keyCode==RIGHT_ARROW){
                    game.basket.vx=20
                }
            }
            let value=game.basket.x+game.basket.vx;
            socket.emit('basketPosition',value);
        }
    }
}
socket.on('basketPosition',(data)=>{
    game.basket.x=data;
})
socket.on('captured',(data)=>{
    game.score=data
    userScore.innerHTML=game.score+"||";
    console.log('called me');
})
socket.on('baskDragPos',(data)=>{
    game.basket.x=data;
})
socket.on('gameFinished',(data)=>{
    firstPlayer=data.firstPlayer;
    secondPlayer=data.secondPlayer;
    scoreInfo=data.score;
    totalFruits=data.totalFruits;
    dataReceived=true;
    console.log(scoreInfo);
    console.log(totalFruits);
})
socket.on('userLeft',(data)=>{
    alert(data);
})








































