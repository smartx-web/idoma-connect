const slides = document.querySelectorAll(".spotlight-slide");
const dots = document.querySelectorAll(".spotlight-dot");

const SLIDE_DURATION = 10000;

let currentSlide = 0;
let slideTimer;

function showSlide(index) {


slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
});

dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
});

currentSlide = index;

}

function nextSlide() {

const next =
    (currentSlide + 1) % slides.length;

showSlide(next);

}

function startSlider() {

clearInterval(slideTimer);

slideTimer =
    setInterval(nextSlide, SLIDE_DURATION);

}

dots.forEach((dot, index) => {

dot.addEventListener("click", () => {

    showSlide(index);

    startSlider();

});


});

showSlide(0);

startSlider();
