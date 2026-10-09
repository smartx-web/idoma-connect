const API_URL = "https://idoma-connect-api.onrender.com/api/v1/businesses";

const CLOUD_NAME = "gvmcwi4b";
const UPLOAD_PRESET = "idoma_connect_upload";

const form = document.getElementById("businessForm");
const message = document.getElementById("message");

const imageInput = document.getElementById("image");
const preview = document.getElementById("preview");



const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");
const locationStatus = document.getElementById("locationStatus");
const locationButton = document.getElementById("useCurrentLocation");
let locationMap;
let locationMarker;
let locationRequest = 0;

function readCoordinates() {
    if (latitudeInput.value.trim() === "" || longitudeInput.value.trim() === "") {
        throw new Error("Select your business location on the map or enter both coordinates.");
    }
    const latitude = Number(latitudeInput.value);
    const longitude = Number(longitudeInput.value);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
        latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw new Error("Enter valid latitude (-90 to 90) and longitude (-180 to 180).");
    }
    return { latitude, longitude };
}

function syncLocationMarker(latitude, longitude) {
    if (!locationMap) return;
    if (locationMarker) {
        locationMarker.setLatLng([latitude, longitude]);
    } else {
        locationMarker = L.marker([latitude, longitude], { draggable: true, autoPan: true }).addTo(locationMap);
        locationMarker.on("dragend", () => {
            const point = locationMarker.getLatLng();
            selectLocation(point.lat, point.lng);
        });
    }
}

function selectLocation(latitude, longitude, note = "Location selected. Check that the pin is at your business.") {
    latitudeInput.value = latitude.toFixed(6);
    longitudeInput.value = longitude.toFixed(6);
    syncLocationMarker(latitude, longitude);
    locationStatus.textContent = note;
}

function cancelLocationRequest() {
    locationRequest++;
    locationButton.disabled = false;
    locationButton.textContent = "Use my current location";
}

if (typeof L !== "undefined") {
    locationMap = L.map("locationMap", { scrollWheelZoom: false }).setView([7.1905, 8.1347], 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(locationMap);
    locationMap.on("click", (event) => {
        cancelLocationRequest();
        selectLocation(event.latlng.lat, event.latlng.wrap().lng);
    });
} else {
    document.getElementById("locationMap").style.display = "none";
    locationStatus.textContent = "Map could not load. Use your current location or enter coordinates manually.";
}

[latitudeInput, longitudeInput].forEach(input => input.addEventListener("input", () => {
    cancelLocationRequest();
    try {
        const point = readCoordinates();
        syncLocationMarker(point.latitude, point.longitude);
        if (locationMap) locationMap.setView([point.latitude, point.longitude], 16);
        locationStatus.textContent = "Coordinates updated. Check the business location before submitting.";
    } catch (error) {
        if (locationMarker) { locationMarker.remove(); locationMarker = null; }
        locationStatus.textContent = error.message;
    }
}));

locationButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
        locationStatus.textContent = "Your browser does not support location. Tap the map or enter coordinates.";
        return;
    }
    const request = ++locationRequest;
    locationButton.disabled = true;
    locationButton.textContent = "Finding your location...";
    locationStatus.textContent = "Allow location access when your browser asks.";
    navigator.geolocation.getCurrentPosition(position => {
        if (request !== locationRequest) return;
        cancelLocationRequest();
        selectLocation(position.coords.latitude, position.coords.longitude,
            "Current location selected (accuracy about " + Math.round(position.coords.accuracy) +
            " metres). Drag the pin if needed to mark the business entrance.");
        if (locationMap) locationMap.setView([position.coords.latitude, position.coords.longitude], 17);
    }, error => {
        if (request !== locationRequest) return;
        cancelLocationRequest();
        locationStatus.textContent = error.code === 1
            ? "Location permission denied. Tap the map or enter coordinates instead."
            : "Could not find your location. Try again, tap the map, or enter coordinates.";
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
});

// ==========================================
// PREVIEW SELECTED IMAGE
// ==========================================

imageInput.addEventListener("change", function () {

    const file = imageInput.files[0];

    if (!file) {
        preview.style.display = "none";
        preview.src = "";
        return;
    }

    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
});


// ==========================================
// UPLOAD IMAGE TO CLOUDINARY
// ==========================================

async function uploadImage(file) {

    if (!file) {
        return "";
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const cloudinaryURL =
        "https://api.cloudinary.com/v1_1/" +
        CLOUD_NAME +
        "/image/upload";

    const response = await fetch(
        cloudinaryURL,
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    if (!response.ok) {

        console.error(
            "Cloudinary error:",
            data
        );

        throw new Error(
            data.error?.message ||
            "Image upload failed"
        );
    }

    return data.secure_url;
}


// ==========================================
// SUBMIT BUSINESS
// ==========================================

form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const submitBtn =
        document.querySelector(".submit-btn");

    submitBtn.disabled = true;

    submitBtn.textContent =
        "Uploading image...";

    message.textContent = "";
    message.style.color = "";


    try {

        const coordinates = readCoordinates();

        // Get selected image
        const file =
            imageInput.files[0];


        // Upload image to Cloudinary
        const uploadedImage =
            await uploadImage(file);


        // ======================================
        // CREATE BUSINESS DATA
        // ======================================

        const business = {

            name:
                document.getElementById("name")
                    .value
                    .trim(),

            description:
                document.getElementById("description")
                    .value
                    .trim(),

            category:
                document.getElementById("category")
                    .value,

            lga:
                document.getElementById("lga")
                    .value,

            address:
                document.getElementById("address")
                    .value
                    .trim(),

            phone:
                document.getElementById("phone")
                    .value
                    .trim(),

            whatsapp:
                document.getElementById("whatsapp")
                    .value
                    .trim(),

            image_url:
                uploadedImage,

            video_url:
                "",

            latitude:
                coordinates.latitude,

            longitude:
                coordinates.longitude,

            verified:
                false
        };


        // ======================================
        // SEND BUSINESS TO GO API
        // ======================================

        submitBtn.textContent =
            "Submitting business...";


        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(business)
                }
            );


        const result =
            await response.json();


        // ======================================
        // CHECK API RESPONSE
        // ======================================

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to submit business"
            );
        }


        // ======================================
        // SUCCESS
        // ======================================

        message.style.color =
            "green";

        message.textContent =
            "Business submitted successfully! Redirecting...";


        form.reset();
        cancelLocationRequest();
        if (locationMarker) { locationMarker.remove(); locationMarker = null; }
        locationStatus.textContent = "No location selected.";

        preview.style.display =
            "none";

        preview.src =
            "";


        // Redirect to directory
        setTimeout(function () {

            window.location.href =
                "businesses.html";

        }, 1800);


    } catch (error) {

        console.error(
            "Submission error:",
            error
        );

        message.style.color =
            "red";

        message.textContent =
            error.message ||
            "Unable to complete submission.";

    } finally {

        submitBtn.disabled =
            false;

        submitBtn.textContent =
            "Submit Business";
    }

});
