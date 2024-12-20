let menuOpen = false;

//constants that refer to html objects
const overlay = document.getElementById('overlay');
const sideNav = document.querySelector('#side-bar');

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

//Close side nav if the user clicks away from the side nav
document.body.addEventListener('click', function (event) {
    if (!sideNav.contains(event.target) && menuOpen) {
        closeNav();
    }
});