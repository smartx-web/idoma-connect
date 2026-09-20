const API_BASE_URL =
    "http://localhost:8080/api/v1";

const BUSINESS_API =
    `${API_BASE_URL}/businesses`;

const PREMIUM_API =
    `${API_BASE_URL}/premium`;


// =============================
// DOM ELEMENTS
// =============================

const loading =
    document.getElementById("loading");

const businessCard =
    document.getElementById("business");

const errorBox =
    document.getElementById("error");

const businessImage =
    document.getElementById("businessImage");

const category =
    document.getElementById("category");

const name =
    document.getElementById("name");

const verified =
    document.getElementById("verified");

const description =
    document.getElementById("description");

const address =
    document.getElementById("address");

const lga =
    document.getElementById("lga");

const phone =
    document.getElementById("phone");

const locationText =
    document.getElementById("locationText");

const mapBtn =
    document.getElementById("mapBtn");

const callBtn =
    document.getElementById("callBtn");

const whatsappBtn =
    document.getElementById("whatsappBtn");

const mapContainer =
    document.getElementById("map");

const premiumBadge =
    document.getElementById("premiumBadge");


// =============================
// READ BUSINESS ID
// =============================

const params =
    new URLSearchParams(
        window.location.search
    );

const businessId =
    params.get("id");


// =============================
// LEAFLET MAP
// =============================

let businessMap = null;


// =============================
// SHOW ERROR
// =============================

function showError(
    message = "We couldn't find this business."
) {

    loading.style.display =
        "none";

    businessCard.style.display =
        "none";

    if (errorBox) {

        errorBox.style.display =
            "block";

        const paragraph =
            errorBox.querySelector("p");

        if (paragraph) {

            paragraph.textContent =
                message;
        }
    }
}


// =============================
// LOAD BUSINESS
// =============================

async function loadBusiness() {

    // --------------------------------
    // Check business ID
    // --------------------------------

    if (!businessId) {

        showError(
            "No business was specified."
        );

        return;
    }


    try {

        // --------------------------------
        // Fetch business
        // --------------------------------

        const response =
            await fetch(
                `${BUSINESS_API}/${businessId}`
            );


        const result =
            await response.json();


        // --------------------------------
        // Validate response
        // --------------------------------

        if (
            !response.ok ||
            !result.success ||
            !result.data
        ) {

            throw new Error(
                "Business not found"
            );
        }


        const business =
            result.data;


        // --------------------------------
        // Update page title
        // --------------------------------

        document.title =
            `${business.name || "Business"} | IDOMA CONNECT`;


        // --------------------------------
        // Render business
        // --------------------------------

        renderBusiness(
            business
        );


        // --------------------------------
        // Check Premium status
        // --------------------------------

        await checkPremiumStatus(
            business.id
        );


        // --------------------------------
        // Show business
        // --------------------------------

        loading.style.display =
            "none";

        businessCard.style.display =
            "block";


    } catch (error) {

        console.error(
            "Error loading business:",
            error
        );

        showError(
            "Unable to load this business. Please try again."
        );
    }
}


// =============================
// RENDER BUSINESS
// =============================

function renderBusiness(
    business
) {


    // =============================
    // BUSINESS IMAGE
    // =============================

    const imageURL =
        business.image_url ||
        "images/placeholder.jpg";


    businessImage.src =
        imageURL;


    businessImage.alt =
        business.name ||
        "Business Image";


    businessImage.onerror =
        function () {

            if (
                this.src.includes(
                    "placeholder.jpg"
                )
            ) {

                return;
            }


            this.src =
                "images/placeholder.jpg";
        };


    // =============================
    // CATEGORY
    // =============================

    category.textContent =
        business.category ||
        "Business";


    // =============================
    // BUSINESS NAME
    // =============================

    name.textContent =
        business.name ||
        "Unnamed Business";


    // =============================
    // DESCRIPTION
    // =============================

    description.textContent =
        business.description ||
        "No description available.";


    // =============================
    // ADDRESS
    // =============================

    address.textContent =
        business.address ||
        "Address not provided";


    // =============================
    // LGA
    // =============================

    lga.textContent =
        business.lga ||
        "LGA not provided";


    // =============================
    // PHONE
    // =============================

    phone.textContent =
        business.phone ||
        "Phone number not provided";


    // =============================
    // VERIFICATION
    // =============================

    if (
        business.verified
    ) {

        verified.textContent =
            "✓ Verified Business";

        verified.style.color =
            "#0a8f38";

    } else {

        verified.textContent =
            "Pending Verification";

        verified.style.color =
            "#777";
    }


    // =============================
    // CALL BUTTON
    // =============================

    if (
        business.phone
    ) {

        callBtn.href =
            `tel:${business.phone}`;

        callBtn.style.opacity =
            "1";

        callBtn.style.pointerEvents =
            "auto";

    } else {

        callBtn.removeAttribute(
            "href"
        );

        callBtn.style.opacity =
            "0.5";

        callBtn.style.pointerEvents =
            "none";
    }


    // =============================
    // WHATSAPP BUTTON
    // =============================

    if (
        business.whatsapp
    ) {

        whatsappBtn.href =
            `https://wa.me/${formatPhone(
                business.whatsapp
            )}`;

        whatsappBtn.style.opacity =
            "1";

        whatsappBtn.style.pointerEvents =
            "auto";

    } else {

        whatsappBtn.removeAttribute(
            "href"
        );

        whatsappBtn.style.opacity =
            "0.5";

        whatsappBtn.style.pointerEvents =
            "none";
    }


    // =============================
    // LOCATION
    // =============================

    renderLocation(
        business
    );
}


// =============================
// RENDER LOCATION
// =============================

function renderLocation(
    business
) {

    const hasLatitude =
        business.latitude !== null &&
        business.latitude !== undefined &&
        business.latitude !== "";


    const hasLongitude =
        business.longitude !== null &&
        business.longitude !== undefined &&
        business.longitude !== "";


    // =============================
    // NO COORDINATES
    // =============================

    if (
        !hasLatitude ||
        !hasLongitude
    ) {

        locationText.textContent =
            "Location coordinates not available.";


        mapBtn.style.display =
            "none";


        mapContainer.style.display =
            "none";


        return;
    }


    // =============================
    // CONVERT COORDINATES
    // =============================

    const latitude =
        Number(
            business.latitude
        );

    const longitude =
        Number(
            business.longitude
        );


    // =============================
    // INVALID COORDINATES
    // =============================

    if (
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
    ) {

        locationText.textContent =
            "Location coordinates are invalid.";


        mapBtn.style.display =
            "none";


        mapContainer.style.display =
            "none";


        return;
    }


    // =============================
    // LOCATION TEXT
    // =============================

    const locationName =
        business.address ||
        business.lga ||
        "Business location";


    locationText.textContent =
        `${locationName} (${latitude}, ${longitude})`;


    // =============================
    // GOOGLE MAPS
    // =============================

    mapBtn.href =
        `https://www.google.com/maps?q=${latitude},${longitude}`;


    mapBtn.style.display =
        "inline-block";


    // =============================
    // SHOW MAP
    // =============================

    mapContainer.style.display =
        "block";


    initializeMap(
        business,
        latitude,
        longitude
    );
}


// =============================
// INITIALIZE LEAFLET MAP
// =============================

function initializeMap(
    business,
    latitude,
    longitude
) {

    // --------------------------------
    // Prevent duplicate maps
    // --------------------------------

    if (businessMap) {

        businessMap.remove();

        businessMap = null;
    }


    // --------------------------------
    // Create map
    // --------------------------------

    businessMap =
        L.map(
            "map"
        ).setView(
            [
                latitude,
                longitude
            ],
            15
        );


    // --------------------------------
    // OpenStreetMap tiles
    // --------------------------------

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(
        businessMap
    );


    // --------------------------------
    // Popup address
    // --------------------------------

    const popupAddress =
        business.address ||
        business.lga ||
        "Business location";


    // --------------------------------
    // Business marker
    // --------------------------------

    L.marker(
        [
            latitude,
            longitude
        ]
    )
    .addTo(
        businessMap
    )
    .bindPopup(
        `
            <strong>
                ${escapeHTML(
                    business.name ||
                    "Business"
                )}
            </strong>
            <br>
            ${escapeHTML(
                popupAddress
            )}
        `
    )
    .openPopup();
}


// =============================
// CHECK PREMIUM STATUS
// =============================

async function checkPremiumStatus(
    currentBusinessId
) {

    // --------------------------------
    // Make sure badge exists
    // --------------------------------

    if (!premiumBadge) {

        return;
    }


    // --------------------------------
    // Hide by default
    // --------------------------------

    premiumBadge.style.display =
        "none";


    try {

        // --------------------------------
        // Fetch active premium listings
        // --------------------------------

        const response =
            await fetch(
                PREMIUM_API
            );


        // --------------------------------
        // Stop if API fails
        // --------------------------------

        if (!response.ok) {

            return;
        }


        // --------------------------------
        // Read response
        // --------------------------------

        const result =
            await response.json();


        const listings =
            result.data || [];


        // --------------------------------
        // Find this business
        // --------------------------------

        const premiumListing =
            listings.find(
                listing =>
                    Number(
                        listing.business_id
                    ) ===
                    Number(
                        currentBusinessId
                    )
            );


        // --------------------------------
        // Show Premium badge
        // --------------------------------

        if (
            premiumListing
        ) {

            premiumBadge.style.display =
                "inline-block";
        }


    } catch (error) {

        console.warn(
            "Premium status could not be checked:",
            error
        );


        // --------------------------------
        // Keep badge hidden if API fails
        // --------------------------------

        premiumBadge.style.display =
            "none";
    }
}


// =============================
// FORMAT NIGERIAN PHONE
// =============================

function formatPhone(
    number
) {

    if (!number) {

        return "";
    }


    let cleaned =
        String(number)
            .replace(
                /\D/g,
                ""
            );


    // --------------------------------
    // Nigerian local number
    // --------------------------------

    if (
        cleaned.startsWith("0")
    ) {

        return (
            "234" +
            cleaned.substring(1)
        );
    }


    // --------------------------------
    // Already international
    // --------------------------------

    if (
        cleaned.startsWith("234")
    ) {

        return cleaned;
    }


    return cleaned;
}


// =============================
// ESCAPE HTML
// =============================

function escapeHTML(
    value
) {

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


// =============================
// START APPLICATION
// =============================

loadBusiness();
