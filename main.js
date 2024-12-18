const gradients = [
    [46, 49, 146, 27, 255, 255],
    [212, 20, 90, 251, 176, 59],
    [0, 146, 69, 252, 238, 33],
    [238, 156, 167, 255, 221, 225],
    [97, 67, 133, 81, 99, 149],
    [2, 170, 189, 0, 205, 172],
    [255, 81, 47, 221, 36, 118],
    [255, 95, 109, 255, 195, 113],
    [17, 153, 142, 56, 239, 125],
    [198, 234, 141, 254, 144, 175],
    [234, 141, 141, 168, 144, 254],
    [216, 181, 255, 30, 174, 152],
    [255, 97, 210, 254, 144, 144],
    [191, 240, 152, 111, 214, 255],
    [78, 101, 255, 146, 239, 253],
    [169, 241, 223, 255, 187, 187],
    [195, 55, 100, 29, 38, 113],
    [147, 165, 207, 228, 239, 233],
    [134, 143, 150, 89, 97, 100],
    [9, 32, 63, 83, 120, 149],
    [255, 236, 210, 252, 182, 159],
    [161, 196, 253, 194, 233, 251],
    [118, 75, 162, 102, 126, 234],
    [253, 252, 251, 226, 209, 195]
];
//color 1 is the inside color and color2 is the outside edge gradient color
let color1 = { value: [0, 0, 0], change: [0, 0, 0], target: [0, 0, 0] };
let color2 = { value: [0, 0, 0], change: [0, 0, 0], target: [0, 0, 0] };

let lastY = 0;


//color mode variables
let darkMode = 0;
let lightMode = 0;

let scrollDelay = 0;
let time = 0;

let themeSelected = 0;

//boolean to keep track of the state of the side nav bar
let menuOpen = false;

//constants that refer to html objects
const overlay = document.getElementById('overlay');
const btn = document.querySelector('#btn');
const sideNav = document.querySelector('#side-bar');
const body = document.body;
const background = document.getElementById("background");
const lightModePercent = document.getElementById('light-mode-percentage-text');
const darkModePercent = document.getElementById('dark-mode-percentage-text');
const lightModeContainer = document.getElementById('light-container');
const darkModeContainer = document.getElementById('dark-container');
const percentageElements = document.getElementsByClassName('arrow-container');
const arrows = document.getElementsByClassName('arrow');
const buttonContainer = document.getElementById("button-container");
const loc = document.getElementById("location");


//start the animation
requestAnimationFrame(animate);

//when scrolling call the scroll function
window.addEventListener('wheel', scroll, {passive: false});

//initialize a random starting background gradient color
changeColor();

//initialize the center button background and text color
//btn.style.backgroundColor = "white";
btn.style.color = "black";

//function to check if the color has reached its target returns a new target if it has reached its target
function checkTarget(color, target, change,loc){
    //if we have reached the target make a new one
    if(change[0] == 0 || (change[0] > 0 && color[0] >= target[0]) || (change[0] < 0 && color[0] <= target[0])){
        target = generateNewTarget(color, loc);
        //calculate the change array
        change = [target[0] - color[0], target[1] - color[1], target[2] - color[2]];

        //divide by the magnitude to turn it into a unit vector
        let magnitude = Math.sqrt(change[0] * change[0] + change[1] * change[1] + change[2] * change[2]);
        
        for(let i = 0; i < 3; i++){
            change[i] = change[i] / magnitude;
        }
    }

    return {target: target,change: change};
}

//function opens the side bar nav when called
function openNav(){
    //works by giving the side bar element an actual width
    document.getElementById("side-nav").style.width = "250px";
    menuOpen = true;

    //puts a dark overlay over the rest of the screen
    overlay.style.display = 'block';
}

//function closes the side bar nav when called
function closeNav(){
    //reduced the side bar nav width to 0 to make it disappear
    document.getElementById("side-nav").style.width = "0px";
    menuOpen = false;

    //remove the overlay
    overlay.style.display = 'none';
}

//updates the colors to move towards their target colors
function updateValues(){
    //update the values
    color1.value = updateValue(color1.value,color1.change);
    //check if we need a new target value and creates a new one if we do
    let r1 = checkTarget(color1.value, color1.target, color1.change,1);
    //update the new target and change arrays
    color1.target = r1.target;
    color1.change = r1.change;

    //do the same with the second color
    color2.value = updateValue(color2.value,color2.change);
    let r2 = checkTarget(color2.value, color2.target, color2.change,2);
    color2.target = r2.target;
    color2.change = r2.change;
    
}

//return an array of 3 ints that is at least somewhat different than the current color
function generateNewTarget(color, loc){
    let rand = getRandomInt(gradients.length);

    let gradientRGB = gradients[rand];

    while(gradientRGB[0] == color[0] || gradientRGB[3] == color[0]){
        rand = getRandomInt(gradients.length);

        gradientRGB = gradients[rand];
    }
        
    if(loc == 1) 
        return [gradientRGB[0],gradientRGB[1],gradientRGB[2]];
    else
        return [gradientRGB[3],gradientRGB[4],gradientRGB[5]];
}

//update values and set the colors to the new values
function animate(timestamp){
    time++;
    if(scrollDelay > 0){
        scrollDelay--;
        time = 0;
        //console.log(scrollDelay);
    } else {
        updateValues();
        updateColor();
        if(time % 10 == 0){
            lightMode = Math.round(Math.max(lightMode-time / 50,0));
            darkMode = Math.round(Math.max(darkMode-time / 50,0));
        }
        
        updatePercentageText();
    }

    
    if(themeSelected == 0){
        requestAnimationFrame(animate);
    }
    
}

function updatePercentageText(){
    lightModePercent.textContent = (Math.round(lightMode * 10)/10).toString() + '%';
    darkModePercent.textContent = (Math.round(darkMode * 10)/10).toString() + '%';
}

//Close side nav if the user clicks away from the side nav
document.body.addEventListener('click', function (event) {
    if (!sideNav.contains(event.target) && menuOpen) {
        closeNav();
    }
});

//creates an rgb color from 3 values
function createColor(color){
    return `rgb(${color[0]},${color[1]},${color[2]})`;
}

//function sets the css values to the newly updated js values
function updateColor(){
    if(themeSelected == 0){
        let c1 = createColor(color1.value);
        let c2 = createColor(color2.value);
    
    
        background.style.background = `radial-gradient(${c1},${c2})`;
        btn.style.background = `rgb(${color1.value[0]},${color1.value[1]},${color1.value[2]}, 0.7)`;
    
        //btn.style.border =  `2px solid ${c2}`;
    
        //buttonContainer.style.borderImage = `linear-gradient(to right, ${c1},${c2}) 1`
    
        let luminance = 0.2126 * (color1.value[0]/255) + 0.7152 * (color1.value[1]/255) + 0.0722 * (color1.value[2]/255);
    
        
        if(luminance >= 0.7){
            for(let i = 0; i < percentageElements.length; i++){
                percentageElements[i].style.color = 'black';
            }
            for(let i = 0; i < arrows.length; i++){
                arrows[i].style.borderColor = 'black';
            }
            btn.style.color = 'black';
            loc.style.color = 'black';
        } else if(luminance <= 0.3){
            for(let i = 0; i < percentageElements.length; i++){
                percentageElements[i].style.color = 'white';
            }
            for(let i = 0; i < arrows.length; i++){
                arrows[i].style.borderColor = 'white';
            }
            btn.style.color = 'white';
            loc.style.color = 'white';
        }
        
    } else if(themeSelected == 1){
        background.style.background = 'white';
        color1.value = [255,255,255];
        color2.value = [255,255,255];
    } else if(themeSelected == 2){
        background.style.background = 'black';
        color1.value = [0,0,0];
        color2.value = [0,0,0];
    }
    

}

//return int between 0 and max
function getRandomInt(max){
    return Math.floor(Math.random() * max);
}

//prints rgb of a color
function printColor(color){
    console.log(color[0] + " " + color[1] + " " + color[2]);
}

function lightTheme(){
    themeSelected = 1;
    lightModeContainer.classList.toggle('hidden');
    darkModeContainer.classList.toggle('hidden');
    background.style.backgroundColor = 'white';
    updateColor();
}

function darkTheme(){
    themeSelected = 2;
    lightModeContainer.classList.toggle('hidden');
    darkModeContainer.classList.toggle('hidden');
    background.style.backgroundColor = 'black';

    updateColor();
}

function reset(){
    requestAnimationFrame(animate);
    themeSelected = 0;
    lightModeContainer.classList.toggle('hidden');
    darkModeContainer.classList.toggle('hidden');
    lightMode = 0;
    darkMode = 0;
    updatePercentageText();
}

//generates a new gradient
function changeColor(){
    if(themeSelected != 0){
        reset();
    }

    let rand = getRandomInt(gradients.length);

    const gradientRGB = gradients[rand];
    
    color1.value = [gradientRGB[0],gradientRGB[1],gradientRGB[2]];
    color2.value = [gradientRGB[3],gradientRGB[4],gradientRGB[5]];

    updateColor();

    //also updates the color of the center button
    let c1 = createColor(color1.value);
    //document.getElementById("btn").style.backgroundColor =  `${c1}`;
}

//set color to the new value clamp between 0 and 255
function updateValue(value, change){
    for(let i = 0; i < 3; i++){
        value[i] = Math.max(0,Math.min(value[i] + change[i],255));
    }

    return value;
}

document.addEventListener('touchstart', function(event) {
    // Get the first touch point's Y position
    lastY = event.touches[0].pageY;
  });
  // Add a touchmove listener to calculate deltaY
document.addEventListener('touchmove', function(event) {
    // Get the current Y position of the first touch point
    const currentY = event.touches[0].pageY;
    
    // Calculate the deltaY (difference in Y position)
    const deltaY = currentY - lastY;
    
    if(themeSelected == 0){
        let change = -deltaY / 2.0;

        color1.value = updateValue(color1.value,[change,change,change]);
        color2.value = updateValue(color2.value,[change,change,change]);
    
        updateColor();
    
        change /= 2.5;
    
        if(change > 0){
            lightMode+=change;
            darkMode-=change;
        } else {
            darkMode+= -change;
            lightMode-= -change;
        }
    
        lightMode = Math.max(Math.min(100,lightMode),0);
        darkMode = Math.max(Math.min(100,darkMode),0);
    
        scrollDelay = Math.min(scrollDelay + 25, 400);
    
        updatePercentageText();
    
        if(lightMode == 100){
            lightTheme();
        }
        if(darkMode == 100){
            darkTheme();
        }
    }
  
    // Update the lastY value for the next move event
    lastY = currentY;
  
    // Prevent the default behavior (optional, if you want to prevent scrolling)
    event.preventDefault();
  });

//gets the distance scrolled and update the colors based on the distance
function scroll(event){
    if(themeSelected == 0){
        let change = -event.deltaY / 10.0;

        color1.value = updateValue(color1.value,[change,change,change]);
        color2.value = updateValue(color2.value,[change,change,change]);
    
        updateColor();
    
        change /= 2.5;
    
        if(change > 0){
            lightMode+=change;
            darkMode-=change;
        } else {
            darkMode+= -change;
            lightMode-= -change;
        }
    
        lightMode = Math.max(Math.min(100,lightMode),0);
        darkMode = Math.max(Math.min(100,darkMode),0);
    
        scrollDelay = Math.min(scrollDelay + 25, 400);
    
        updatePercentageText();
    
        if(lightMode == 100){
            lightTheme();
        }
        if(darkMode == 100){
            darkTheme();
        }
    }
    
}

/*
//changes color of center button on hover
btn.addEventListener("mouseenter", function( event ) {   
    let c1 = createColor(color1.value);
    event.target.style.backgroundColor = `${c1}`;
    if(color1.value[0] + color1.value[1] + color1.value[2] == 765){
        event.target.style.backgroundColor = `${createColor([211,211,211])}`;

    }

    let luminance = 0.2126 * (color1.value[0]/255) + 0.7152 * (color1.value[1]/255) + 0.0722 * (color1.value[2]/255);

    if(luminance >= 0.5){
        event.target.style.color = "black";
    } else {
        event.target.style.color = "white";

    }
  }, false);

//returns it back to default when not hovering
btn.addEventListener("mouseleave", function( event ) {   
    event.target.style.backgroundColor = "white";
    event.target.style.color = "black";
}, false);

*/