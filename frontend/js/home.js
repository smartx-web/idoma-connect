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
// ==========================================
// FEATURED BUSINESS
// ==========================================

const BUSINESS_API =
    "http://localhost:8080/api/v1/businesses";

async function loadFeaturedBusiness() {

    const container =
        document.getElementById("featuredBusiness");

    if (!container) return;

    try {

        const response =
            await fetch(BUSINESS_API);

        if (!response.ok) {
            throw new Error("Failed to load businesses");
        }

        const result =
            await response.json();

        const businesses =
            result.data || [];

        if (businesses.length === 0) {

            showBusinessFallback(container);

            return;
        }

        // For now, use the first business.
        // Later we can rotate featured businesses.

        const business =
            businesses[0];

        container.innerHTML = `

            ${
                business.image_url
                    ? `
                        <img
                            src="${business.image_url}"
                            alt="${business.name}"
                            class="featured-business-image"
                        >
                    `
                    : ""
            }

            <span class="featured-category">
                ${business.category}
            </span>

            <h2>
                ${business.name}
            </h2>

            <p>
                ${business.description || "Discover this business on IDOMA-CONNECT."}
            </p>

            <p class="featured-location">
                📍 ${business.lga}
            </p>

            <a
                href="business.html?id=${business.id}"
                class="spotlight-button"
            >
                View Business →
            </a>

        `;

    } catch (error) {

        console.error(
            "Featured business error:",
            error
        );

        showBusinessFallback(container);
    }
}


// ==========================================
// FEATURED BUSINESS FALLBACK
// ==========================================

function showBusinessFallback(container) {

    container.innerHTML = `

        <h2>
            Put Your Business in the Spotlight
        </h2>

        <p>
            Reach customers across Idoma Land.
            List your business on IDOMA-CONNECT
            and connect with people looking for
            your products and services.
        </p>

        <a
            href="add-business.html"
            class="spotlight-button"
        >
            List Your Business →
        </a>

    `;
}


// Load featured business

loadFeaturedBusiness();