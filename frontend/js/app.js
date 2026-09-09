const API_BASE_URL = "http://localhost:8080/api/v1";

const businessList = document.getElementById("businessList");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// =========================================
// LOAD BUSINESSES
// =========================================

async function loadBusinesses(searchTerm = "") {

```
if (!businessList) {
    console.error("businessList was not found.");
    return;
}

businessList.innerHTML = `
    <div class="loading">
        Loading businesses...
    </div>
`;

try {

    console.log("Connecting to API...");

    const response = await fetch(
        `${API_BASE_URL}/businesses`
    );

    if (!response.ok) {
        throw new Error(
            `HTTP error: ${response.status}`
        );
    }

    const result = await response.json();

    console.log("API response:", result);

    const businesses = Array.isArray(result.data)
        ? result.data
        : [];

    console.log("Businesses:", businesses);


    // Search filter
    const filteredBusinesses = businesses.filter(
        business => {

            if (!searchTerm) {
                return true;
            }

            const search =
                searchTerm.toLowerCase();

            return (
                (business.name || "")
                    .toLowerCase()
                    .includes(search) ||

                (business.description || "")
                    .toLowerCase()
                    .includes(search) ||

                (business.category || "")
                    .toLowerCase()
                    .includes(search) ||

                (business.lga || "")
                    .toLowerCase()
                    .includes(search)
            );
        }
    );


    if (filteredBusinesses.length === 0) {

        businessList.innerHTML = `
            <div class="loading">
                <h3>No businesses found</h3>
                <p>Try another search.</p>
            </div>
        `;

        return;
    }


    businessList.innerHTML =
        filteredBusinesses
            .map(createBusinessCard)
            .join("");

}

catch (error) {

    console.error(
        "Failed to load businesses:",
        error
    );

    businessList.innerHTML = `
        <div class="loading">

            <h3>Unable to load businesses</h3>

            <p>
                Please make sure the backend
                server is running.
            </p>

            <button
                onclick="loadBusinesses()"
                style="
                    margin-top:15px;
                    padding:12px 20px;
                    background:#d71920;
                    color:white;
                    border:none;
                    border-radius:6px;
                    cursor:pointer;
                "
            >
                Try Again
            </button>

        </div>
    `;
}
```

}

// =========================================
// BUSINESS CARD
// =========================================

function createBusinessCard(business) {

```
const name =
    business.name || "Unnamed Business";

const category =
    business.category || "Local Business";

const description =
    business.description || "";

const lga =
    business.lga || "Idoma Land";

const address =
    business.address || "Address unavailable";

const phone =
    business.phone || "";

const whatsapp =
    business.whatsapp || "";


return `
    <div class="business-card">

        <span class="category">
            ${escapeHTML(category)}
        </span>

        <h3>
            ${escapeHTML(name)}
        </h3>

        <p>
            ${escapeHTML(description)}
        </p>

        <p>
            📍 ${escapeHTML(lga)}
        </p>

        <p>
            ${escapeHTML(address)}
        </p>

        ${
            phone
                ? `
                    <p>
                        📞
                        <a href="tel:${escapeHTML(phone)}">
                            ${escapeHTML(phone)}
                        </a>
                    </p>
                `
                : ""
        }

        ${
            whatsapp
                ? `
                    <p>
                        💬
                        <a
                            href="https://wa.me/${formatWhatsAppNumber(whatsapp)}"
                            target="_blank"
                        >
                            WhatsApp
                        </a>
                    </p>
                `
                : ""
        }

    </div>
`;
```

}

// =========================================
// SEARCH BUTTON
// =========================================

if (searchBtn) {

```
searchBtn.addEventListener(
    "click",
    function () {

        const searchTerm =
            searchInput.value.trim();

        loadBusinesses(searchTerm);

    }
);
```

}

// =========================================
// ENTER KEY SEARCH
// =========================================

if (searchInput) {

```
searchInput.addEventListener(
    "keypress",
    function (event) {

        if (event.key === "Enter") {

            const searchTerm =
                searchInput.value.trim();

            loadBusinesses(searchTerm);
        }
    }
);
```

}

// =========================================
// OPEN SECTIONS
// =========================================

function openSection(section) {

```
if (section === "businesses") {

    document
        .getElementById("businesses")
        .scrollIntoView({
            behavior: "smooth"
        });

}

else if (section === "heritage") {

    document
        .getElementById("heritage")
        .scrollIntoView({
            behavior: "smooth"
        });

}

else if (section === "elder") {

    alert(
        "Ask an Elder is coming soon."
    );

}

else if (section === "sounds") {

    alert(
        "Idoma Sounds is coming soon."
    );

}
```

}

// =========================================
// WHATSAPP NUMBER
// =========================================

function formatWhatsAppNumber(number) {

```
let cleaned =
    String(number).replace(/\D/g, "");

if (
    cleaned.startsWith("0") &&
    cleaned.length === 11
) {

    cleaned =
        "234" +
        cleaned.substring(1);
}

return cleaned;
```

}

// =========================================
// HTML SECURITY
// =========================================

function escapeHTML(value) {

```
return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
```

}

// =========================================
// START APPLICATION
// =========================================

document.addEventListener(
"DOMContentLoaded",
function () {

```
    console.log(
        "IDOMA-CONNECT started."
    );

    loadBusinesses();

}
```

);
