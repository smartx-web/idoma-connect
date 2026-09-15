const API_URL = "http://localhost:8080/api/v1/businesses";

const grid = document.querySelector(".business-grid");
const search = document.getElementById("searchInput");
const lga = document.getElementById("lgaFilter");
const category = document.getElementById("categoryFilter");

let businesses = [];

async function loadBusinesses() {
    grid.innerHTML = "<p>Loading businesses...</p>";

    try {
        const response = await fetch(API_URL);
        const result = await response.json();

        businesses = result.data || [];
        renderBusinesses(businesses);

    } catch (error) {
        console.error(error);

        grid.innerHTML = `
            <p style="color:red;">
                Unable to connect to the API.
            </p>
        `;
    }
}

function renderBusinesses(list) {
    if (list.length === 0) {
        grid.innerHTML = "<p>No businesses found.</p>";
        return;
    }

    grid.innerHTML = list.map(b => `
        <div class="business-card">

            <img
                src="${b.image_url || 'images/placeholder.jpg'}"
                alt="${b.name}"
                onerror="this.src='images/placeholder.jpg'"
            >

            <div class="content">

                <span class="badge">${b.category}</span>

                <h3>
                    ${b.name}
                    ${b.verified ? "✅" : ""}
                </h3>

                <p class="desc">${b.description || ""}</p>

                <p class="location">
                    📍 ${b.address || b.lga}
                </p>

                <div class="actions">

                    <a href="tel:${b.phone || ""}" class="call">
                        Call
                    </a>

                    <a
                        href="https://wa.me/${formatPhone(b.whatsapp)}"
                        target="_blank"
                        class="whatsapp"
                    >
                        WhatsApp
                    </a>

                </div>

            </div>

        </div>
    `).join("");
}

function applyFilters() {
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

    renderBusinesses(filtered);
}

function formatPhone(number) {
    if (!number) return "";

    number = number.replace(/\D/g, "");

    if (number.startsWith("0")) {
        return "234" + number.substring(1);
    }

    return number;
}

search.addEventListener("input", applyFilters);
lga.addEventListener("change", applyFilters);
category.addEventListener("change", applyFilters);

loadBusinesses();
