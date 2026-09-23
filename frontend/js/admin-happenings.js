const API_BASE_URL = "http://localhost:8080/api/v1";

const CLOUDINARY_UPLOAD_URL =
    "https://api.cloudinary.com/v1_1/gvmcwi4b/image/upload";

const CLOUDINARY_UPLOAD_PRESET =
    "idoma_connect_upload";

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


function handleUnauthorized() {
    localStorage.removeItem("admin_token");
    window.location.href = "login.html";
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
        throw new Error("Image upload failed");
    }

    const data = await response.json();

    return data.secure_url;
}


// ============================================================
// FORM SUBMIT
// ============================================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const title =
            titleInput.value.trim();

        const description =
            descriptionInput.value.trim();

        const category =
            categoryInput.value;

        const location =
            locationInput.value.trim();

        const eventDate =
            eventDateInput.value;

        const published =
            publishedInput.checked;


        if (!title || !description || !category) {

            showMessage(
                "Title, description and category are required.",
                "error"
            );

            return;
        }


        try {

            // ====================================================
            // EDIT EXISTING HAPPENING
            // ====================================================

            if (editingHappeningId !== null) {

                const response =
                    await fetch(
                        `${API_BASE_URL}/admin/happenings/${editingHappeningId}`,
                        {
                            method: "PUT",
                            headers: authHeaders(),
                            body: JSON.stringify({
                                title: title,
                                description: description,
                                location: location,
                                event_date: eventDate
                                    ? new Date(
                                        eventDate
                                    ).toISOString()
                                    : null,
                                category: category,
                                published: published
                            })
                        }
                    );


                if (response.status === 401) {

                    handleUnauthorized();

                    return;
                }


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Failed to update happening"
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


            // ====================================================
            // CREATE NEW HAPPENING
            // ====================================================

            let imageURL = "";


            if (imageInput.files.length > 0) {

                showMessage(
                    "Uploading image...",
                    "success"
                );


                imageURL =
                    await uploadImage(
                        imageInput.files[0]
                    );
            }


            const response =
                await fetch(
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
                                ? new Date(
                                    eventDate
                                ).toISOString()
                                : null,
                            category: category,
                            published: published
                        })
                    }
                );


            if (response.status === 401) {

                handleUnauthorized();

                return;
            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to create happening"
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
                error.message ||
                "Something went wrong.",
                "error"
            );
        }
    }
);


// ============================================================
// EDIT
// ============================================================

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
            );


        eventDateInput.value =
            localDate
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

    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    if (editingHappeningId !== null) {

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


            cancelButton.className =
                "secondary-button";


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


// ============================================================
// PUBLISH / UNPUBLISH
// ============================================================

async function updatePublishedStatus(
    id,
    published
) {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/happenings/${id}/status`,
                {
                    method: "PUT",
                    headers: authHeaders(),
                    body: JSON.stringify({
                        published: published
                    })
                }
            );


        if (response.status === 401) {

            handleUnauthorized();

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Failed to update status"
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
            error.message ||
            "Failed to update status.",
            "error"
        );
    }
}


// ============================================================
// DELETE
// ============================================================

async function deleteHappening(
    id,
    title
) {

    const confirmed =
        confirm(
            `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/happenings/${id}`,
                {
                    method: "DELETE",
                    headers: authHeaders()
                }
            );


        if (response.status === 401) {

            handleUnauthorized();

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Failed to delete happening"
            );
        }


        showMessage(
            "Happening deleted successfully.",
            "success"
        );


        if (
            editingHappeningId === id
        ) {
            cancelEdit();
        }


        await loadExistingHappenings();

    } catch (error) {

        console.error(error);

        showMessage(
            error.message ||
            "Failed to delete happening.",
            "error"
        );
    }
}


// ============================================================
// LOAD EXISTING HAPPENINGS
// ============================================================

async function loadExistingHappenings() {

    happeningsList.innerHTML =
        "Loading happenings...";


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/admin/happenings`,
                {
                    method: "GET",
                    headers: authHeaders()
                }
            );


        if (response.status === 401) {

            handleUnauthorized();

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Failed to load happenings"
            );
        }


        const happenings =
            Array.isArray(data)
                ? data
                : data.happenings ||
                  data.data ||
                  [];


        if (happenings.length === 0) {

            happeningsList.innerHTML =
                "<p>No happenings found.</p>";

            return;
        }


        happeningsList.innerHTML = "";


        happenings.forEach((item) => {

            const container =
                document.createElement(
                    "div"
                );


            container.className =
                "happening-item";


            container.style.border =
                "1px solid #ddd";

            container.style.padding =
                "15px";

            container.style.marginBottom =
                "15px";

            container.style.borderRadius =
                "10px";


            // =================================================
            // IMAGE
            // =================================================

            if (item.image_url) {

                const image =
                    document.createElement(
                        "img"
                    );


                image.src =
                    item.image_url;


                image.alt =
                    item.title || "Happening";


                image.style.width =
                    "160px";

                image.style.height =
                    "100px";

                image.style.objectFit =
                    "cover";

                image.style.borderRadius =
                    "8px";

                image.style.marginBottom =
                    "10px";


                container.appendChild(
                    image
                );
            }


            // =================================================
            // TITLE
            // =================================================

            const heading =
                document.createElement(
                    "h3"
                );


            heading.textContent =
                item.title || "";


            container.appendChild(
                heading
            );


            // =================================================
            // DESCRIPTION
            // =================================================

            const description =
                document.createElement(
                    "p"
                );


            description.textContent =
                item.description || "";


            container.appendChild(
                description
            );


            // =================================================
            // CATEGORY
            // =================================================

            const category =
                document.createElement(
                    "p"
                );


            category.innerHTML =
                "<strong>Category:</strong> ";


            category.append(
                document.createTextNode(
                    item.category || ""
                )
            );


            container.appendChild(
                category
            );


            // =================================================
            // LOCATION
            // =================================================

            const location =
                document.createElement(
                    "p"
                );


            location.innerHTML =
                "<strong>Location:</strong> ";


            location.append(
                document.createTextNode(
                    item.location || "N/A"
                )
            );


            container.appendChild(
                location
            );


            // =================================================
            // EVENT DATE
            // =================================================

            if (item.event_date) {

                const date =
                    document.createElement(
                        "p"
                    );


                date.innerHTML =
                    "<strong>Date:</strong> ";


                date.append(
                    document.createTextNode(
                        formatDate(
                            item.event_date
                        )
                    )
                );


                container.appendChild(
                    date
                );
            }


            // =================================================
            // STATUS
            // =================================================

            const status =
                document.createElement(
                    "p"
                );


            status.innerHTML =
                "<strong>Status:</strong> ";


            status.append(
                document.createTextNode(
                    item.published
                        ? "Published"
                        : "Unpublished"
                )
            );


            container.appendChild(
                status
            );


            // =================================================
            // EDIT BUTTON
            // =================================================

            const editButton =
                document.createElement(
                    "button"
                );


            editButton.type =
                "button";


            editButton.textContent =
                "Edit";


            editButton.addEventListener(
                "click",
                () => startEdit(item)
            );


            container.appendChild(
                editButton
            );


            // =================================================
            // PUBLISH / UNPUBLISH BUTTON
            // =================================================

            const statusButton =
                document.createElement(
                    "button"
                );


            statusButton.type =
                "button";


            statusButton.textContent =
                item.published
                    ? "Unpublish"
                    : "Publish";


            statusButton.addEventListener(
                "click",
                () =>
                    updatePublishedStatus(
                        item.id,
                        !item.published
                    )
            );


            container.appendChild(
                statusButton
            );


            // =================================================
            // DELETE BUTTON
            // =================================================

            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";


            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                () =>
                    deleteHappening(
                        item.id,
                        item.title
                    )
            );


            container.appendChild(
                deleteButton
            );


            happeningsList.appendChild(
                container
            );
        });


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

    const date =
        new Date(dateString);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Invalid date";
    }


    return date.toLocaleString();
}


// ============================================================
// ESCAPE HTML
// ============================================================

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


// ============================================================
// INITIAL LOAD
// ============================================================

updateFormMode();

loadExistingHappenings();
