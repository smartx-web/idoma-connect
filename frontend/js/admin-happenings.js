const API_URL =
    "http://localhost:8080/api/v1/happenings";

const CLOUDINARY_URL =
    "https://api.cloudinary.com/v1_1/gvmcwi4b/image/upload";

const CLOUDINARY_PRESET =
    "idoma_connect_upload";

const form =
    document.getElementById("happeningForm");

const message =
    document.getElementById("message");

const happeningsList =
    document.getElementById("happeningsList");

const imageInput =
    document.getElementById("image");


/* =========================
   SHOW MESSAGE
========================= */

function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}


/* =========================
   UPLOAD IMAGE TO CLOUDINARY
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

        const title =
            document
                .getElementById("title")
                .value
                .trim();

        const description =
            document
                .getElementById("description")
                .value
                .trim();

        const category =
            document
                .getElementById("category")
                .value;

        const location =
            document
                .getElementById("location")
                .value
                .trim();

        const eventDate =
            document
                .getElementById("eventDate")
                .value;

        const published =
            document
                .getElementById("published")
                .checked;


        try {

            /*
             * Upload image first
             */

            let imageUrl = "";

            if (imageInput.files.length > 0) {

                showMessage(
                    "Uploading image...",
                    "success"
                );

                imageUrl =
                    await uploadImage(
                        imageInput.files[0]
                    );
            }


            /*
             * Prepare happening
             */

            const happening = {

                title: title,

                description: description,

                image_url: imageUrl,

                location: location || "",

                event_date: eventDate
                    ? new Date(
                        eventDate
                    ).toISOString()
                    : null,

                category: category,

                published: published
            };


            /*
             * Send to backend
             */

            showMessage(
                "Saving happening...",
                "success"
            );


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
                            JSON.stringify(
                                happening
                            )
                    }
                );


            const result =
                await response.json();


            /*
             * Handle API errors
             */

            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Failed to create happening"
                );
            }


            /*
             * Success
             */

            showMessage(
                "Happening created successfully.",
                "success"
            );


            form.reset();


            /*
             * Reload happenings
             */

            loadHappenings();

        } catch (error) {

            console.error(
                "Create happening error:",
                error
            );

            showMessage(
                error.message ||
                "Something went wrong.",
                "error"
            );
        }

    }
);


/* =========================
   LOAD HAPPENINGS
========================= */

async function loadHappenings() {

    try {

        const response =
            await fetch(API_URL);


        if (!response.ok) {

            throw new Error(
                "Failed to load happenings"
            );
        }


        const result =
            await response.json();


        const happenings =
            result.data || [];


        if (happenings.length === 0) {

            happeningsList.innerHTML = `
                <p>
                    No happenings have been added yet.
                </p>
            `;

            return;
        }


        happeningsList.innerHTML =
            happenings
                .map(
                    happening => {

                        const eventDate =
                            happening.event_date
                                ? new Date(
                                    happening.event_date
                                ).toLocaleString()
                                : "No date specified";


                        return `
                            <article
                                class="happening-item"
                            >

                                ${
                                    happening.image_url
                                        ? `
                                            <img
                                                src="${happening.image_url}"
                                                alt="${happening.title}"
                                                style="
                                                    width: 100%;
                                                    max-height: 250px;
                                                    object-fit: cover;
                                                    border-radius: 8px;
                                                    margin-bottom: 15px;
                                                "
                                            >
                                        `
                                        : ""
                                }


                                <h3>
                                    ${happening.title}
                                </h3>


                                <div
                                    class="happening-meta"
                                >
                                    ${happening.category}

                                    ${
                                        happening.location
                                            ? ` • ${happening.location}`
                                            : ""
                                    }
                                </div>


                                <p>
                                    ${happening.description}
                                </p>


                                <p>
                                    <strong>
                                        Event:
                                    </strong>

                                    ${eventDate}
                                </p>


                                ${
                                    happening.published
                                        ? `
                                            <span
                                                class="published-badge"
                                            >
                                                Published
                                            </span>
                                        `
                                        : `
                                            <span
                                                class="draft-badge"
                                            >
                                                Draft
                                            </span>
                                        `
                                }

                            </article>
                        `;
                    }
                )
                .join("");


    } catch (error) {

        console.error(
            "Load happenings error:",
            error
        );

        happeningsList.innerHTML = `
            <p>
                Unable to load happenings.
            </p>
        `;
    }

}


/* =========================
   INITIAL LOAD
========================= */

loadHappenings();
