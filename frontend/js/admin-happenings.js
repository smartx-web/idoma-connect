const API_BASE_URL = "http://localhost:8080/api/v1";

const CLOUDINARY_URL =
    "https://api.cloudinary.com/v1_1/gvmcwi4b/image/upload";

const CLOUDINARY_PRESET =
    "idoma_connect_upload";


/* =========================
   ELEMENTS
========================= */

const form =
    document.getElementById("happeningForm");

const titleInput =
    document.getElementById("title");

const descriptionInput =
    document.getElementById("description");

const locationInput =
    document.getElementById("location");

const categoryInput =
    document.getElementById("category");

const eventDateInput =
    document.getElementById("eventDate");

const imageInput =
    document.getElementById("image");

const publishedInput =
    document.getElementById("published");

const message =
    document.getElementById("message");

const happeningsList =
    document.getElementById("happeningsList");


/* =========================
   AUTHENTICATION
========================= */

function getAdminToken() {

    return localStorage.getItem(
        "admin_token"
    );
}


function getAuthHeaders() {

    const token =
        getAdminToken();

    if (!token) {

        window.location.href =
            "login.html";

        return null;
    }

    return {
        "Authorization":
            `Bearer ${token}`
    };
}


function getJsonAuthHeaders() {

    const token =
        getAdminToken();

    if (!token) {

        window.location.href =
            "login.html";

        return null;
    }

    return {
        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${token}`
    };
}


/* =========================
   MESSAGE
========================= */

function showMessage(
    text,
    type = "success"
) {

    if (!message) {
        return;
    }

    message.textContent =
        text;

    message.className =
        `message ${type}`;
}


/* =========================
   CLOUDINARY IMAGE UPLOAD
========================= */

async function uploadImage(file) {

    if (!file) {
        return "";
    }

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    formData.append(
        "upload_preset",
        CLOUDINARY_PRESET
    );

    const response =
        await fetch(
            CLOUDINARY_URL,
            {
                method: "POST",
                body: formData
            }
        );

    const result =
        await response.json();

    if (!response.ok) {

        throw new Error(
            result.error?.message ||
            "Image upload failed"
        );
    }

    return result.secure_url;
}


/* =========================
   CREATE HAPPENING
========================= */

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const headers =
            getJsonAuthHeaders();

        if (!headers) {
            return;
        }

        try {

            showMessage(
                "Saving happening...",
                "success"
            );


            /* =========================
               UPLOAD IMAGE
            ========================= */

            let imageUrl = "";

            if (
                imageInput &&
                imageInput.files &&
                imageInput.files.length > 0
            ) {

                showMessage(
                    "Uploading image...",
                    "success"
                );

                imageUrl =
                    await uploadImage(
                        imageInput.files[0]
                    );
            }


            /* =========================
               BUILD HAPPENING
            ========================= */

            const happening = {

                title:
                    titleInput.value.trim(),

                description:
                    descriptionInput.value.trim(),

                image_url:
                    imageUrl,

                location:
                    locationInput.value.trim(),

                event_date:
                    eventDateInput.value
                        ? new Date(
                            eventDateInput.value
                        ).toISOString()
                        : null,

                category:
                    categoryInput.value.trim(),

                published:
                    publishedInput
                        ? publishedInput.checked
                        : false
            };


            /* =========================
               VALIDATION
            ========================= */

            if (!happening.title) {

                throw new Error(
                    "Title is required."
                );
            }

            if (!happening.description) {

                throw new Error(
                    "Description is required."
                );
            }

            if (!happening.category) {

                throw new Error(
                    "Category is required."
                );
            }


            /* =========================
               CREATE
            ========================= */

            const response =
                await fetch(
                    `${API_BASE_URL}/admin/happenings`,
                    {
                        method: "POST",

                        headers: headers,

                        body:
                            JSON.stringify(
                                happening
                            )
                    }
                );


            const responseText =
                await response.text();

            let result = {};

            try {

                result =
                    responseText
                        ? JSON.parse(
                            responseText
                        )
                        : {};

            } catch (error) {

                console.error(
                    "Invalid JSON response:",
                    responseText
                );

                throw new Error(
                    `Server returned an invalid response (${response.status}).`
                );
            }


            /* =========================
               HANDLE ERRORS
            ========================= */

            if (!response.ok) {

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    localStorage.removeItem(
                        "admin_token"
                    );

                    window.location.href =
                        "login.html";

                    return;
                }

                throw new Error(
                    result.message ||
                    `Unable to create happening (${response.status}).`
                );
            }


            /* =========================
               SUCCESS
            ========================= */

            showMessage(
                result.message ||
                "Happening created successfully.",
                "success"
            );


            form.reset();


            /*
             * Reload the existing happenings
             * so the new item appears immediately.
             */

            await loadExistingHappenings();

        } catch (error) {

            console.error(
                "Create happening error:",
                error
            );

            showMessage(
                error.message ||
                "Unable to create happening.",
                "error"
            );
        }
    }
);


/* =========================
   LOAD EXISTING HAPPENINGS
========================= */

async function loadExistingHappenings() {

    if (!happeningsList) {
        return;
    }

    const headers =
        getAuthHeaders();

    if (!headers) {
        return;
    }


    happeningsList.innerHTML =
        `
        <p class="loading-text">
            Loading happenings...
        </p>
        `;


    try {

        /*
         * The public endpoint returns
         * published happenings only.
         *
         * Admin currently needs to see
         * both published and unpublished
         * records, so we request the
         * public list first and render
         * what the API provides.
         */

        const response =
            await fetch(
                `${API_BASE_URL}/happenings`,
                {
                    method: "GET"
                }
            );


        const responseText =
            await response.text();

        let result = {};

        try {

            result =
                responseText
                    ? JSON.parse(
                        responseText
                    )
                    : {};

        } catch (error) {

            throw new Error(
                "Invalid response from happenings API."
            );
        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                `Unable to load happenings (${response.status}).`
            );
        }


        const happenings =
            Array.isArray(result.data)
                ? result.data
                : [];


        if (
            happenings.length === 0
        ) {

            happeningsList.innerHTML =
                `
                <p class="empty-text">
                    No published happenings found.
                </p>
                `;

            return;
        }


        happeningsList.innerHTML =
            happenings
                .map(
                    renderHappening
                )
                .join("");


    } catch (error) {

        console.error(
            "Load happenings error:",
            error
        );

        happeningsList.innerHTML =
            `
            <p class="error-text">
                Unable to load happenings.
            </p>
            `;
    }
}


/* =========================
   RENDER HAPPENING
========================= */

function renderHappening(item) {

    const image =
        item.image_url
            ? item.image_url
            : "";


    const eventDate =
        formatDate(
            item.event_date
        );


    return `
        <article class="admin-happening">

            ${
                image
                    ? `
                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(
                                item.title
                            )}"
                            class="admin-happening-image"
                        >
                    `
                    : `
                        <div class="admin-happening-placeholder">
                            No image
                        </div>
                    `
            }


            <div class="admin-happening-content">

                <div class="admin-happening-header">

                    <h3>
                        ${escapeHTML(
                            item.title
                        )}
                    </h3>

                    <span
                        class="happening-status ${
                            item.published
                                ? "published"
                                : "unpublished"
                        }"
                    >
                        ${
                            item.published
                                ? "Published"
                                : "Unpublished"
                        }
                    </span>

                </div>


                <p>
                    ${escapeHTML(
                        item.description
                    )}
                </p>


                ${
                    item.category
                        ? `
                            <div>
                                <strong>
                                    Category:
                                </strong>

                                ${escapeHTML(
                                    item.category
                                )}
                            </div>
                        `
                        : ""
                }


                ${
                    item.location
                        ? `
                            <div>
                                <strong>
                                    Location:
                                </strong>

                                ${escapeHTML(
                                    item.location
                                )}
                            </div>
                        `
                        : ""
                }


                ${
                    eventDate
                        ? `
                            <div>
                                <strong>
                                    Event date:
                                </strong>

                                ${escapeHTML(
                                    eventDate
                                )}
                            </div>
                        `
                        : ""
                }

            </div>

        </article>
    `;
}


/* =========================
   DATE FORMATTER
========================= */

function formatDate(
    dateValue
) {

    if (!dateValue) {
        return "";
    }


    const date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

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


/* =========================
   HTML ESCAPE
========================= */

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


/* =========================
   START
========================= */

loadExistingHappenings();
