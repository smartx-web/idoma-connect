const API_URL = "http://localhost:8080/api/v1/businesses";

const loading = document.getElementById("loading");
const businessCard = document.getElementById("business");

// Read ?id= from URL
const params = new URLSearchParams(window.location.search);
const businessId = params.get("id");


// Load one business
async function loadBusiness() {

    if (!businessId) {
        loading.innerHTML = "Business not found.";
        return;
    }

    try {

        const response = await fetch(`${API_URL}/${businessId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error("Business not found");
        }

        const b = result.data;


        // -----------------------------
        // Business Image
        // -----------------------------

        const image =
            document.getElementById("businessImage");

        image.src =
            b.image_url || "images/placeholder.jpg";

        image.alt = b.name;

        image.onerror = function () {
            this.src = "images/placeholder.jpg";
        };


        // -----------------------------
        // Business Information
        // -----------------------------

        document.getElementById("category").textContent =
            b.category || "Business";

        document.getElementById("name").textContent =
            b.name || "Unnamed Business";

        document.getElementById("description").textContent =
            b.description || "No description available.";

        document.getElementById("address").textContent =
            b.address || "Address not provided";

        document.getElementById("lga").textContent =
            b.lga || "LGA not provided";

        document.getElementById("phone").textContent =
            b.phone || "Phone number not provided";


        // -----------------------------
        // Verification
        // -----------------------------

        const verified =
            document.getElementById("verified");

        if (b.verified) {

            verified.textContent =
                "✓ Verified Business";

            verified.style.color = "#0a8f38";

        } else {

            verified.textContent =
                "Pending Verification";

            verified.style.color = "#777";
        }


        // -----------------------------
        // Call Button
        // -----------------------------

        const callBtn =
            document.getElementById("callBtn");

        if (b.phone) {

            callBtn.href =
                `tel:${b.phone}`;

        } else {

            callBtn.removeAttribute("href");
            callBtn.style.opacity = "0.5";
        }


        // -----------------------------
        // WhatsApp Button
        // -----------------------------

        const whatsappBtn =
            document.getElementById("whatsappBtn");

        if (b.whatsapp) {

            whatsappBtn.href =
                `https://wa.me/${formatPhone(b.whatsapp)}`;

        } else {

            whatsappBtn.removeAttribute("href");
            whatsappBtn.style.opacity = "0.5";
        }


        // -----------------------------
        // Location
        // -----------------------------

        const locationText =
            document.getElementById("locationText");

        const mapBtn =
            document.getElementById("mapBtn");


        if (
            b.latitude !== null &&
            b.longitude !== null &&
            b.latitude !== undefined &&
            b.longitude !== undefined
        ) {

            // Display coordinates
            locationText.textContent =
                `${b.address || b.lga} (${b.latitude}, ${b.longitude})`;


            // Google Maps link
            mapBtn.href =
                `https://www.google.com/maps?q=${b.latitude},${b.longitude}`;


            // -----------------------------
            // Initialize Leaflet Map
            // -----------------------------

            const map = L.map("map").setView(
                [b.latitude, b.longitude],
                15
            );


            // OpenStreetMap tiles
            L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    attribution:
                        '&copy; OpenStreetMap contributors'
                }
            ).addTo(map);


            // Business marker
            L.marker([
                b.latitude,
                b.longitude
            ])
            .addTo(map)
            .bindPopup(`
                <strong>${b.name}</strong><br>
                ${b.address || b.lga}
            `)
            .openPopup();


        } else {

            locationText.textContent =
                "Location coordinates not available.";

            mapBtn.style.display = "none";

            document.getElementById("map").style.display =
                "none";
        }


        // -----------------------------
        // Show Business
        // -----------------------------

        loading.style.display = "none";

        businessCard.style.display = "block";


    } catch (error) {

        console.error(
            "Error loading business:",
            error
        );

        loading.innerHTML = `
            <p style="color:red;">
                Unable to load this business.
            </p>
        `;
    }
}


// -----------------------------
// Format Nigerian Phone Number
// -----------------------------

function formatPhone(number) {

    if (!number) {
        return "";
    }

    number =
        number.replace(/\D/g, "");


    if (number.startsWith("0")) {

        return "234" +
            number.substring(1);
    }


    return number;
}


// Start application
loadBusiness();
