const API_BASE_URL = "http://localhost:8080/api/v1";

const CLOUDINARY_UPLOAD_URL =
    "https://api.cloudinary.com/v1_1/gvmcwi4b/image/upload";

const CLOUDINARY_UPLOAD_PRESET =
    "idoma_connect_upload";


/* =========================
   DOM ELEMENTS
========================= */

const form =
    document.getElementById("happeningForm");

const messageBox =
    document.getElementById("message");

const happeningsList =
    document.getElementById("happeningsList");

const titleInput =
    document.getElementById("title");

const descriptionInput =
    document.getElementById("description");

const categoryInput =
    document.getElementById("category");

const locationInput =
    document.getElementById("location");

const eventDateInput =
    document.getElementById("eventDate");

const imageInput =
    document.getElementById("image");

const publishedInput =
    document.getElementById("published");


/* =========================
   EDIT STATE
========================= */

let editingHappeningId = null;


/* =========================
   AUTH
========================= */

function getAdminToken() {

    return localStorage.getItem(
        "admin_token"
    );
}


function getAuthHeaders() {

    const token =
        getAdminToken();

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}


/* =========================
   MESSAGE
========================= */

function showMessage(
    message,
    type = "success"
) {

    if (!messageBox) {
        return;
    }

    messageBox.textContent =
        message;

    messageBox.className =
        `message ${type}`;
}


/* =========================
   CLOUDINARY UPLOAD
========================= */

async function uploadImage(file) {

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );

    const response =
        await fetch(
            CLOUDINARY_UPLOAD_URL,
            {
                method: "POST",
                body: formData
            }
        );

    const data =
        await response.json();

    if (!response.ok) {

        throw new Error(
            data.error?.message ||
            "Image upload failed"
        );
    }

    return data.secure_url;
}


/* =========================
   CREATE / EDIT SUBMIT
========================= */

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            showMessage("");

            const token =
                getAdminToken();

            if (!token) {

                window.location.href =
                    "login.html";

                return;
            }


            const title =
                titleInput.value.trim();

            const description =
                descriptionInput.value.trim();

            const category =
                categoryInput.value.trim();

            const location =
                locationInput.value.trim();

            const eventDate =
                eventDateInput.value;

            const published =
                publishedInput.checked;


            if (!title) {

                showMessage(
                    "Title is required",
                    "error"
                );

                return;
            }


            if (!description) {

                showMessage(
                    "Description is required",
                    "error"
                );

                return;
            }


            if (!category) {

                showMessage(
                    "Category is required",
                    "error"
                );

                return;
            }


            try {

                /*
                 * ========================
                 * EDIT EXISTING HAPPENING
                 * ========================
                 */

                if (
                    editingHappeningId !== null
                ) {

                    const payload = {

                        title:
                            title,

                        description:
                            description,

                        location:
                            location,

                        event_date:
                            eventDate || null,

                        category:
                            category,

                        published:
                            published
                    };


                    showMessage(
                        "Updating happening..."
                    );


                    const response =
                        await fetch(
                            `${API_BASE_URL}/admin/happenings/${editingHappeningId}`,
                            {
                                method: "PUT",

                                headers:
                                    getAuthHeaders(),

                                body:
                                    JSON.stringify(
                                        payload
                                    )
                            }
                        );


                    const responseText =
                        await response.text();

                    let data = {};

                    try {

                        data =
                            responseText
                                ? JSON.parse(
                                    responseText
                                )
                                : {};

                    } catch (error) {

                        throw new Error(
                            "Invalid server response"
                        );
                    }


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


                    if (!response.ok) {

                        throw new Error(
                            data.error ||
                            data.message ||
                            "Failed to update happening"
                        );
                    }


                    showMessage(
                        data.message ||
                        "Happening updated successfully",
                        "success"
                    );


                    cancelEdit();


                    await loadExistingHappenings();

                    return;
                }


                /*
                 * ========================
                 * CREATE NEW HAPPENING
                 * ========================
                 */

                let imageURL = "";


                if (
                    imageInput.files.length > 0
                ) {

                    showMessage(
                        "Uploading image..."
                    );

                    imageURL =
                        await uploadImage(
                            imageInput.files[0]
                        );
                }


                const payload = {

                    title:
                        title,

                    description:
                        description,

                    image_url:
                        imageURL,

                    location:
                        location,

                    event_date:
                        eventDate || null,

                    category:
                        category,

                    published:
                        published
                };


                showMessage(
                    "Creating happening..."
                );


                const response =
                    await fetch(
                        `${API_BASE_URL}/admin/happenings`,
                        {
                            method: "POST",

                            headers:
                                getAuthHeaders(),

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );


                const responseText =
                    await response.text();

                let data = {};

                try {

                    data =
                        responseText
                            ? JSON.parse(
                                responseText
                            )
                            : {};

                } catch (error) {

                    throw new Error(
                        "Invalid server response"
                    );
                }


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


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        data.message ||
                        "Failed to create happening"
                    );
                }


                showMessage(
                    data.message ||
                    "Happening created successfully",
                    "success"
                );


                form.reset();

                await loadExistingHappenings();

            } catch (error) {

                console.error(
                    "Save happening error:",
                    error
                );

                showMessage(
                    error.message ||
                    "Something went wrong",
                    "error"
                );
            }
        }
    );
}


/* =========================
   START EDIT
========================= */

function startEdit(happening) {

    editingHappeningId =
        happening.id;


    titleInput.value =
        happening.title || "";


    descriptionInput.value =
        happening.description || "";


    categoryInput.value =
        happening.category || "";


    locationInput.value =
        happening.location || "";


    publishedInput.checked =
        happening.published === true;


    if (happening.event_date) {

        const date =
            new Date(
                happening.event_date
            );

        const localDate =
            new Date(
                date.getTime() -
                date.getTimezoneOffset() * 60000
            )
                .toISOString()
                .slice(0, 16);

        eventDateInput.value =
            localDate;

    } else {

        eventDateInput.value =
            "";
    }


    /*
     * Browsers do not allow us
     * to programmatically put an
     * existing image into <input type=file>.
     *
     * Therefore the existing image
     * remains untouched during editing.
     */

    imageInput.value = "";


    updateFormMode();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    showMessage(
        `Editing: ${happening.title}`,
        "success"
    );
}


/* =========================
   CANCEL EDIT
========================= */

function cancelEdit() {

    editingHappeningId =
        null;

    form.reset();

    updateFormMode();

    showMessage("");
}


/* =========================
   FORM MODE
========================= */

function updateFormMode() {

    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    if (!submitButton) {
        return;
    }


    if (
        editingHappeningId !== null
    ) {

        submitButton.textContent =
            "Save Changes";


        let cancelButton =
            document.getElementById(
                "cancelEditButton"
            );


        if (!cancelButton) {

            cancelButton =
                document.createElement(
                    "button"
                );

            cancelButton.type =
                "button";

            cancelButton.id =
                "cancelEditButton";

            cancelButton.textContent =
                "Cancel Edit";

            cancelButton.style.marginLeft =
                "10px";

            cancelButton.addEventListener(
                "click",
                cancelEdit
            );


            submitButton.parentNode.appendChild(
                cancelButton
            );
        }

    } else {

        submitButton.textContent =
            "Create Happening";


        const cancelButton =
            document.getElementById(
                "cancelEditButton"
            );


        if (cancelButton) {

            cancelButton.remove();
        }
    }
}


/* =========================
   UPDATE PUBLISHED STATUS
========================= */

async function updatePublishedStatus(
    id,
    published
) {

    const token =
        getAdminToken();

    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/happenings/${id}/status`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders(),

                    body:
                        JSON.stringify({
                            published:
                                published
                        })
                }
            );


        const responseText =
            await response.text();

        let data = {};

        try {

            data =
                responseText
                    ? JSON.parse(
                        responseText
                    )
                    : {};

        } catch (error) {

            throw new Error(
                "Invalid server response"
            );
        }


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


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "Failed to update status"
            );
        }


        showMessage(
            data.message ||
            "Status updated successfully",
            "success"
        );


        await loadExistingHappenings();

    } catch (error) {

        console.error(
            "Update status error:",
            error
        );

        showMessage(
            error.message ||
            "Failed to update status",
            "error"
        );
    }
}


/* =========================
   LOAD ADMIN HAPPENINGS
========================= */

async function loadExistingHappenings() {

    if (!happeningsList) {
        return;
    }


    const token =
        getAdminToken();

    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    happeningsList.innerHTML =
        "Loading happenings...";


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/happenings`,
                {
                    method: "GET",
                    headers:
                        getAuthHeaders()
                }
            );


        const responseText =
            await response.text();

        let data = {};

        try {

            data =
                responseText
                    ? JSON.parse(
                        responseText
                    )
                    : {};

        } catch (error) {

            throw new Error(
                "Invalid server response"
            );
        }


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


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "Failed to load happenings"
            );
        }


        const happenings =
            Array.isArray(data.data)
                ? data.data
                : [];


        if (
            happenings.length === 0
        ) {

            happeningsList.innerHTML =
                "<p>No happenings found.</p>";

            return;
        }


        happeningsList.innerHTML =
            happenings
                .map(
                    function (item) {

                        const status =
                            item.published
                                ? "Published"
                                : "Unpublished";


                        const statusClass =
                            item.published
                                ? "published"
                                : "unpublished";


                        const buttonText =
                            item.published
                                ? "Unpublish"
                                : "Publish";


                        const nextPublishedState =
                            !item.published;


                        const eventDate =
                            item.event_date
                                ? new Date(
                                    item.event_date
                                ).toLocaleString()
                                : "No date";


                        return `

                            <div
                                class="admin-happening"
                                style="
                                    display:flex;
                                    gap:20px;
                                    align-items:flex-start;
                                    padding:20px 0;
                                    border-bottom:1px solid #ddd;
                                "
                            >

                                ${
                                    item.image_url
                                        ? `
                                            <img
                                                src="${escapeHTML(
                                                    item.image_url
                                                )}"
                                                alt="${escapeHTML(
                                                    item.title
                                                )}"
                                                style="
                                                    width:120px;
                                                    height:80px;
                                                    object-fit:cover;
                                                    border-radius:8px;
                                                "
                                            >
                                          `
                                        : ""
                                }


                                <div
                                    style="
                                        flex:1;
                                    "
                                >

                                    <h3>
                                        ${escapeHTML(
                                            item.title
                                        )}
                                    </h3>


                                    <p>
                                        ${escapeHTML(
                                            item.description
                                        )}
                                    </p>


                                    <p>
                                        <strong>
                                            Category:
                                        </strong>

                                        ${escapeHTML(
                                            item.category
                                        )}
                                    </p>


                                    <p>
                                        <strong>
                                            Location:
                                        </strong>

                                        ${
                                            escapeHTML(
                                                item.location ||
                                                "Not specified"
                                            )
                                        }
                                    </p>


                                    <p>
                                        <strong>
                                            Event date:
                                        </strong>

                                        ${escapeHTML(
                                            eventDate
                                        )}
                                    </p>


                                    <p>
                                        <strong>
                                            Status:
                                        </strong>

                                        <span
                                            class="status ${statusClass}"
                                        >
                                            ${status}
                                        </span>
                                    </p>


                                    <div
                                        style="
                                            margin-top:12px;
                                        "
                                    >

                                        <button
                                            type="button"
                                            onclick='startEdit(${JSON.stringify(item)})'
                                        >
                                            Edit
                                        </button>


                                        <button
                                            type="button"
                                            onclick="updatePublishedStatus(
                                                ${item.id},
                                                ${nextPublishedState}
                                            )"
                                            style="
                                                margin-left:8px;
                                            "
                                        >
                                            ${buttonText}
                                        </button>

                                    </div>

                                </div>

                            </div>

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
            <p class="error">
                ${escapeHTML(
                    error.message ||
                    "Failed to load happenings"
                )}
            </p>
        `;
    }
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
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =========================
   INITIAL LOAD
========================= */

updateFormMode();

loadExistingHappenings();
