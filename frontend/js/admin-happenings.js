const API_BASE_URL = "http://localhost:8080/api/v1";

const CLOUDINARY_UPLOAD_URL =
    "https://api.cloudinary.com/v1_1/gvmcwi4b/image/upload";

const CLOUDINARY_UPLOAD_PRESET = "idoma_connect_upload";

const form = document.getElementById("happeningForm");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const locationInput = document.getElementById("location");
const eventDateInput = document.getElementById("eventDate");
const imageInput = document.getElementById("image");
const publishedInput = document.getElementById("published");
const messageBox = document.getElementById("message");
const happeningsList = document.getElementById("happeningsList");

let editingHappeningId = null;


// ============================================================
// AUTH
// ============================================================

function getToken() {
    return localStorage.getItem("admin_token");
}

function authHeaders() {
    const token = getToken();

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}


// ============================================================
// MESSAGE
// ============================================================

function showMessage(message, type = "success") {
    messageBox.textContent = message;
    messageBox.className = `message ${type}`;
}


// ============================================================
// CLOUDINARY UPLOAD
// ============================================================

async function uploadImage(file) {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData
    });

    if (!response.ok) {
        throw new Error("Image upload failed");
    }

    const data = await response.json();

    return data.secure_url;
}


// ============================================================
// FORM SUBMIT
// ============================================================

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const category = categoryInput.value;
    const location = locationInput.value.trim();
    const eventDate = eventDateInput.value;
    const published = publishedInput.checked;

    if (!title || !description || !category) {
        showMessage(
            "Title, description and category are required.",
            "error"
        );
        return;
    }

    try {
        // ========================================================
        // EDIT EXISTING HAPPENING
        // ========================================================

        if (editingHappeningId !== null) {
            const response = await fetch(
                `${API_BASE_URL}/admin/happenings/${editingHappeningId}`,
                {
                    method: "PUT",
                    headers: authHeaders(),
                    body: JSON.stringify({
                        title: title,
                        description: description,
                        location: location,
                        event_date: eventDate
                            ? new Date(eventDate).toISOString()
                            : null,
                        category: category,
                        published: published
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to update happening"
                );
            }

            showMessage(
                "Happening updated successfully.",
                "success"
            );

            cancelEdit();
            await loadExistingHappenings();

            return;
        }

        // ========================================================
        // CREATE NEW HAPPENING
        // ========================================================

        let imageURL = "";

        if (imageInput.files.length > 0) {
            showMessage("Uploading image...", "success");

            imageURL = await uploadImage(imageInput.files[0]);
        }

        const response = await fetch(
            `${API_BASE_URL}/admin/happenings`,
            {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                    title: title,
                    description: description,
                    image_url: imageURL,
                    location: location,
                    event_date: eventDate
                        ? new Date(eventDate).toISOString()
                        : null,
                    category: category,
                    published: published
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Failed to create happening"
            );
        }

        showMessage(
            "Happening created successfully.",
            "success"
        );

        form.reset();

        await loadExistingHappenings();

    } catch (error) {
        console.error(error);

        showMessage(
            error.message || "Something went wrong.",
            "error"
        );
    }
});


// ============================================================
// EDIT
// ============================================================

function startEdit(happening) {
    editingHappeningId = happening.id;

    titleInput.value = happening.title || "";
    descriptionInput.value = happening.description || "";
    categoryInput.value = happening.category || "";
    locationInput.value = happening.location || "";
    publishedInput.checked = happening.published === true;

    if (happening.event_date) {
        const date = new Date(happening.event_date);

        const localDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000
        );

        eventDateInput.value = localDate
            .toISOString()
            .slice(0, 16);
    } else {
        eventDateInput.value = "";
    }

    imageInput.value = "";

    updateFormMode();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    showMessage(
        "You are editing this happening.",
        "success"
    );
}


function cancelEdit() {
    editingHappeningId = null;

    form.reset();

    updateFormMode();
}


// ============================================================
// FORM MODE
// ============================================================

function updateFormMode() {
    const submitButton = form.querySelector(
        'button[type="submit"]'
    );

    if (editingHappeningId !== null) {
        submitButton.textContent = "Save Changes";

        let cancelButton = document.getElementById(
            "cancelEditButton"
        );

        if (!cancelButton) {
            cancelButton = document.createElement("button");

            cancelButton.type = "button";
            cancelButton.id = "cancelEditButton";
            cancelButton.textContent = "Cancel Edit";
            cancelButton.className = "secondary-button";

            cancelButton.addEventListener(
                "click",
                cancelEdit
            );

            submitButton.insertAdjacentElement(
                "afterend",
                cancelButton
            );
        }

    } else {
        submitButton.textContent = "Create Happening";

        const cancelButton = document.getElementById(
            "cancelEditButton"
        );

        if (cancelButton) {
            cancelButton.remove();
        }
    }
}


// ============================================================
// PUBLISH / UNPUBLISH
// ============================================================

async function updatePublishedStatus(id, published) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/happenings/${id}/status`,
            {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify({
                    published: published
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Failed to update status"
            );
        }

        showMessage(
            published
                ? "Happening published successfully."
                : "Happening unpublished successfully.",
            "success"
        );

        await loadExistingHappenings();

    } catch (error) {
        console.error(error);

        showMessage(
            error.message || "Failed to update status.",
            "error"
        );
    }
}


// ============================================================
// DELETE
// ============================================================

async function deleteHappening(id, title) {
    const confirmed = confirm(
        `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/happenings/${id}`,
            {
                method: "DELETE",
                headers: authHeaders()
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Failed to delete happening"
            );
        }

        showMessage(
            "Happening deleted successfully.",
            "success"
        );

        if (editingHappeningId === id) {
            cancelEdit();
        }

        await loadExistingHappenings();

    } catch (error) {
        console.error(error);

        showMessage(
            error.message || "Failed to delete happening.",
            "error"
        );
    }
}


// ============================================================
// LOAD EXISTING HAPPENINGS
// ============================================================

async function loadExistingHappenings() {
    happeningsList.innerHTML = "Loading happenings...";

    try {
        const response = await fetch(
            `${API_BASE_URL}/admin/happenings`,
            {
                method: "GET",
                headers: authHeaders()
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Failed to load happenings"
            );
        }

        const happenings = Array.isArray(data)
    ? data
    : data.happenings || data.data || [];

if (happenings.length === 0) {
    happeningsList.innerHTML =
        "<p>No happenings found.</p>";
    return;
}

happeningsList.innerHTML = happenings.map((item) => {
            const imageHTML = item.image_url
                ? `
                    <img
                        src="${escapeHTML(item.image_url)}"
                        alt="${escapeHTML(item.title)}"
                        style="
                            width: 160px;
                            height: 100px;
                            object-fit: cover;
                            border-radius: 8px;
                            margin-bottom: 10px;
                        "
                    >
                `
                : "";

            const eventDateHTML = item.event_date
                ? `
                    <p>
                        <strong>Date:</strong>
                        ${formatDate(item.event_date)}
                    </p>
                `
                : "";

            const publishedText = item.published
                ? "Published"
                : "Unpublished";

            const statusButtonText = item.published
                ? "Unpublish"
                : "Publish";

            const nextPublishedStatus = !item.published;

            return `
                <div
                    class="happening-item"
                    style="
                        border: 1px solid #ddd;
                        padding: 15px;
                        margin-bottom: 15px;
                        border-radius: 10px;
                    "
                >

                    ${imageHTML}

                    <h3>
                        ${escapeHTML(item.title)}
                    </h3>

                    <p>
                        ${escapeHTML(item.description)}
                    </p>

                    <p>
                        <strong>Category:</strong>
                        ${escapeHTML(item.category)}
                    </p>

                    <p>
                        <strong>Location:</strong>
                        ${escapeHTML(item.location || "N/A")}
                    </p>

                    ${eventDateHTML}

                    <p>
                        <strong>Status:</strong>
                        ${publishedText}
                    </p>

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
                            ${nextPublishedStatus}
                        )"
                    >
                        ${statusButtonText}
                    </button>

                    <button
                        type="button"
                        onclick='deleteHappening(
                            ${item.id},
                            ${JSON.stringify(item.title)}
                        )'
                    >
                        Delete
                    </button>

                </div>
            `;
        }).join("");

    } catch (error) {
        console.error(error);

        happeningsList.innerHTML = `
            <p style="color: red;">
                ${escapeHTML(
                    error.message ||
                    "Failed to load happenings."
                )}
            </p>
        `;
    }
}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Invalid date";
    }

    return date.toLocaleString();
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// INITIAL LOAD
// ============================================================

updateFormMode();
loadExistingHappenings();
