const scoreEl = document.querySelectorAll(".score-num");
const canvas = document.querySelector(".canvas");
const result = document.querySelector(".result");
const gameOver = document.querySelector(".game-over");
const winning = document.querySelector(".winning");
const startGameBtn = document.querySelector(".start-game-btn");
const UplevelBtn = document.querySelector(".level-up-btn");

const context = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

const coinImg = creatImage("images/Coin.png");
const spriteRunLeft = creatImage("images/spriteRunLeft.png");
const spriteRunRight = creatImage("images/spriteRunRight.png");
const spriteStandLeft = creatImage("images/spriteStandLeft.png");
const spriteStandRight = creatImage("images/spriteStandRight.png");

const platformImg = creatImage("images/platform.png");
const platformSmallImg = creatImage("images/platformSmallTall.png");
const hillsImg = creatImage("images/hills.png");
const backgroundImg = creatImage("images/background.png");


const gravity = 0.5;

class Player{
    constructor() {
        this.speed = 10;
        this.position = {x: 100, y: 100,}
        this.velocity = {x: 0, y: 1,}
        this.width = 66;
        this.height = 150;
        this.image = spriteStandRight;
        this.frame = 0;
        this.sprite = {
            stand: {
                left: spriteStandLeft,
                right: spriteStandRight,
                cropWidth: 177,
                width: 66,
            },
            run: {
                left: spriteRunLeft,
                right: spriteRunRight,
                cropWidth: 341,
                width: 127.875,
            }
        }

        this.currentSprite = this.sprite.stand.right;
        this.currentCropWidth = this.sprite.stand.cropWidth;
    }

    draw() {
        context.beginPath();
        context.drawImage(
            this.currentSprite,
            this.currentCropWidth * this.frame,
            0,
            this.currentCropWidth,
            400,
            this.position.x,
            this.position.y,
            this.width,
            this.height);
        // context.fillStyle = "red";
        // context.fillRect(this.position.x, this.position.y, this.width, this.height);
        // context.rect(this.position.x, this.position.y, this.width, this.height);
        // context.fill();
        context.closePath();
    }

    update() {
        this.frame++;
        if (this.frame > 59 && (this.currentSprite === this.sprite.stand.right ||
            this.currentSprite === this.sprite.stand.left)) {
            this.frame = 0;
        } else if (this.frame > 29 && (this.currentSprite === this.sprite.run.right ||
            this.currentSprite === this.sprite.run.left)) {
            this.frame = 0;
        } else {
            
        }

        this.draw();
        this.position.x += this.velocity.x;
        if (this.position.y + this.velocity.y > 0) {
            this.position.y += this.velocity.y;
        } else this.velocity.y = 1;

        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity;
        }
    }
}

class Platform{
    constructor({x , y}, image) {
        this.position = {
            x: x,
            y: y,
        }
        this.image = image;
        this.width = image.width;
        this.height = image.height;
    }

    draw() {
        context.beginPath();
        context.drawImage(this.image, this.position.x, this.position.y);
        context.closePath();
    }
}

class GenericObject{
    constructor({x , y}, image) {
        this.position = {
            x: x,
            y: y,
        }
        this.image = image;
        this.width = image.width;
        this.height = image.height;
    }

    draw() {
        context.beginPath();
        context.drawImage(this.image, this.position.x, this.position.y);
        context.closePath();
    }
}

class Coin{
    constructor({x , y}, image) {
        this.position = {
            x: x,
            y: y,
        }
        this.image = image;
        this.width = image.width;
        this.height = image.height;
    }

    draw() {
        context.beginPath();
        context.drawImage(this.image, this.position.x, this.position.y);
        context.closePath();
    }
}

class Enemy{
    constructor({x,y}, {s , e}){
        this.position = {
            x : x,
            y : y,
        }
        this.point = {
            start : s,
            end : e,
        }
        this.width = 50;
        this.height = 50;
        this.speed = 5;
    }

    draw(){
        context.beginPath();
        context.fillStyle = "blue";
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
        context.closePath();
    }

    update(){
        if(this.position.x < this.point.start || this.position.x >= this.point.end){
            this.speed = -this.speed;
        }
        this.position.x += this.speed;
        this.draw();
    }
}


const friction = 0.98;
class Particle{
    constructor(x , y, radius, color, velocity) {
        this.position = {
            x: x,
            y: y,
        }
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    
    draw() {
        context.beginPath();
        context.save();
        context.globalAlpha = this.alpha;
        context.fillStyle = this.color;
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        context.fill();
        context.restore();
        context.closePath();
    }

    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}

let player;
let platforms;
let genericObjects;
let coins;
let enemies;
let particles;

let offScrollSet = 0;
let score = 0;
let jump = 0;
let level2 = false;
const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    }
}

function creatImage(path) {
    const img = new Image();
    img.src = path;
    return img;
}

function initGame() {
    player = new Player();
    particles = [];

    enemies = [
        new Enemy({x:platformImg.width * 1 + 000, y:500}, {s: platformImg.width * 1 + 000, e: platformImg.width * 1 + 500}),
        new Enemy({x:platformImg.width * 2 + 200, y:500}, {s: platformImg.width * 2 + 200, e: platformImg.width * 2 + 600}),
        new Enemy({x:platformImg.width * 3 + 300, y:500}, {s: platformImg.width * 3 + 300, e: platformImg.width * 3 + 700}),
        new Enemy({x:platformImg.width * 5 + 300, y:500}, {s: platformImg.width * 5 + 000, e: platformImg.width * 5 + 700}),
        new Enemy({x:platformImg.width * 9 + 300, y:500}, {s: platformImg.width * 9 + 000, e: platformImg.width * 9 + 600}),
        new Enemy({x:platformImg.width * 14 - 300, y:500}, {s: platformImg.width * 14 - 300, e: platformImg.width * 14 - 050}),
    ];

    platforms = [
        new Platform({ x: platformImg.width * 6 + 349 - platformSmallImg.width, y: 350 }, platformSmallImg),
        new Platform({ x: platformImg.width * 9 + 800, y: 350 }, platformSmallImg),
        new Platform({ x: platformImg.width * 10 + 800, y: 250 }, platformSmallImg),
        new Platform({ x: platformImg.width * 13 + 800, y: 350 }, platformSmallImg),
        new Platform({ x: platformImg.width * 14 + 800, y: 250 }, platformSmallImg),
        new Platform({ x: platformImg.width * 15 + 800, y: 250 }, platformSmallImg),
        new Platform({ x: platformImg.width * 16 + 800, y: 250 }, platformSmallImg),
        new Platform({ x: platformImg.width * 17 + 800, y: 350 }, platformSmallImg),
        new Platform({ x: 0, y: 550 }, platformImg),
        new Platform({ x: platformImg.width - 2, y: 550 }, platformImg),
        new Platform({ x: platformImg.width * 2 + 150, y: 550 }, platformImg),
        new Platform({ x: platformImg.width * 3 + 250, y: 550 }, platformImg),
        new Platform({ x: platformImg.width * 4 + 350, y: 550 }, platformImg),
        new Platform({ x: platformImg.width * 5 + 349, y: 550 }, platformImg),
        new Platform({ x: platformImg.width * 6 + 600, y: 550 }, platformImg),
        new Platform({ x: platformImg.width * 7 + 700, y: 550 }, platformImg),
        new Platform({ x: platformImg.width * 8 + 700 - 2, y: 550 }, platformImg),
        new Platform({ x: platformImg.width * 11 + 1200, y: 550 }, platformImg),
        new Platform({ x: platformImg.width * 17 + 1200, y: 550 }, platformImg),
    ];

    genericObjects = [
        new GenericObject({ x: -1, y: -1 }, backgroundImg),
        new GenericObject({ x: -1, y: -1 }, hillsImg),
    ];


    // ReCode to Array and Loop
    coins = [
        new Coin({x: platformImg.width, y: 450}, coinImg),
        new Coin({x: platformImg.width + 100, y: 450}, coinImg),
        new Coin({x: platformImg.width + 200, y: 450}, coinImg),
        new Coin({x: platformImg.width + 300, y: 450}, coinImg),
        new Coin({x: platformImg.width + 400, y: 450}, coinImg),
        new Coin({ x: platformImg.width * 2 + 200, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 2 + 300, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 2 + 400, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 2 + 500, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 2 + 600, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 3 + 300, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 3 + 400, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 3 + 500, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 3 + 600, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 5 - 100, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 5 + 000, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 5 + 100, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 5 + 200, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 5 + 300, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 5 + 400, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 5 + 500, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 5 + 600, y: 240 }, coinImg),
        new Coin({ x: platformImg.width * 5 + 700, y: 240 }, coinImg),
        new Coin({ x: platformImg.width * 5 + 800, y: 240 }, coinImg),
        new Coin({ x: platformImg.width * 7 + 100, y: 250 }, coinImg),
        new Coin({ x: platformImg.width * 7 + 200, y: 250 }, coinImg),
        new Coin({ x: platformImg.width * 7 + 300, y: 250 }, coinImg),
        new Coin({ x: platformImg.width * 7 + 400, y: 250 }, coinImg),
        new Coin({ x: platformImg.width * 7 + 100, y: 350 }, coinImg),
        new Coin({ x: platformImg.width * 7 + 200, y: 350 }, coinImg),
        new Coin({ x: platformImg.width * 7 + 300, y: 350 }, coinImg),
        new Coin({ x: platformImg.width * 7 + 400, y: 350 }, coinImg),
        new Coin({ x: platformImg.width * 7 + 100, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 7 + 200, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 7 + 300, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 7 + 400, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 8 + 200, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 8 + 300, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 8 + 400, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 8 + 500, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 8 + 600, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 8 + 700, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 8 + 800, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 8 + 900, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 8 + 1000, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 10 + 200, y: 250 }, coinImg),
        new Coin({ x: platformImg.width * 10 + 300, y: 250 }, coinImg),
        new Coin({ x: platformImg.width * 10 + 400, y: 250 }, coinImg),
        new Coin({ x: platformImg.width * 11 + 200, y: 140 }, coinImg),
        new Coin({ x: platformImg.width * 11 + 300, y: 140 }, coinImg),
        new Coin({ x: platformImg.width * 11 + 400, y: 140 }, coinImg),
        new Coin({ x: platformImg.width * 13 + 100, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 13 + 200, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 13 + 300, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 13 + 400, y: 450 }, coinImg),
        new Coin({ x: platformImg.width * 14 + 200, y: 250 }, coinImg),
        new Coin({ x: platformImg.width * 14 + 300, y: 250 }, coinImg),
        new Coin({ x: platformImg.width * 14 + 400, y: 250 }, coinImg),
        new Coin({ x: platformImg.width * 15 + 200, y: 150 }, coinImg),
        new Coin({ x: platformImg.width * 15 + 300, y: 150 }, coinImg),
        new Coin({ x: platformImg.width * 15 + 400, y: 150 }, coinImg),
        new Coin({ x: platformImg.width * 16 + 200, y: 150 }, coinImg),
        new Coin({ x: platformImg.width * 16 + 300, y: 150 }, coinImg),
        new Coin({ x: platformImg.width * 16 + 400, y: 150 }, coinImg),
        new Coin({ x: platformImg.width * 17 + 200, y: 150 }, coinImg),
        new Coin({ x: platformImg.width * 17 + 300, y: 150 }, coinImg),
        new Coin({ x: platformImg.width * 17 + 400, y: 150 }, coinImg),
        new Coin({ x: platformImg.width * 18 + 200, y: 250 }, coinImg),
        new Coin({ x: platformImg.width * 18 + 300, y: 250 }, coinImg),
        new Coin({ x: platformImg.width * 18 + 400, y: 250 }, coinImg),
    ];
    offScrollSet = 0;
    score = 0;
    jump = 0;
    scoreEl[0].innerHTML = score;
    window.addEventListener("keydown", EventkeyDown);
    window.addEventListener("keyup", EventkeyUp);
}

let animateID;
function animate() {
    animateID = requestAnimationFrame(animate);
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    genericObjects.forEach(genericObject => {
        genericObject.draw();
    });

    platforms.forEach(platform => {
        platform.draw();
    });

    coins.forEach(coin => {
        coin.draw();
    });

    player.update();

    if (keys.right.pressed && player.position.x < 400) {
        player.velocity.x = player.speed;
    } else if ((keys.left.pressed && player.position.x > 100)
        || (keys.left.pressed && offScrollSet === 0 && player.position.x > 0)) {
        player.velocity.x = -player.speed;
    } else {
        player.velocity.x = 0;
        if (keys.right.pressed) {
            offScrollSet += player.speed;
            platforms.forEach(platform => {
                platform.position.x -= player.speed;
            });
            genericObjects.forEach(genericObject => {
                genericObject.position.x -= player.speed * 0.66;
            });
            coins.forEach(coin => {
                coin.position.x -= player.speed;
            });
        } else if (keys.left.pressed && offScrollSet > 0) {
            offScrollSet -= player.speed;
            platforms.forEach(platform => {
                platform.position.x += player.speed;
            });
            genericObjects.forEach(genericObject => {
                genericObject.position.x += player.speed * 0.66;
            });
            coins.forEach(coin => {
                coin.position.x += player.speed;
            });
        } else {}
    }

    // Platform Collision Detection
    platforms.forEach(platform => {
        if (player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y &&
            player.position.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width) {
            player.velocity.y = 0;
        }
    });

    coins.forEach((coin, index) => {
        if (player.position.x + player.width /2 >= coin.position.x
            && player.position.x + player.width /2 <= coin.position.x + coin.width
            && player.position.y + player.height /2 >= coin.position.y
            && player.position.y + player.height /2 <= coin.position.y + coin.height) {
        score += 25;
        scoreEl[0].innerHTML = score;
        // Delete Coin
        setTimeout(() => {
            coins.splice(index , 1);
        }, 0);
    }
    });

    // Win Scenario
    if (offScrollSet > platformImg.width * 17 + 1000) {
        result.style.display = "block";
        winning.style.display = "flex";
        scoreEl[2].innerHTML = score;
        cancelAnimationFrame(animateID);
    }

    // Lose Scenario
    if (player.position.y + player.height > canvas.height) {
        result.style.display = "block";
        gameOver.style.display = "flex";
        scoreEl[1].innerHTML = score;

        cancelAnimationFrame(animateID);
    }
}


function animate2(){
    animateID = requestAnimationFrame(animate2);
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);

    genericObjects.forEach(genericObject => {
        genericObject.draw();
    });

    platforms.forEach(platform => {
        platform.draw();
    });

    coins.forEach(coin => {
        coin.draw();
    });

    enemies.forEach(enemy => {
        enemy.update();
    });

    particles.forEach((particle , index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        } else {
            particle.update();
        }
    });

    player.update();
    

    if (keys.right.pressed && player.position.x < 400) {
        player.velocity.x = player.speed;
    } else if ((keys.left.pressed && player.position.x > 100)
        || (keys.left.pressed && offScrollSet === 0 && player.position.x > 0)) {
        player.velocity.x = -player.speed;
    } else {
        player.velocity.x = 0;
        if (keys.right.pressed) {
            offScrollSet += player.speed;
            platforms.forEach(platform => {
                platform.position.x -= player.speed;
            });
            genericObjects.forEach(genericObject => {
                genericObject.position.x -= player.speed * 0.66;
            });
            coins.forEach(coin => {
                coin.position.x -= player.speed;
            });
            enemies.forEach(enemy => {
                enemy.position.x -= player.speed;
                enemy.point.start -= player.speed;
                enemy.point.end -= player.speed;
            });
        } else if (keys.left.pressed && offScrollSet > 0) {
            offScrollSet -= player.speed;
            platforms.forEach(platform => {
                platform.position.x += player.speed;
            });
            genericObjects.forEach(genericObject => {
                genericObject.position.x += player.speed * 0.66;
            });
            coins.forEach(coin => {
                coin.position.x += player.speed;
            });
            enemies.forEach(enemy => {
                enemy.position.x += player.speed;
                enemy.point.start += player.speed;
                enemy.point.end += player.speed;
            });
        } else {}
    }

    // Platform Collision Detection
    platforms.forEach(platform => {
        if (player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y &&
            player.position.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width) {
            player.velocity.y = 0;
        }
    });

    coins.forEach((coin, index) => {
        if (player.position.x + player.width /2 >= coin.position.x
            && player.position.x + player.width /2 <= coin.position.x + coin.width
            && player.position.y + player.height /2 >= coin.position.y
            && player.position.y + player.height /2 <= coin.position.y + coin.height) {
        score += 25;
        scoreEl[0].innerHTML = score;
        // Delete Coin
        setTimeout(() => {
            coins.splice(index , 1);
        }, 0);
    }
    });

    // Enemies Collision Detection
    enemies.forEach((enemy, index) => {
        // kill enemy
        let dis = Math.abs(player.position.x - enemy.position.x)
        if((dis < player.width || dis < enemy.width)
            && player.position.y + player.height >= enemy.position.y
            && player.position.y + player.height <= enemy.position.y + 10){
                console.log("enemy Killed!");
                score += 100;
                scoreEl[0].innerHTML = score;

                // Create Explosions
                for (let i = 0; i < 15 ; i++){
                    particles.push(new Particle(
                        enemy.position.x + enemy.width / 2,
                        enemy.position.y + enemy.height / 2,
                        Math.random() * 3, "blue",
                        {
                            x: (Math.random() - 0.5) * 2,
                            y: (Math.random() - 0.5) * 2,
                        }
                    ));
                }

                setTimeout(() => {
                    enemies.splice(index , 1);
                }), 100;
        }else if((dis < player.width || dis < enemy.width)
            && player.position.y + player.height >= enemy.position.y
            && player.position.y + player.height + 50 >= enemy.position.y + enemy.height){
                // Lose Scenario
                result.style.display = "block";
                gameOver.style.display = "flex";
                scoreEl[1].innerHTML = score;

                setTimeout(() => {
                    cancelAnimationFrame(animateID);
                }, 100);
        }
    });

    // Win Scenario
    if (offScrollSet > platformImg.width * 17 + 1000) {
        result.style.display = "block";
        winning.style.display = "flex";
        scoreEl[2].innerHTML = score;
        cancelAnimationFrame(animateID);
    }

    // Lose Scenario
    if (player.position.y + player.height > canvas.height) {
        result.style.display = "block";
        gameOver.style.display = "flex";
        scoreEl[1].innerHTML = score;
        
        setTimeout(() => {
            cancelAnimationFrame(animateID);
        }, 1000);
    }
}

startGameBtn.addEventListener("click", () => {
    result.style.display = "none";
    winning.style.display = "none";
    gameOver.style.display = "none";
    initGame();
    if(!level2){
        animate();
    }else{
        animate2();
    }
});

UplevelBtn.addEventListener("click", () => {
    result.style.display = "none";
    winning.style.display = "none";
    gameOver.style.display = "none";
    level2 = true;
    initGame();
    animate2();
});


function EventkeyDown(event) {
    // console.log(event.code);
    switch (event.key) {
        case "ArrowLeft": // Left
        case "KeyA":
            player.currentSprite = player.sprite.run.left;
            player.currentCropWidth = player.sprite.run.cropWidth;
            player.width = player.sprite.run.width;
            keys.left.pressed = true;
            break;
        case "ArrowUp": // Up
        case "KeyW":
        case " ":
            if (jump < 2) {
                player.velocity.y -= 10;
                jump++;
            }
            break;
        case "ArrowDown": // Down
        case "KeyS":
            break;
        case "ArrowRight": // Right
        case "KeyD":
            player.currentSprite = player.sprite.run.right;
            player.currentCropWidth = player.sprite.run.cropWidth;
            player.width = player.sprite.run.width;
            keys.right.pressed = true;
            break;
        default: // Otherwise key!
            break;
    }
}

function EventkeyUp(event) {
    switch (event.key) {
        case "ArrowLeft": // Left
        case "KeyA":
            player.currentSprite = player.sprite.stand.left;
            player.currentCropWidth = player.sprite.stand.cropWidth;
            player.width = player.sprite.stand.width;
            keys.left.pressed = false;
            break;
        case "ArrowUp": // Up
        case "KeyW":
        case " ":
            jump = 0;
            break;
        case "ArrowDown": // Down
        case "KeyS":
            break;
        case "ArrowRight": // Right
        case "KeyD":
            player.currentSprite = player.sprite.stand.right;
            player.currentCropWidth = player.sprite.stand.cropWidth;
            player.width = player.sprite.stand.width;
            keys.right.pressed = false;
            break;
        default: // Otherwise key!
            break;
    }
}