// ==========================================
// HOMEPAGE SPOTLIGHT SLIDER
// ==========================================

const slides =
    document.querySelectorAll(".spotlight-slide");

const dots =
    document.querySelectorAll(".spotlight-dot");

const SLIDE_DURATION = 10000;

let currentSlide = 0;
let slideTimer;


function showSlide(index) {

    slides.forEach((slide, i) => {

        slide.classList.toggle(
            "active",
            i === index
        );

    });


    dots.forEach((dot, i) => {

        dot.classList.toggle(
            "active",
            i === index
        );

    });


    currentSlide = index;

}


function nextSlide() {

    if (slides.length === 0) {
        return;
    }

    const next =
        (currentSlide + 1) % slides.length;

    showSlide(next);

}


function startSlider() {

    clearInterval(slideTimer);

    if (slides.length > 1) {

        slideTimer =
            setInterval(
                nextSlide,
                SLIDE_DURATION
            );

    }

}


dots.forEach((dot, index) => {

    dot.addEventListener("click", () => {

        showSlide(index);

        startSlider();

    });

});


if (slides.length > 0) {

    showSlide(0);

    startSlider();

}


// ==========================================
// API
// ==========================================

const API_BASE_URL =
    "http://localhost:8080/api/v1";

const PREMIUM_API =
    `${API_BASE_URL}/premium`;

const HAPPENINGS_API =
    `${API_BASE_URL}/happenings`;


// ==========================================
// HAPPENINGS
// ==========================================

async function loadHappenings() {

    const container =
        document.getElementById(
            "happeningsSpotlight"
        );

    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(HAPPENINGS_API);


        if (!response.ok) {

            throw new Error(
                "Failed to load happenings"
            );

        }


        const result =
            await response.json();


        let happenings =
            result.data || [];


        // ------------------------------------------
        // Only show published happenings
        // ------------------------------------------

        happenings =
            happenings.filter(
                happening =>
                    happening.published === true
            );


        // ------------------------------------------
        // No published happenings
        // ------------------------------------------

        if (happenings.length === 0) {

            showHappeningsFallback(
                container
            );

            return;

        }


        // ------------------------------------------
        // Sort newest created first
        // ------------------------------------------

        happenings.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.created_at || 0
                    );

                const dateB =
                    new Date(
                        b.created_at || 0
                    );

                return dateB - dateA;

            }
        );


        const happening =
            happenings[0];


        renderHappening(
            container,
            happening
        );


    } catch (error) {

        console.error(
            "Happenings error:",
            error
        );


        showHappeningsFallback(
            container
        );

    }

}


// ==========================================
// RENDER HAPPENING
// ==========================================

function renderHappening(
    container,
    happening
) {

    const image =
        happening.image_url
            ? `
                <img
                    src="${escapeHTML(
                        happening.image_url
                    )}"
                    alt="${escapeHTML(
                        happening.title
                    )}"
                    class="happening-featured-image"
                >
            `
            : "";


    const location =
        happening.location
            ? `
                <p class="happening-meta">
                    📍 ${escapeHTML(
                        happening.location
                    )}
                </p>
            `
            : "";


    const eventDate =
        happening.event_date
            ? `
                <p class="happening-meta">
                    📅 ${formatEventDate(
                        happening.event_date
                    )}
                </p>
            `
            : "";


    const category =
        happening.category
            ? `
                <span class="featured-category">
                    ${escapeHTML(
                        happening.category
                    )}
                </span>
            `
            : "";


    container.innerHTML = `

        ${image}

        <span class="spotlight-live-badge">
            HAPPENING NOW
        </span>

        ${category}

        <h2>
            ${escapeHTML(
                happening.title
            )}
        </h2>

        <p>
            ${escapeHTML(
                happening.description
            )}
        </p>

        ${location}

        ${eventDate}

        <a
            href="happenings.html"
            class="spotlight-button"
        >
            Explore Happenings →
        </a>

    `;

}


// ==========================================
// HAPPENINGS FALLBACK
// ==========================================

function showHappeningsFallback(
    container
) {

    container.innerHTML = `

        <h2>
            Stay Connected With Idoma
        </h2>

        <p>
            Discover events, community activities,
            announcements and stories from across
            Idoma Land.
        </p>

        <a
            href="heritage.html"
            class="spotlight-button"
        >
            Explore Idoma Stories →
        </a>

    `;

}


// ==========================================
// FORMAT EVENT DATE
// ==========================================

function formatEventDate(
    dateString
) {

    const date =
        new Date(dateString);


    if (Number.isNaN(
        date.getTime()
    )) {

        return "";

    }


    return date.toLocaleDateString(
        "en-NG",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// PREMIUM FEATURED
// ==========================================

async function loadPremiumFeatured() {

    const container =
        document.getElementById(
            "featuredBusiness"
        );


    if (!container) {
        return;
    }


    try {

        const response =
            await fetch(PREMIUM_API);


        if (!response.ok) {

            throw new Error(
                "Failed to load premium listings"
            );

        }


        const result =
            await response.json();


        const listings =
            result.data || [];


        if (listings.length === 0) {

            showPremiumFallback(
                container
            );

            return;

        }


        const listing =
            listings[0];


        container.innerHTML = `

            ${
                listing.image_url
                    ? `
                        <img
                            src="${escapeHTML(
                                listing.image_url
                            )}"
                            alt="${escapeHTML(
                                listing.business_name
                            )}"
                            class="premium-featured-image"
                        >
                    `
                    : ""
            }

            <span class="premium-badge">
                PREMIUM FEATURED
            </span>

            <span class="featured-category">
                ${escapeHTML(
                    listing.category
                )}
            </span>

            <h2 class="premium-featured-title">
                ${escapeHTML(
                    listing.business_name
                )}
            </h2>

            <p class="premium-featured-description">
                ${escapeHTML(
                    listing.title
                )}
            </p>

            <p class="premium-featured-description">
                ${
                    listing.description
                        ? escapeHTML(
                            listing.description
                        )
                        : "Discover this business on IDOMA-CONNECT."
                }
            </p>

            <p class="premium-featured-business">
                📍 ${escapeHTML(
                    listing.lga
                )}
            </p>

            <a
                href="business.html?id=${encodeURIComponent(
                    listing.business_id
                )}"
                class="spotlight-button"
            >
                View Business →
            </a>

        `;

    } catch (error) {

        console.error(
            "Premium featured error:",
            error
        );


        showPremiumFallback(
            container
        );

    }

}


// ==========================================
// PREMIUM FALLBACK
// ==========================================

function showPremiumFallback(
    container
) {

    container.innerHTML = `

        <h2>
            Put Your Business in the Spotlight
        </h2>

        <p>
            Promote your business to customers
            across Idoma Land with a premium
            listing on IDOMA-CONNECT.
        </p>

        <a
            href="add-business.html"
            class="spotlight-button"
        >
            List Your Business →
        </a>

    `;

}


// ==========================================
// LOAD HOMEPAGE DATA
// ==========================================

loadHappenings();

loadPremiumFeatured();
