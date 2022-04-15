//class for the basket
class Basket{
    constructor(x,y,w,h){
        this.x=x; //x position of the basket
        this.y=y; //y position of the basket
        this.w=w; //width of the basket
        this.h=h; //height of the basket
        this.vx=0; //horizontal velocity of the basket initalizied to 0
        this.img=basketImage; //image of the basket
    }
    //method to display the basket image
    display(){
        image(basketImage,this.x,this.y,this.w,this.h)
    }
}

//class for the fruit
class Fruit{
    constructor(x,y,r,t){
        //information about the fruit
        this.x=x; 
        this.y=y; 
        this.r=r; 
        this.timestamp=t;
        this.img=fruitImage;
        this.vy=0; //vertical velocity of the fruit initialized to 0
        this.clicked=false; //any fruit is not clicked when it is created
    }
    //method to calculaute the distance between any object and the referenced fruit
    distance(a,b){
        return Math.sqrt((this.x-a)**2 + (this.y-b)**2)
    }
    //method to increase the vertical velocity of the fruit
    gravity(){
        this.vy+=7;
    }
    //method to display the fruit
    display(){
        if (this.y<game.basket.y+100){ // displays until the fruit goes too below the basket
            this.y=this.y+this.vy;
            image(this.img,this.x-this.r,this.y-this.r,this.r*2,this.r*2)
        }
    }
}
function randomNumber(minValue,maxValue){
    randomValue=Math.floor(random(minValue,maxValue));
    return randomValue;
}
//class for the game 
class Game {
    constructor(w,h,b){
        this.listOfFruits=[]; //array to store all the current fruits in the game
        //attributes of the game, including its width, height, score, and background
        this.w=w; 
        this.h=h; 
        this.b=b;
        this.score=0;
        this.img=bg;
        // the basket object is created immediately once the game object is instantiated
        this.basket=new Basket(0,game_height-150,100,100);
    }
    //method to remove the fruit from the listOfFruits in the game
    remove(item){
        for (let i=0; i<this.listOfFruits.length; i++){
            if (this.listOfFruits[i]==item){
                this.listOfFruits.splice(i,1);
                break;
            }
        }
    }
    //method to generate a new fruit in the game
    fruitGenerator(){
        let randX,randY;
        //only called when the game is running and framecount mod 80 is 0
        if (frameCount%80==0 && gameFinished==false){
            randX=randomNumber(50,this.w-50);
            randY=randomNumber(100,this.h-300);
            //while loop to prevent the overlapping of the fruits
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
            //creates a new fruit in the game
            let myFruit=new Fruit(randX,randY,15,timeOfCreation.toLocaleTimeString());
            let fruitObj={
                x:myFruit.x,
                y:myFruit.y,
                r:myFruit.r,
                timestamp:myFruit.timestamp
            };
            if (roleAssigned=="pluck"){
                socket.emit('fruitObj',fruitObj); //sending the infromation about the new fruit to the server
            }
            //on receiving the information from the server, inserting it into the listOfFruits of the game
            socket.on('fruitObj',(data)=>{
                let newFruit= new Fruit(data.x,data.y,data.r,data.timestamp);
                this.listOfFruits.push(newFruit);
            })
        }
    }
    //method to check if the fruit went into the basket
    winCheck(){
        let removeObjTime;
        for (let i=0; i<this.listOfFruits.length; i++){
            if (this.listOfFruits[i].x>=this.basket.x && this.listOfFruits[i].x<=(this.basket.x+this.basket.w)
            && this.listOfFruits[i].y>=this.basket.y){
                winAudio.play(); //playing the audio to inform that fruit went into the basket
                removeObjTime=this.listOfFruits[i].timestamp;
                //sending the information to server about captured fruit
                //only the pluck user emits this information because it's same for drag also
                if (roleAssigned=="pluck"){socket.emit("capturedFruit",removeObjTime)} 
                this.listOfFruits.splice(i,1);
                //on receiving the information from the server, increasing the score of the game
                socket.on('capturedFruit',(data)=>{
                    userScore.innerHTML=data+"||";
                    this.score=data;
                })
            }
            else if(this.listOfFruits[i].y>=this.basket.y){
                lostAudio.play(); //playing audio to inform the fruit went outside of the basket
                removeObjTime=this.listOfFruits[i].timestamp;
                this.listOfFruits.splice(i,1);
            }
            if (roleAssigned=="pluck"){socket.emit("deleteFruit",removeObjTime)}
        }
        
    }
    //starting the game by displaying the fruits and the basket
    startgame(){
        this.basket.display();
        for (let i=0; i<this.listOfFruits.length; i++){
            this.listOfFruits[i].display();
        }
        this.winCheck(); //calling wincheck method to check whether the fruit went into the basket
        this.fruitGenerator(); //calling fruitgenerator to generate the fruit
    }
    //displaying the background of the game and calling startgame
    displayGame(){
        strokeWeight(0)
        image(this.img,0,0,game_width,game_ground)    //background image of tree
        this.startgame()
    }
}


