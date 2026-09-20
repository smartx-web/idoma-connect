const API_BASE_URL = "http://localhost:8080/api/v1";

const premiumForm = document.getElementById("premiumForm");
const businessId = document.getElementById("businessId");
const title = document.getElementById("title");
const description = document.getElementById("description");
const image = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");
const active = document.getElementById("active");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("message");
const listingList = document.getElementById("listingList");

const CLOUDINARY_UPLOAD_URL =
    "https://api.cloudinary.com/v1_1/gvmcwi4b/image/upload";

const CLOUDINARY_UPLOAD_PRESET =
    "idoma_connect_upload";


/* =========================
   LOAD APPROVED BUSINESSES
========================= */

async function loadApprovedBusinesses() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/businesses/approved`
        );

        if (!response.ok) {
            throw new Error("Failed to load approved businesses");
        }

        const result = await response.json();

        businessId.innerHTML = `
            <option value="">Select a business</option>
        `;

        result.data.forEach((business) => {
            const option = document.createElement("option");

            option.value = business.id;

            option.textContent =
                `${business.name} — ${business.lga}`;

            businessId.appendChild(option);
        });

    } catch (error) {
        console.error(error);

        businessId.innerHTML = `
            <option value="">
                Unable to load businesses
            </option>
        `;
    }
}


/* =========================
   IMAGE PREVIEW
========================= */

image.addEventListener("change", () => {
    const file = image.files[0];

    if (!file) {
        imagePreview.innerHTML =
            "No image selected";

        return;
    }

    const imageURL =
        URL.createObjectURL(file);

    imagePreview.innerHTML = `
        <img
            src="${imageURL}"
            alt="Premium listing preview"
        >
    `;
});


/* =========================
   UPLOAD IMAGE TO CLOUDINARY
========================= */

async function uploadImage(file) {
    const formData = new FormData();

    formData.append("file", file);

    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );

    const response = await fetch(
        CLOUDINARY_UPLOAD_URL,
        {
            method: "POST",
            body: formData
        }
    );

    if (!response.ok) {
        throw new Error(
            "Image upload failed"
        );
    }

    const result =
        await response.json();

    return result.secure_url;
}


/* =========================
   LOAD EXISTING LISTINGS
========================= */

async function loadPremiumListings() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/premium`
        );

        if (!response.ok) {
            throw new Error(
                "Failed to load premium listings"
            );
        }

        const result =
            await response.json();

        if (
            !result.data ||
            result.data.length === 0
        ) {
            listingList.innerHTML = `
                <div class="empty-state">
                    No premium listings yet.
                </div>
            `;

            return;
        }

        listingList.innerHTML = "";

        result.data.forEach((listing) => {

            const item =
                document.createElement("div");

            item.className =
                "listing-item";


            /* =========================
               IMAGE
            ========================= */

            const imageHTML =
                listing.image_url
                    ? `
                        <img
                            src="${listing.image_url}"
                            alt="${
                                listing.business_name ||
                                listing.title
                            }"
                        >
                    `
                    : "";


            /* =========================
               STATUS
            ========================= */

            const statusClass =
                listing.active
                    ? "active"
                    : "inactive";

            const statusText =
                listing.active
                    ? "Active"
                    : "Inactive";


            /* =========================
               BUTTON
            ========================= */

            const actionText =
                listing.active
                    ? "Deactivate"
                    : "Activate";

            const nextStatus =
                !listing.active;


            /* =========================
               LISTING CARD
            ========================= */

            item.innerHTML = `
                <div class="listing-image">
                    ${imageHTML}
                </div>

                <div class="listing-info">

                    <h3>
                        ${listing.title}
                    </h3>

                    <span
                        class="status ${statusClass}"
                    >
                        ${statusText}
                    </span>

                    <h4>
                        ${
                            listing.business_name ||
                            "Business"
                        }
                    </h4>

                    <p>
                        ${
                            listing.description ||
                            "No description"
                        }
                    </p>

                    <p>
                        <strong>
                            Category:
                        </strong>

                        ${
                            listing.category ||
                            "N/A"
                        }
                    </p>

                    <p>
                        <strong>
                            LGA:
                        </strong>

                        ${
                            listing.lga ||
                            "N/A"
                        }
                    </p>

                    <button
                        type="button"
                        class="status-button"
                        data-id="${listing.id}"
                        data-active="${nextStatus}"
                    >
                        ${actionText}
                    </button>

                </div>
            `;

            listingList.appendChild(item);
        });


        /* Attach button events */

        attachStatusButtons();

    } catch (error) {

        console.error(error);

        listingList.innerHTML = `
            <div class="empty-state">
                Unable to load premium listings.
            </div>
        `;
    }
}


/* =========================
   PREMIUM STATUS BUTTONS
========================= */

function attachStatusButtons() {

    const buttons =
        document.querySelectorAll(
            ".status-button"
        );

    buttons.forEach((button) => {

        button.addEventListener(
            "click",
            async () => {

                const id =
                    button.dataset.id;

                const newActiveStatus =
                    button.dataset.active === "true";


                /* Disable button */

                button.disabled = true;

                button.textContent =
                    "Updating...";


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/admin/premium/${id}/status`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    active:
                                        newActiveStatus
                                })
                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok) {
                        throw new Error(
                            result.message ||
                            "Failed to update premium listing"
                        );
                    }


                    /* Refresh listings */

                    await loadPremiumListings();

                } catch (error) {

                    console.error(error);

                    showMessage(
                        error.message ||
                        "Unable to update premium listing.",
                        "error"
                    );

                    button.disabled =
                        false;

                    button.textContent =
                        newActiveStatus
                            ? "Activate"
                            : "Deactivate";
                }
            }
        );
    });
}


/* =========================
   SHOW MESSAGE
========================= */

function showMessage(
    text,
    type
) {
    message.textContent =
        text;

    message.className =
        `message ${type}`;
}


/* =========================
   CREATE PREMIUM LISTING
========================= */

premiumForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        /* Disable submit */

        submitBtn.disabled =
            true;

        submitBtn.textContent =
            "Creating...";

        message.className =
            "message";

        message.textContent =
            "";


        try {

            let imageURL = "";


            /* =========================
               UPLOAD IMAGE
            ========================= */

            if (image.files[0]) {

                imageURL =
                    await uploadImage(
                        image.files[0]
                    );
            }


            /* =========================
               CONVERT DATES
            ========================= */

            const startDateValue =
                startDate.value
                    ? new Date(
                        startDate.value
                    ).toISOString()
                    : null;

            const endDateValue =
                endDate.value
                    ? new Date(
                        endDate.value
                    ).toISOString()
                    : null;


            /* =========================
               BUILD REQUEST
            ========================= */

            const listingData = {

                business_id:
                    Number(
                        businessId.value
                    ),

                title:
                    title.value.trim(),

                description:
                    description.value.trim(),

                image_url:
                    imageURL,

                start_date:
                    startDateValue,

                end_date:
                    endDateValue,

                active:
                    active.checked
            };


            /* =========================
               SEND REQUEST
            ========================= */

            const response =
                await fetch(
                    `${API_BASE_URL}/admin/premium`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                listingData
                            )
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Failed to create premium listing"
                );
            }


            /* =========================
               SUCCESS
            ========================= */

            showMessage(
                "Premium listing created successfully!",
                "success"
            );


            premiumForm.reset();

            active.checked =
                true;

            imagePreview.innerHTML =
                "No image selected";


            /* Refresh listings */

            await loadPremiumListings();

        } catch (error) {

            console.error(error);

            showMessage(
                error.message ||
                "Something went wrong.",
                "error"
            );

        } finally {

            submitBtn.disabled =
                false;

            submitBtn.textContent =
                "Create Premium Listing";
        }
    }
);


/* =========================
   INITIAL LOAD
========================= */

loadApprovedBusinesses();

loadPremiumListings();
