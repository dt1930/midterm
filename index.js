//importing the require modules and creating objects
let express=require('express'); 
let http=require('http');
let app=express();
let server=http.createServer(app);
let io= require('socket.io');

let roomObjects=[]; // array to hold several rooms connected to the server
io=new io.Server(server);
app.use('/',express.static('public'));

//when client tries to connect to the server
io.sockets.on('connect',(socket)=>{
    console.log(socket.id,"has connected");
    let roomAlreadyExists=false;
    let myRoom;
    
    //receving the information about the client 
    socket.on('userData',(data)=>{
        socket.userName=data.userName;
        socket.roomNum=data.room;
        socket.status=true;
        //checking if the room already exists or not
        for (let i=0; i<roomObjects.length; i++){
            if (socket.roomNum==roomObjects[i].roomNum){
                roomAlreadyExists=true;
                myRoom=roomObjects[i];
                break;
            }
        }
        //if the room number doesn't exist
        if (roomAlreadyExists==false){
            myRoom= new room(socket.roomNum); //creating a new room object
            roomObjects.push(myRoom); //inserting the new room into roomObjects array
            socket.join(myRoom.roomNum); //joining the client to a particular room number
            myRoom.names.push(socket.userName); //saving the names of the players in names attribute of room
            socket.emit('userCount',myRoom.value); //increasing the number of players in the room
        }
        //if the room number already exists
        if (roomAlreadyExists==true){
            if (myRoom.value<2){
                socket.join(socket.roomNum);
                myRoom.names.push(socket.userName);
                myRoom.value+=1;
                socket.emit('userCount',myRoom.value); //emitting the number of players info to the client end
            }
            else{
                socket.emit('packed',myRoom.value); //emitting the packed information in case the room is full
                socket.status=false;
            }
        }
        // server emitting the information to start the timer
        socket.on('timerStart',(data)=>{
            io.to(socket.roomNum).emit('timerStart',data);
        })
        //when any socket in the room disconnects
        socket.on('disconnect',()=>{
            if (socket.status==true){
                myRoom.value--; //decrement the number of players in the room
            }
            //inform the client that the user has disconnected
            io.to(socket.roomNum).emit('userLeft','Your friend has disconnected.Go back to login page!')
            console.log(socket.id, "has disconnected");
            myRoom.fruitsColl.splice(0,myRoom.fruitsColl.length);
            myRoom.capturedFruits=0;
            myRoom.names.splice(0,myRoom.names.length);
        })
        //emitting the basket position to the clients after receving the information from the drag user on client side
        socket.on('basketPosition',(data)=>{
            io.to(socket.roomNum).emit('basketPosition',data);
        })
        //when the fruit is captured/ goes into the basket
        socket.on('capturedFruit',(data)=>{
            for (let i=0; i<myRoom.fruitsColl.length; i++){
                if (data==myRoom.fruitsColl[i].timestamp){
                    myRoom.capturedFruits++; //score is increased by 1 point
                }
            }
            io.to(socket.roomNum).emit('capturedFruit',myRoom.capturedFruits) //score sent to the clients
        })
        //to delete the fruit from array when the fruit is clicked and goes off screen
        socket.on('deleteFruit',(data)=>{
            for (let i=0; i<myRoom.fruitsColl.length; i++){
                if (data==myRoom.fruitsColl[i].timestamp){
                    myRoom.fruitsColl.splice(i,1);
                }
            }
            io.to(socket.roomNum).emit('deleteFruit',true);
        })
        socket.on('clickedObj',(data)=>{
            io.to(socket.roomNum).emit('clickedObj',data);
        })
        //receiving the information about the fruit, saving it in the array, and emitting it back to both clients
        //this information is received only from the pluck user on the client side
        socket.on('fruitObj',(data)=>{
            myRoom.fruitsColl.push(data);
            myRoom.totalFruits++;
            io.to(socket.roomNum).emit('fruitObj',data);
        })
        //receiving infromation about the basket drag position (keyboard)
        //this information is received only from the drag user on the client side
        socket.on('baskDragPos',(data)=>{
            io.to(socket.roomNum).emit('baskDragPos',data);
        })
        //resetting the game on the server end by re-initializing the room attributes
        socket.on('resetGame',(data)=>{
            if (data){
                myRoom.capturedFruits=0;
                myRoom.fruitsColl.splice(0,myRoom.fruitsColl.length);
                myRoom.totalFruits=0;
            }
            io.to(socket.roomNum).emit('resetGame',true);
        })
        //sending the score report to the clients when the game ends
        socket.on('gameFinished',(data)=>{
            if (data==true){
                let scoreObj={
                    firstPlayer:myRoom.names[0],
                    secondPlayer:myRoom.names[1],
                    totalFruits:myRoom.totalFruits,
                    score:myRoom.capturedFruits
                }
                io.to(socket.roomNum).emit('gameFinished',scoreObj);
            }
        })
    })
})
//blueprint for the room object
function room(roomNum){
    this.roomNum=roomNum;
    this.value=1;
    this.capturedFruits=0;
    this.fruitsColl=[];
    this.names=[];
    this.totalFruits=0;
}
//server listening to a certain port
server.listen(8155,()=>{
    console.log("server up");
})
