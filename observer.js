const header = document.querySelector("header");
const selectionOne = document.querySelector(".home-page");

const sectionOneOptions = {
    rootMargin: "-160px 0px 0px 0px"
};

const selectionOneObserver = new IntersectionObserver(function(
    entries, 
    selectionOneObserver
    ) {
    entries.forEach(entry => {
        if(!entry.isIntersecting) {
            header.classList.add("nav-scrolled");
        } else {
            header.classList.remove("nav-scrolled")
        }
    })
}, 
sectionOneOptions);

selectionOneObserver.observe(selectionOne);

var images = [
    'images/wilson-ye-qLhCKmBjTec-unsplash.jpg',
    'images/kyle-glenn-SrASYZZpyjw-unsplash.jpg',
    'images/john-towner-JgOeRuGD_Y4-unsplash.jpg',
    'images/elliott-engelmann-DjlKxYFJlTc-unsplash.jpg',
    'images/cassie-boca-gFyy2Po7T-k-unsplash.jpg',
    'images/alex-gorham-gIgciC_WKnY-unsplash.jpg'
];

var img = document.querySelector(".home-page");

function imgDisp(num){
    var num = Math.floor(Math.random() * images.length);
    img.style.backgroundImage = 'url("' + images[num] + '")';
    img.style.backgroundRepeat = "no-repeat";
}