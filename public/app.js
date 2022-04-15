
//the width and height of the canvas
const game_width=320;
const game_height=600;
const game_ground=game_height-50;
//intializing socket on the client side
let socket=io();
//initalizing the required variables
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
let gametime=startingTime*15; //number of seconds for the game
let firstPlayer,secondPlayer,scoreInfo,totalFruits;

//retrieving the elements from the html
let bodyElement=document.getElementsByTagName('body')[0];
let info=document.getElementById('info');
let timer=document.getElementById('timer');
let userName=document.getElementById('username');
let userScore=document.getElementById('userScore');

//creating audio objects
let winAudio = new Audio('./sounds/point_collection.mp3');
let lostAudio= new Audio('./sounds/missed_point.mp3');

//retreiving information from sessionStorage
userName.innerHTML=sessionStorage.getItem('name')+"||";
let roomNum=document.getElementById('roomNum');
roomNum.innerHTML=sessionStorage.getItem('room')+"||";
let role=document.getElementById('role');

//when client connects to the server
socket.on("connect",()=>{
    console.log("Connected to server via sockets as a client!")
    userInfo={
        'userName':sessionStorage.getItem('name'),
        'room':sessionStorage.getItem('room'),
    }
    socket.emit('userData',userInfo) //emitting the user information to the server
})

//p5.js setup function
function setup(){
    //loading all the required images for the game
    bg=loadImage('./images/tree.png');
    high=loadImage('./images/high.png');
    medium=loadImage('./images/medium.png');
    low=loadImage('./images/low.png');
    fruitImage=loadImage('./images/fruit.png');
    basketImage=loadImage('./images/basket.png');
    //creating a new game object
    game = new Game(game_width, game_height, game_ground);
    //creating and positioning the canvas
    let cnv=createCanvas(game.w,game.h);
    cnv.position(25,50);
    //when the client receives the infromation from the server that room is full
    socket.on('packed',()=>{
        textSize(20);
        fill(255,0,0);
        text('Sorry, this room is full!', (width/2-100), 20);
        roomFull=true;
    })
    //assigning the roles to the clients based on the information from the server
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
        //button to start the game
        startButton = createButton('Start game!');
        startButton.position((width/2)-10,15);
        startButton.mousePressed(gameStart);
    })
}
//auxiliary function to start the game by making clickStart true so that draw function executes
function gameStart(){
    clickStart=true;
    startButton.hide();
    setInterval(timerUpdate,1000);
}
//function to update the timer
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
//p5.js draw function
function draw(){
    //condition is true only when the start button is clicked
    if (clickStart){
        role.innerHTML=roleAssigned+"||";
        bodyElement.style.background='none';
        bodyElement.style.backgroundColor="yellow";
        background(bg);
        game.displayGame(); //game starts here for the first time
        info.style.display="block"; //makes the menus about score and room appear
        
        for (let i=0; i<game.listOfFruits.length; i++){
            if (game.listOfFruits[i].y>=game_height){
                game.remove(game.listOfFruits[i]);
            }
        }
    }
    //condition is true only when the game is over
    if (gameFinished==true){
        bodyElement.style.backgroundColor="orange"
        background(255, 215, 0);
        socket.emit('gameFinished',true);
        textSize(25);
        //executes only when the score information received from the server
        if (dataReceived==true){
            //displaying the score report
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
            //button to restart the game
            if(resetButtonCreated==false){
                resetButtonCreated=true;
                resetButton = createButton('Restart game!');
                resetButton.position((width/2)-25,540);
                resetButton.mousePressed(gameReset);
            }
        }
    }
}

//function to reset the game that sends the information to server
function gameReset(){
    if (emitted==false){
        socket.emit('resetGame',true);
        emitted=true;
    }
}
//client responding to the restarting of the game
socket.on('resetGame',(data)=>{
    gametime=30;
    dataReceived=false;
    //a new game object is created with all its properties initialized to normal
    game = new Game(game_width, game_height, game_ground);
    resetButtonCreated=false;
    gameFinished=false;
    clickStart=true;
    resetButton.hide();
})
//p5.js function for mousepressed
function mousePressed(){
    if (gameFinished==false){
        if (roleAssigned=="pluck"){
            for (let i=0; i<game.listOfFruits.length; i++){
                //checking the conditions if the fruit is clicked or not
                if (game.listOfFruits[i].x-game.listOfFruits[i].r<=mouseX && mouseX<=game.listOfFruits[i].x+game.listOfFruits[i].r &&
                    game.listOfFruits[i].y-game.listOfFruits[i].r<=mouseY && mouseY<=game.listOfFruits[i].y+game.listOfFruits[i].r &&
                    game.listOfFruits[i].clicked==false){
                    let clickedObjTime=game.listOfFruits[i].timestamp;
                    socket.emit("clickedObj",clickedObjTime); //information about the clicked fruit emitted to server
                }
            }
        }
    }
}
//on receiving the infromation about the clicked object
socket.on('clickedObj',(data)=>{
    for (let i=0; i<game.listOfFruits.length;i++){
        if (game.listOfFruits[i].timestamp==data &&game.listOfFruits[i].clicked==false){
            //increasing the vertical velocity of the particular clicked fruit
            game.listOfFruits[i].gravity();
            game.listOfFruits[i].clicked=true;
        }
    }
})
//p5.js function for mousedragged
function mouseDragged(){
    //only if the drag user does the drag
    if (roleAssigned=="drag"){
        if (gameFinished==false){
            let value=mouseX-(game.basket.w/2);
            socket.emit('baskDragPos',value); //emitting the basket position information to the server
        }
    }
}
//p5.js function for keypressed
function keyPressed(){
    //only if the user is a drag user
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
            socket.emit('basketPosition',value); //emitting the information about the basket position to the server
        }
    }
}
//on receiving the basket position from keys
socket.on('basketPosition',(data)=>{
    game.basket.x=data;
})
//on receiving the information that a fruit went into the basket
socket.on('captured',(data)=>{
    game.score=data
    userScore.innerHTML=game.score+"||";
    console.log('called me');
})
//on receiving the basket position from mouse drag
socket.on('baskDragPos',(data)=>{
    game.basket.x=data;
})
//on receiving the information that game is over
socket.on('gameFinished',(data)=>{
    firstPlayer=data.firstPlayer;
    secondPlayer=data.secondPlayer;
    scoreInfo=data.score;
    totalFruits=data.totalFruits;
    dataReceived=true;
})
//on receiving the information that a user got disconnected or left the room
socket.on('userLeft',(data)=>{
    alert(data);
})








































