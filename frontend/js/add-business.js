const API_URL = "http://localhost:8080/api/v1/businesses";

const CLOUD_NAME = "gvmcwi4b";
const UPLOAD_PRESET = "idoma_connect_upload";

const form = document.getElementById("businessForm");
const message = document.getElementById("message");

const imageInput = document.getElementById("image");
const preview = document.getElementById("preview");


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
                7.1905,

            longitude:
                8.1347,

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
