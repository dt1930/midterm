### Project 2 Documentation: In Sync

## A. Description of the project
Project In Sync is submitted as the second project assignment for the course Connections Labs. It is a multi-player cooperative game that uses html, css, javascript on the front end and node.js and socket.io on the back end to make the real time data exchange between the users feasible. The game is meant to be a source of entertainment and bonding as two players coordinate with each other to get as many fruits as possible into the basket (before the timer goes off) while each player having only the ability to either click on the fruits or drag the basket. The game includes timer, performance report, and real time score updates, all of which are meant to make gameplay interesting.

## B. Motivation/objectives
The first thing people usually think of when they hear about multiplayer games is that two players compete against each other to get more points. I thought of using the feature of real time data exchange through sockets for something more fun, and thus I had this idea of building a cooperative game. Although the game’s immediate purpose was to deliver entertainment through gameplay, some underlying motivations were to increase bonding between people through the game. I wanted people to be excited about cooperating with each other and talking with each other as they play the game. Moreover, I have provided a cooperation rating and stamps at the end of the game to incentivize players to play the game again and again to increase their ratings. Overall, the game was meant to connect people together.

## C. Wireframing the project
My first wireframes for the landing page and the game page were quite rough. They only contained a form and didn't have any graphics, but after the feedback I received during the user testing, which was to organize my layout so that the login page looks more organized and appealing for the users to play, I changed my game’s wireframing a little bit. Also, since I created the app for the mobile version, it was difficult for me to come up with the layout and decide things such as the position of information about the user, score, room, and timer, but I eventually decided to go with the following wireframes.<br>

![wireframe](https://dt1930.github.io/midterm/wireframe.png)


## D. Writing the html page
The wireframes of the web page were utilized to write the two html files, namely index.html  and game.html. The former includes a form that takes the input from the player, such as name and the room number, so it includes only basic html tags, such as h1, h4, div, form, and input. that includes all the div elements and input elements required for the web page. The game.html contains div and span tags. Although the structure of both the pages look effortless, I wanted users to just come to the site and without much hassle of navigation just go into the game immediately. However, one important modification I made as a part of the feedback from the usertesting of the game was I created an intermediate page after the landing page where the user would be assigned a role (pluck or drag). I have talked about these modifications under the section feedback and modifications below. Below are my landing page and game page.</br>
![landingPage](https://dt1930.github.io/midterm/landingPage.png)

## E. Writing the style.css
Writing the CSS is always an important part of the user interface as well as user experience, so I have tried to focus on that part as well with my choice of background, graphics, and fonts. The background of the game was designed in Canva. I have used the google font Caveat  to create a more personal tone. I felt this font suited the overall sense meant to be conveyed by the web page i.e. slightly informal, more connecting (it looks more like someone’s handwriting than the perfect computer-produced text).
In the main game page, a yellow background is used that contrasts well against the green trees. Although this is a minor detail, I initially had the green mangoes as my fruits, but since the tree itself was green, I decided to go with oranges. For the performance report after the game is over, I thought I went with good color choices, but I have received some comments about what could have been better, which are included in the next steps section of the documentation.<br>
![gamePage](https://dt1930.github.io/midterm/gamePage.png)
![scorePage](https://dt1930.github.io/midterm/scorePage.png)

## F. Front-end javascript (app.js & classes.js)
My front-end javascript is divided into two separate javascript files as I received the same feedback for my project 1 (to have separate js files as they are big). For this project, I created two separate front-end javascript files. One is app.js that contains mostly the socket connections, emitting, and on functions, including the p5.js functions. Another is classes.js that contains classes for the fruit,the basket, and the whole game itself. I think the division made my job easier in terms of where to look for when I wanted to change a certain thing, including while debugging. The game basically works this way: </br>
<pre>
1. The user lands on the login page.
2. The information about the user and the room number is stored in the session storage, and the user (if he/she is the first one to enter into that room, he/she gets the pluck role) gets the role to pluck or drag which is handled from back end and more discussed in the back-end javascript section.
3. The timer starts as the players click on the start game, and the fruits start to appear at random places (do not overlap). 
4. The pluck user can only click on the fruits, and the drag user can only drag the fruits. The specifics of this role handling is made possible through a simple if condition on the role attribute of a particular user which is decided by the server on the back end and emitted to the front end.
5. The players can confirm how they are playing the game by looking at the score on the top of the screen, including the room they are in, and what’s their role in the game. Also, a sound is played to notify players if they were able to catch the fruit or not.
</pre>
The classes and methods that have been created in the javascript files (app.js or classes.js) work for following purposes:
<pre>
Classes:
1. Class Fruit 
2. Class Basket
3. Class game

Methods:
1. fruitGenerator(): generates fruit when the frameCount changes by 80 frames every time 
2. winCheck(): checks if the fruit is dropped into the basket or outside the basket
3. displayGame(): the whole game is displayed i.e. image of tree 
4. remove(item): any fruit to be deleted from the array listOfFruits
5. startgame(): the game is started i.e. fruitGenerator called from this function
6. gravity(): the fruits start to fall since the function changes the vertical velocity of the fruit object that is initially set to 0
7. display(): the function in the class basket and fruit to display the basket and fruits
8. distance (a,b): the function that returns the distance between an object having x and y positions a and b and the referenced object’s x and y coordinates on which the method is called
9. Function randomNumber(minvalue,maxvalue): the function that returns a random number between minvalue and maxvalue (maxvalue not included)
10. Function gameReset(): the function that resets the whole game and its properties when the user clicks the restart button
11. Function gameStart(): the function that makes the if block inside the function draw() true so that the game starts (auxiliary function)
12. Function timerUpdate(): the function that updates the timer

</pre>

## G. Snippets of code for some important functions on the front end

### 1. fruitGenerator() method in the Fruit Class
<pre>
fruitGenerator()
{
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
</pre>



### 2.Some socket functions in the front-end

<pre>
socket.on('baskDragPos',(data)=>{
    game.basket.x=data;
})
socket.on('gameFinished',(data)=>{
    firstPlayer=data.firstPlayer;
    secondPlayer=data.secondPlayer;
    scoreInfo=data.score;
    totalFruits=data.totalFruits;
    dataReceived=true;
})
socket.on('userLeft',(data)=>{
    alert(data);
})
</pre>
 
## H. Back-end javascript (index.js)
Since the most important part of the second project (and one thing that is unique to this project from project 1) was the back-end part of the website, I have tried to implement sockets in the best possible way for the real time data exchange. In the back end, I have created a class room that has five attributes, namely roomNum, value (number of people), capturedFruits(score), fruitsColl (array), names(array), and totalFruits(number of total fruits generated). I have described the flow of the game as follows:
<pre>
1. User logs into the game by submitting name and room number
2. From front-end (session storage), the information about name and room number is sent as an object to back-end
3. The back-end checks if the room number exists or not; if not, creates one.
4. The back-end also checks the room.value (the number of members in that room) and if it’s 1, it sends the information to the front-end
5. The front-end assigns that user the role to pluck (this means the first user gets to pluck every time)
6. Similarly, when second user logs in, the same process is repeated but the back-end sends the room.value to be 2 and the front-end assigns the role to drag
7. If any user tries to log in now, the back-end informs that room is full.
8. The game starts on clicking start game 
9. From the front-end side, the attributes of the fruit i.e. it’s x position, y position, time of creation, etc. is sent to the back-end (only the pluck user sends this information because we don’t want both the users to generate fruits and emit info)
10. The back-end emits the information to all the members in the room i.e. both players receive the fruits on the screen
11. The process continues until the timer goes off
12. When the timer goes off, the gameFinished information is emitted to back-end and when it’s received from the back-end, the front-end will display a score report, and on clicking the restart, a new ‘game’ object is created and informed to the back-end so that the room’s attributes are reset, i.e. capturedFruits, fruitsColl, and totalFruits
13. If any user disconnects from the game in the middle of the game, the other user will receive an alert. This is implemented from the back-end as one of the socket disconnects, the info is emitted to the members in the room about the user disconnecting. 
</pre>
## I. Snippets of code for some important functions on the back end

1. Socket function that receives the information about fruit being captured and emits the information to front-end
<pre>
socket.on('capturedFruit',(data)=>{
    for (let i=0; i<myRoom.fruitsColl.length; i++){
        if (data==myRoom.fruitsColl[i].timestamp){
            myRoom.capturedFruits++;
        }
    }
    io.to(socket.roomNum).emit('capturedFruit',myRoom.capturedFruits)
})
 2. Socket function that resets the game and emits the information to the front-end
socket.on('resetGame',(data)=>{
    if (data){
        myRoom.capturedFruits=0;
        myRoom.fruitsColl.splice(0,myRoom.fruitsColl.length);
        myRoom.totalFruits=0;
    }
    io.to(socket.roomNum).emit('resetGame',true);
})

</pre>
## J. Expectations from the user testing
<pre>
1. The interface is only designed for mobile devices currently. I opted for mobile devices, so on bigger viewports, the canvas is misplaced and also using a keyboard is not an option. Should I go with the mobile design or make another one for the laptop, including other functionalities of keypressed?
2. I am expecting suggestions on UI and UX, and just about whether what I have right now is UX friendly or not. For the UI, I don’t know what I can do to add much to a small game like this, so I am open to suggestions for that also.
3. I am using the inbuilt mouseDragged function of p5.js for the user to move the basket here and there. I feel like there is some lag, and it’s not UX friendly. I am thinking of changing it to a slider, so that the y-position of the basket is fixed, and the user can just move it in different x-positions. I am not yet sure what that would look like. Also, my second idea was to just use the mouseClicked and update the position of the basket with mouseX and mouseY every time the function draw() is called. I need suggestions for which one would be better, and if I should not do anything at all provided that there is some lag right now.
4. On the front end, I need suggestions on how I can have a better interface for the onboarding and also as the game is in operation.
</pre>
## K. Feedback from the user testing on the prototype
<pre>
1. The feedback I got from most people was to remove the radio buttons on the landing page that allowed users to select plucking or dragging roles and instead implement the role from the back-end, so that the server assigns the role to the players instead of them selecting the roles. Many of them suggested having an intermediate page so that they know what they have to do.
2. I also got feedback about the players not being able to say whether the fruit went into the basket or not as they played the game.
3. Another  feedback I received was about improving the graphics of the login page instead of having a plain form.
4. The fruits disappeared in the middle of the game and the score was flickering, so I was told to fix these glitches.
5. Although this was already in my mind, many suggested having a timer to make the game more interesting. (I hadn’t implemented the timer yet in the prototype.)
6. Somebody also suggested that I also allow the basket to be moved by keyboard (in addition to mouse drag) even though the app is meant for mobile because if someone browses from desktop, he/she would probably use the keyboard to move the basket.
</pre>
## L. Modifications, debugging, and revisions of code (after user testing)
<pre>
1. I removed the radio buttons from the landing page and instead decided to go with the feedback and thus, the game now has the server assigning roles to the players once they join a room. There is an intermediate screen which says what are they required to do, i.e. either click or drag. The internal implementation of how the role is assigned is described in the back-end section of this document.
2. I added a background and formatted my landing page so that the login form sits at the right position when browsed from a mobile phone and the graphics look good.
3. For the feedback about players not being able to say whether the fruit went into the basket, I used sounds so that the user would know that information. Two different sounds that semantically fit whether the user got the point or not are included in the final version of the game.
4. I fixed the glitches related to fruits disappearing in the middle of the game and flickering score.
5. I implemented the timer.
6. I also allowed the drag user to move the basket with the help of the keyboard in case he/she browsed from the desktop which is very unlikely since this was meant to be a mobile app.
</pre>


## M. Self-evaluation of the final product
I have self-evaluated my final product, the webpage by talking about some of the strengths and weaknesses from my perspective.
 ### 1. Strengths
      a. It is simple, easy to understand and use.
      b. It engages people to even play more and get higher scores (as seen in the class).
      c. It has somewhat of a solid server end in the sense that one knows if the other user has disconnected or not and also doesn’t allow multiple users to barge into the game.
      
  ### 2. Weaknesses
      a. As pointed out by the professor, the menus displaying the name,room, score aren’t placed properly on the top and were separated by pipes.
      b. As pointed out by a peer in the class, the background color could have been a lighter one.

## N. Challenges/difficulties
1. I struggled with setting up the flow of the game i.e. when to emit the information to the server and what to emit and also when to receive back. Since back-end was a new thing for me, I was thinking hard about what and when to send to and from the server.
2. Although after I planned about how many and which classes I will have for the game, the process was smooth, it took some time to decide how my objects are going to interact with one another.
3. I also had some problems regarding the draw function while working with the p5.js library since I was using it for the first time, but I watched a youtube channel that helped me out a lot.


## O. Next Steps
<pre>
1. Currently, the game only displays the score report for a particular room, and since we could implement either socket.io or NeDB, I didn’t build a high score page where top 5 scores from any other rooms would be displayed. I could use an array on the server side to store the score objects and do that.
2. One of my friends who user tested the game was suggesting that I have a voice transmitting function where people could communicate with each other and would help them cooperate with each other as they play the game. I don’t know how to do this, but I definitely think this will be a great addition to the game.
3. I will try to work on the weaknesses of the program, namely the positioning of the menus and also the color combinations of the webpage.
</pre>

## P. Major takeaways from the process
<pre>
1. I have learned how to work with socket.io library.
2. I have learned how to emit and receive information to and from the server so that real data exchange can be done between the clients and server.
3. I have learned how to handle multiple rooms in a game and limit functionalities to certain users.
</pre>

## Q. Credits
<pre>
1. Professor Mathura Govindarajan
2. p5.js/org/reference 
3. Stack Overflow
4. Youtube channel The Coding Train
5. My friend Bishnu for user testing the game
6. My peers from the class
</pre>

## R. Link
https://insync.glitch.me





