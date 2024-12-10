let color1 = [0,0,0];

let color2 = [0,0,0];

let change1 = [0,0,0];

let change2 = [0,0,0];

let target1 = [0,0,0];

let target2 = [0,0,0];

let startTime = null

function checkTarget(color, target, change){
    if(change[0] == 0 || Math.abs(color[0] - target[0]) < 1){
        target = generateNewTarget(target);
        change = [target[0] - color[0], target[1] - color[1], target[2] - color[2]];

        let magnitude = Math.sqrt(change[0] * change[0] + change[1] * change[1] + change[2] * change[2]);
        

        for(let i = 0; i < 3; i++){
            change[i] = change[i] / magnitude;
        }
        
    }

    return [target,change];
}
function updateValues(){
    color1 = updateValue(color1,change1);
    color2 = updateValue(color2,change2);

    let r1 = checkTarget(color1, target1, change1);
    target1 = r1[0];
    change1 = r1[1];

    let r2 = checkTarget(color2, target2, change2);
    target2 = r2[0];
    change2 = r2[1];
    
}

function generateNewTarget(current){
    let c = [0,0,0];
    do{
        c = [getRandomInt(256), getRandomInt(256), getRandomInt(256)];
    } while(Math.abs(c[0] + c[1] + c[2] - current[0] - current[1] - current[2]) < 50);
    
    return c;
}
function animate(timestamp){
    if(!startTime) startTime = timestamp;

    let progress = timestamp - startTime;

    updateValues();
    updateColor();

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

function createColor(color){
    return `rgb(${color[0]},${color[1]},${color[2]})`;
}

function updateColor(){
    let c1 = createColor(color1);
    let c2 = createColor(color2);


    document.getElementById("background").style.background = `radial-gradient(${c1},${c2})`;

    document.getElementById("btn").style.border =  `2px solid ${c1}`;

    document.getElementById("btn").style.border =  `2px solid ${c1}`;

    document.getElementById("button-container").style.borderImage = `linear-gradient(to right, ${c1},${c2}) 1`

    
}

function getRandomInt(max){
    return Math.floor(Math.random() * max);
}

function printColor(color){
    console.log(color[0] + " " + color[1] + " " + color[2]);
}

function changeColor(){

    let min = 255;
    do{
        min = 255;
        for(let i = 0; i < 3; i++){
            color1[i] = getRandomInt(256);
            color2[i] = getRandomInt(256);
            min = Math.min(min, color2[i] - color1[i]);
        }
    } while(min < 20);
    updateColor();
    let c1 = createColor(color1);
    document.getElementById("btn").style.backgroundColor =  `${c1}`;
}

function updateValue(value, change){
    for(let i = 0; i < 3; i++){
        value[i] = Math.max(0,Math.min(value[i] + change[i],255));
    }
    //printColor(value);
    return value;
}

function scroll(event){
    //event.preventDefault();

    let change = event.deltaY / 20.0;

    color1 = updateValue(color1,[change,change,change]);
    color2 = updateValue(color2,[change,change,change]);

    updateColor();
}

const el = document.querySelector("body");
el.onwheel = scroll;

changeColor();


const btn = document.querySelector('#btn');
btn.style.backgroundColor = "white";
btn.style.color = "black";

btn.addEventListener("mouseenter", function( event ) {   
    let c1 = `rgb(${color1[0]},${color1[1]},${color1[2]})`;
    event.target.style.backgroundColor = `${c1}`;

    if(color1[0] + color1[1] + color1[2] > 600){
        event.target.style.color = "white";
    }
  }, false);
  btn.addEventListener("mouseleave", function( event ) {   
    event.target.style.backgroundColor = "white";
    event.target.style.color = "black";
  }, false);