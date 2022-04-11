let express=require('express');
let http=require('http');
let app=express();
let server=http.createServer(app);
let io= require('socket.io');
let roomObjects=[];
io=new io.Server(server);
app.use('/',express.static('public'));
io.sockets.on('connect',(socket)=>{
    console.log(socket.id,"has connected");
    let roomAlreadyExists=false;
    let myRoom;
    socket.on('userData',(data)=>{
        socket.userName=data.userName;
        socket.roomNum=data.room;
        socket.status=true;
        for (let i=0; i<roomObjects.length; i++){
            if (socket.roomNum==roomObjects[i].roomNum){
                roomAlreadyExists=true;
                myRoom=roomObjects[i];
                break;
            }
        }
        if (roomAlreadyExists==false){
            myRoom= new room(socket.roomNum);
            roomObjects.push(myRoom);
            socket.join(myRoom.roomNum);
            myRoom.names.push(socket.userName);
            socket.emit('userCount',myRoom.value);
        }
        if (roomAlreadyExists==true){
            if (myRoom.value<2){
                socket.join(socket.roomNum);
                myRoom.names.push(socket.userName);
                myRoom.value+=1;
                socket.emit('userCount',myRoom.value);
            }
            else{
                socket.emit('packed',myRoom.value);
                socket.status=false;
            }
        }
        socket.on('timerStart',(data)=>{
            io.to(socket.roomNum).emit('timerStart',data);
        })
        socket.on('disconnect',()=>{
            if (socket.status==true){
                myRoom.value--;
            }
            io.to(socket.roomNum).emit('userLeft','Your friend has disconnected.Go back to login page!')
            console.log(socket.id, "has disconnected");
            myRoom.fruitsColl.splice(0,myRoom.fruitsColl.length);
            myRoom.capturedFruits=0;
        })
        socket.on('basketPosition',(data)=>{
            io.to(socket.roomNum).emit('basketPosition',data);
        })
        socket.on('capturedFruit',(data)=>{
            for (let i=0; i<myRoom.fruitsColl.length; i++){
                if (data==myRoom.fruitsColl[i].timestamp){
                    myRoom.capturedFruits++;
                }
            }
            io.to(socket.roomNum).emit('capturedFruit',myRoom.capturedFruits)
        })
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
        socket.on('fruitObj',(data)=>{
            myRoom.fruitsColl.push(data);
            myRoom.totalFruits++;
            io.to(socket.roomNum).emit('fruitObj',data);
        })
        socket.on('baskDragPos',(data)=>{
            io.to(socket.roomNum).emit('baskDragPos',data);
        })
        socket.on('resetGame',(data)=>{
            if (data){
                myRoom.capturedFruits=0;
                myRoom.fruitsColl.splice(0,myRoom.fruitsColl.length);
                myRoom.totalFruits=0;
            }
            io.to(socket.roomNum).emit('resetGame',true);
        })
        socket.on('gameFinished',(data)=>{
            if (data==true){
                let scoreObj={
                    firstPlayer:myRoom.names[0],
                    secondPlayer:myRoom.names[1],
                    totalFruits:myRoom.totalFruits,
                    score:myRoom.capturedFruits
                }
                io.to(socket.roomNum).emit('gameFinished',scoreObj);
                console.log(scoreObj);
            }
        })
    })
})

function room(roomNum){
    this.roomNum=roomNum;
    this.value=1;
    this.capturedFruits=0;
    this.fruitsColl=[];
    this.names=[];
    this.totalFruits=0;
}

server.listen(8155,()=>{
    console.log("server up");
})