var red, green, blue;

var red2, green2, blue2;

var change = 1;

function updateColor(){
    let color1 = `rgb(${red},${green},${blue})`;
    let color2 = `rgb(${red2},${green2},${blue2})`;


    document.getElementById("background").style.background = `radial-gradient(${color1},${color2})`;

    document.getElementById("btn").style.border =  `2px solid ${color1}`;

    document.getElementById("btn").style.border =  `2px solid ${color1}`;

    document.getElementById("button-container").style.borderImage = `linear-gradient(to right, ${color1},${color2}) 1`

    
}

function getRandomInt(max){
    return Math.floor(Math.random() * max);
}

function changeColor(){

    red = getRandomInt(256);
    green = getRandomInt(256);
    blue = getRandomInt(256);

    red2 = getRandomInt(256);
    green2 = getRandomInt(256);
    blue2 = getRandomInt(256);

    while(Math.abs(red2 - red) < 20 && Math.abs(green2 - green) < 20 && Math.abs(blue2 - blue) < 20){
        red2 = getRandomInt(256);
        green2 = getRandomInt(256);
        blue2 = getRandomInt(256);
    }

    

    updateColor();
    let color1 = `rgb(${red},${green},${blue})`;
    document.getElementById("btn").style.backgroundColor =  `${color1}`;
}

function updateValue(value, change){
    return (value + change) % 256;
}

function scroll(event){
    //event.preventDefault();

    let change = event.deltaY / 20.0;

    red = updateValue(red,change);
    green = updateValue(green,change);
    blue = updateValue(blue,change);

    red2 = updateValue(red2,change*0.8);
    green2 = updateValue(green2,change*0.8);
    blue2 = updateValue(blue2,change*0.8);

    updateColor();
}

const el = document.querySelector("body");
el.onwheel = scroll;

changeColor();


const btn = document.querySelector('#btn');
btn.style.backgroundColor = "white";
btn.style.color = "black";

btn.addEventListener("mouseenter", function( event ) {   
    let color1 = `rgb(${red},${green},${blue})`;
    event.target.style.backgroundColor = `${color1}`;

    if(red + green + blue > 600){
        event.target.style.color = "white";
    }
  }, false);
  btn.addEventListener("mouseleave", function( event ) {   
    event.target.style.backgroundColor = "white";
    event.target.style.color = "black";
  }, false);