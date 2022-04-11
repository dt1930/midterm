class Basket{
    constructor(x,y,w,h){
        this.x=x;
        this.y=y;
        this.w=w;
        this.h=h;
        this.vx=0;
        this.img=basketImage;
    }
    display(){
        image(basketImage,this.x,this.y,this.w,this.h)
    }
}

class Fruit{
    constructor(x,y,r,t){
        this.x=x;
        this.y=y;
        this.r=r;
        this.timestamp=t;
        this.img=fruitImage;
        this.vy=0;
        this.clicked=false;
    }
    distance(a,b){
        return Math.sqrt((this.x-a)**2 + (this.y-b)**2)
    }
    gravity(){
        this.vy+=7;
    }
    display(){
        if (this.y<game.basket.y+100){
            this.y=this.y+this.vy;
            image(this.img,this.x-this.r,this.y-this.r,this.r*2,this.r*2)
        }
    }
}
function randomNumber(minValue,maxValue){
    randomValue=Math.floor(random(minValue,maxValue));
    return randomValue;
}
class Game {
    constructor(w,h,b){
        this.listOfFruits=[];
        this.w=w;
        this.h=h;
        this.b=b;
        this.score=0;
        this.img=bg;
        this.basket=new Basket(0,game_height-150,100,100);
    }
    remove(item){
        for (let i=0; i<this.listOfFruits.length; i++){
            if (this.listOfFruits[i]==item){
                this.listOfFruits.splice(i,1);
                break;
            }
        }
    }
    fruitGenerator(){
        let randX,randY;
        if (frameCount%80==0 && gameFinished==false){
            randX=randomNumber(50,this.w-50);
            randY=randomNumber(100,this.h-300);
            while (true){
                let c=0;
                for(let i=0; i<this.listOfFruits.length; i++){
                    if (this.listOfFruits[i].distance(randX,randY)<2*this.listOfFruits[i].r){
                        c+=1;
                    }
                }
                if (c!=0){
                    randX=randomNumber(50,this.w-50);
                    randY=randomNumber(100,this.h-300);
                }else{
                    break;
                }
            }
            let timeOfCreation= new Date();
            let myFruit=new Fruit(randX,randY,15,timeOfCreation.toLocaleTimeString());
            let fruitObj={
                x:myFruit.x,
                y:myFruit.y,
                r:myFruit.r,
                timestamp:myFruit.timestamp
            };
            if (roleAssigned=="pluck"){
                socket.emit('fruitObj',fruitObj);
            }
            socket.on('fruitObj',(data)=>{
                let newFruit= new Fruit(data.x,data.y,data.r,data.timestamp);
                this.listOfFruits.push(newFruit);
            })
        }
    }
    winCheck(){
        let removeObjTime;
        for (let i=0; i<this.listOfFruits.length; i++){
            if (this.listOfFruits[i].x>=this.basket.x && this.listOfFruits[i].x<=(this.basket.x+this.basket.w)
            && this.listOfFruits[i].y>=this.basket.y){
                winAudio.play();
                console.log("hello");
                removeObjTime=this.listOfFruits[i].timestamp;
                if (roleAssigned=="pluck"){socket.emit("capturedFruit",removeObjTime)}
                this.listOfFruits.splice(i,1);
                socket.on('capturedFruit',(data)=>{
                    userScore.innerHTML=data+"||";
                    this.score=data;
                })
            }
            else if(this.listOfFruits[i].y>=this.basket.y){
                lostAudio.play();
                removeObjTime=this.listOfFruits[i].timestamp;
                this.listOfFruits.splice(i,1);
            }
            if (roleAssigned=="pluck"){socket.emit("deleteFruit",removeObjTime)}
        }
        
    }
    startgame(){
        this.basket.display();
        for (let i=0; i<this.listOfFruits.length; i++){
            this.listOfFruits[i].display();
        }
        this.winCheck();
        this.fruitGenerator();
    }
    displayGame(){
        strokeWeight(0)
        image(this.img,0,0,game_width,game_ground)    //background image of tree
        this.startgame()
    }
}


