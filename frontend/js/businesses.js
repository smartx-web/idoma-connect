const API_URL = "https://idoma-connect-api.onrender.com/api/v1/businesses";

const grid = document.querySelector(".business-grid");
const search = document.getElementById("searchInput");
const lga = document.getElementById("lgaFilter");
const category = document.getElementById("categoryFilter");

let businesses = [];
let userLocation = null;
let locationRequest = 0;
let dataLoaded = false;
const nearMeButton = document.getElementById("nearMeButton");
const clearNearMe = document.getElementById("clearNearMe");
const nearMeStatus = document.getElementById("nearMeStatus");

function validCoordinates(latitude, longitude) {
    if (latitude === null || latitude === undefined || String(latitude).trim() === "" ||
        longitude === null || longitude === undefined || String(longitude).trim() === "") return false;
    return Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude)) &&
        Number(latitude) >= -90 && Number(latitude) <= 90 &&
        Number(longitude) >= -180 && Number(longitude) <= 180;
}

// Great-circle distance in kilometres; this is not road or travel distance.
function distanceKm(a, b) {
    const radians = degrees => degrees * Math.PI / 180;
    const dLat = radians(Number(b.latitude) - a.latitude);
    const dLon = radians(Number(b.longitude) - a.longitude);
    const h = Math.sin(dLat / 2) ** 2 +
        Math.cos(radians(a.latitude)) * Math.cos(radians(Number(b.latitude))) * Math.sin(dLon / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))));
}
function formatDistance(distance) {
    return distance < 1 ? Math.round(distance * 1000) + " m away" : distance.toFixed(1) + " km away";
}
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}
nearMeButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        nearMeStatus.textContent = "Location is not supported by this browser. You can still search by LGA or category.";
        return;
    }
    const request = ++locationRequest;
    nearMeButton.disabled = true;
    nearMeButton.textContent = "Finding you...";
    clearNearMe.hidden = false;
    nearMeStatus.textContent = "Allow location access to find businesses closest to you.";
    navigator.geolocation.getCurrentPosition(position => {
        if (request !== locationRequest) return;
        nearMeButton.disabled = false;
        nearMeButton.textContent = "Update my location";
        if (!validCoordinates(position.coords.latitude, position.coords.longitude)) {
            nearMeStatus.textContent = "Your location could not be read. Try again.";
            return;
        }
        userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
        };
        applyFilters();
    }, error => {
        if (request !== locationRequest) return;
        nearMeButton.disabled = false;
        nearMeButton.textContent = userLocation ? "Update my location" : "Near Me";
        clearNearMe.hidden = !userLocation;
        nearMeStatus.textContent = error.code === 1
            ? "Location permission denied. Allow location in your browser settings and try again, or search by LGA."
            : "Could not find your location. Try again, or search by LGA.";
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
});
clearNearMe.addEventListener("click", () => {
    locationRequest++;
    userLocation = null;
    nearMeButton.disabled = false;
    nearMeButton.textContent = "Near Me";
    clearNearMe.hidden = true;
    nearMeStatus.textContent = "Location cleared. Showing businesses in their usual order.";
    applyFilters();
});
const urlParams = new URLSearchParams(window.location.search);
const initialSearch = urlParams.get("search");

if (initialSearch) {
    search.value = initialSearch;
}

// Load businesses from Neon
async function loadBusinesses() {
    grid.innerHTML = "<p>Loading businesses...</p>";

    try {
        const response = await fetch(API_URL);
        const result = await response.json();

        if (!response.ok || !Array.isArray(result.data)) throw new Error("Business directory could not load");
        businesses = result.data;
        dataLoaded = true;
        applyFilters();

    } catch (error) {
        console.error(error);

        grid.innerHTML = `
            <p style="color:red;">
                Unable to connect to the API.
            </p>
        `;
    }
}

// Render business cards
function renderBusinesses(list) {

    if (list.length === 0) {
        grid.innerHTML = "<p>No businesses found.</p>";
        return;
    }

    grid.innerHTML = list.map(b => `
        <div class="business-card" onclick="openBusiness(${Number(b.id)})">

            <img
                src="${escapeHTML(b.image_url || 'images/placeholder.jpg')}"
                alt="${escapeHTML(b.name)}"
                onerror="this.src='images/placeholder.jpg'"
            >

            <div class="content">

                <span class="badge">${escapeHTML(b.category)}</span>

                <h3>
                    ${escapeHTML(b.name)}
                    ${b.verified ? "✅" : ""}
                </h3>

                <p class="desc">
                    ${escapeHTML(b.description || "")}
                </p>

                <p class="location">
                    📍 ${escapeHTML(b.address || b.lga)}
                </p>

                ${userLocation ? '<p class="distance">' + (b.distance_km === null ? "Distance unavailable" : formatDistance(b.distance_km)) + '</p>' : ""}

                <div class="actions">

                    <a
                        href="tel:${escapeHTML(b.phone || "")}"
                        class="call"
                        onclick="event.stopPropagation()"
                    >
                        Call
                    </a>

                    <a
                        href="https://wa.me/${formatPhone(b.whatsapp)}"
                        target="_blank"
                        class="whatsapp"
                        onclick="event.stopPropagation()"
                    >
                        WhatsApp
                    </a>

                </div>

            </div>

        </div>
    `).join("");
}

// Search & Filters
function applyFilters() {

    if (!dataLoaded) return;
    const term = search.value.toLowerCase().trim();

    const filtered = businesses.filter(b => {

        const matchesSearch =
            (b.name || "").toLowerCase().includes(term) ||
            (b.description || "").toLowerCase().includes(term);

        const matchesLGA =
            lga.value === "" || b.lga === lga.value;

        const matchesCategory =
            category.value === "" || b.category === category.value;

        return matchesSearch &&
               matchesLGA &&
               matchesCategory;
    });

    if (userLocation) {
        const ranked = filtered.map(b => ({
            ...b,
            distance_km: validCoordinates(b.latitude, b.longitude) ? distanceKm(userLocation, b) : null
        })).sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity));
        const known = ranked.filter(b => b.distance_km !== null).length;
        nearMeStatus.textContent = "Closest first within your current filters: " + known + " of " + ranked.length +
            " businesses have a usable location. Approximate straight-line distances" +
            (Number.isFinite(userLocation.accuracy) ? "; your location accuracy is about " + Math.round(userLocation.accuracy) + " m." : ".") +
            " Businesses without coordinates appear last.";
        renderBusinesses(ranked);
    } else {
        renderBusinesses(filtered);
    }
}

// Open Business Details Page
function openBusiness(id) {
    window.location.href = `business.html?id=${id}`;
}

// Convert Nigerian number to WhatsApp format
function formatPhone(number) {

    if (!number) return "";

    number = number.replace(/\D/g, "");

    if (number.startsWith("0")) {
        return "234" + number.substring(1);
    }

    return number;
}

// Event listeners
search.addEventListener("input", applyFilters);
lga.addEventListener("change", applyFilters);
category.addEventListener("change", applyFilters);

loadBusinesses().then(() => {
    if (initialSearch) {
        applyFilters();
    }
});
