let themeSelected = 0;

const btn = document.querySelector("#btn");
const topNav = document.getElementById("top-nav");
const loc = document.getElementById("location");
const nameText = document.getElementById("center-name-text");

const boxes = {
  topLeft: document.getElementById("top-left-container"),
  topRight: document.getElementById("top-right-container"),
  middleLeft: document.getElementById("middle-left-container"),
  middleRight: document.getElementById("middle-right-container"),
  bottomLeft: document.getElementById("bottom-left-container"),
  bottomRight: document.getElementById("bottom-right-container"),
}

let theme = localStorage.getItem('theme');


$(document).ready(function() {
  
  if (!theme) {
    theme = 'light'; // Default to 'light' if no theme is stored
    localStorage.setItem('theme', theme); // Store the 'light' theme in localStorage
  }
  
  if(theme == 'light'){
    lightTheme();
  } else {
    darkTheme();
  }
  // Apply the theme (e.g., to the body element or a specific class)
  document.body.classList.add(theme);

  });


function changeContent() {
  btn.classList.add("name-plate-content");
  btn.classList.remove("btn");
  for (const key in boxes) {
    boxes[key].classList.remove("hidden");
    boxes[key].classList.add("animate-center-box");
  }
}

function changeToBlackText(element){
  element.classList.add("black-text");
  element.classList.remove("white-text");
}
function changeToWhiteText(element){
  element.classList.add("white-text");
  element.classList.remove("black-text");
}
function changeTheme(){
  for (const key in boxes) {
    boxes[key].classList.remove("left");
    boxes[key].classList.remove("right");
    boxes[key].classList.remove("bottom");
  }

  changeToBlackText(nameText);
  changeToBlackText(loc);
}



function lightTheme() {
  themeSelected = 1;
  topNav.classList.add("light-theme-top-nav");
  topNav.classList.remove("base-theme-top-nav");

  btn.style.background = `rgb(255,255,255, 0.7)`;

  changeTheme();
  changeContent();
  
  snow();
  for (const key in boxes) {
    boxes[key].classList.add("light-theme-box");
  }
}

function darkTheme() {
  themeSelected = 2;
  
  changeTheme();
  changeContent();

  btn.style.backgroundColor = "white";

  makeItRain();


  for (const key in boxes) {
    boxes[key].classList.add("dark-theme-box");
  }
  localStorage.setItem('theme', 'dark');
}

var makeItRain = function () {
  //clear out everything
  $(".rain").empty();

  var increment = 0;
  var drops = "";

  while (increment < 100) {
    //couple random numbers to use for various randomizations
    //random number between 98 and 1
    var randoHundo = Math.floor(Math.random() * (98 - 1 + 1) + 1);
    //random number between 5 and 2
    var randoFiver = Math.floor(5 * Math.random() + 10);
    //increment
    increment += randoFiver;
    //add in a new raindrop with various randomizations to certain CSS properties
    drops +=
      '<div class="drop" style="left: ' +
      increment +
      "%;animation-delay: 1." +
      randoHundo +
      "s; animation-duration: 0.9" +
      randoHundo +
      's;"><div class="stem" style="animation-delay: 1.' +
      randoHundo +
      "s; animation-duration: 0.9" +
      randoHundo +
      's;"></div></div>';
  }

  $(".rain").append(drops);
};
var snow = function () {
  $(".snow").empty();

  var x = 0;
  var drops = "";

  while (x < 100) {
    var randoHundo = 1 + Math.random() * 10;
    var randoFiver = Math.floor(6 * Math.random() + 3);

    // Increment
    x += randoFiver;

    // Add in a new raindrop with various randomizations to certain CSS properties
    drops += `
      <div class="slow-drop snowflake" style="left: ${x}%; animation-delay: ${randoHundo}s; animation-duration: 10s;">
        <div class="horizontal-shake" style="animation-delay: ${randoHundo}s; animation-duration: 3.5s;">
          ❅
        </div>
      </div>
    `;
  }

  $(".snow").append(drops);
};