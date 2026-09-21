const API_BASE_URL = "http://localhost:8080/api/v1";

// =============================
// AUTHENTICATION
// =============================

function getAdminToken() {
    return localStorage.getItem("admin_token");
}

function getAuthHeaders() {
    const token = getAdminToken();

    if (!token) {
        window.location.href = "login.html";
        return null;
    }

    return {
        "Authorization": `Bearer ${token}`
    };
}

function getJsonAuthHeaders() {
    const token = getAdminToken();

    if (!token) {
        window.location.href = "login.html";
        return null;
    }

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

function handleUnauthorized() {
    localStorage.removeItem("admin_token");
    window.location.href = "login.html";
}

// =============================
// DOM ELEMENTS
// =============================

const businessesList =
    document.getElementById("businessesList");

const pendingCount =
    document.getElementById("pendingCount");

const message =
    document.getElementById("message");

const refreshButton =
    document.getElementById("refreshButton");

// =============================
// LOAD PENDING BUSINESSES
// =============================

async function loadPendingBusinesses() {

    businessesList.innerHTML = `
        <div class="loading">
            Loading pending businesses...
        </div>
    `;

    clearMessage();

    try {

        const headers = getAuthHeaders();

        if (!headers) {
            return;
        }

        console.log(
            "Loading pending businesses with token:",
            getAdminToken() ? "YES" : "NO"
        );

        const response = await fetch(
            `${API_BASE_URL}/admin/businesses/pending`,
            {
                method: "GET",
                headers: headers
            }
        );

        console.log(
            "Pending businesses status:",
            response.status
        );

        if (
            response.status === 401 ||
            response.status === 403
        ) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Pending businesses API error:",
                errorText
            );

            throw new Error(
                "Failed to load pending businesses."
            );
        }

        const result =
            await response.json();

        console.log(
            "Pending businesses response:",
            result
        );

        const businesses =
            Array.isArray(result.data)
                ? result.data
                : [];

        updatePendingCount(
            businesses.length
        );

        if (businesses.length === 0) {
            showEmptyState();
            return;
        }

        renderBusinesses(
            businesses
        );

    } catch (error) {

        console.error(
            "Error loading businesses:",
            error
        );

        businessesList.innerHTML = `
            <div class="error-message">
                Unable to load pending businesses.
                Please try refreshing the page.
            </div>
        `;

        updatePendingCount(0);
    }
}

// =============================
// UPDATE COUNT
// =============================

function updatePendingCount(count) {

    pendingCount.textContent =
        `${count} Pending`;

}

// =============================
// RENDER BUSINESSES
// =============================

function renderBusinesses(
    businesses
) {

    businessesList.innerHTML = "";

    businesses.forEach(
        (business) => {

            const businessItem =
                document.createElement(
                    "article"
                );

            businessItem.className =
                "business-item";

            const imageHTML =
                business.image_url
                    ? `
                        <img
                            src="${escapeHTML(
                                business.image_url
                            )}"
                            alt="${escapeHTML(
                                business.name
                            )}"
                            class="business-image"
                        >
                    `
                    : `
                        <div class="business-image-placeholder">
                            No image available
                        </div>
                    `;

            businessItem.innerHTML = `
                <div>
                    ${imageHTML}
                </div>

                <div class="business-content">

                    <span class="pending-badge">
                        PENDING REVIEW
                    </span>

                    <h3>
                        ${escapeHTML(
                            business.name
                        )}
                    </h3>

                    <div class="business-meta">
                        ${escapeHTML(
                            business.category
                        )}
                        ·
                        ${escapeHTML(
                            business.lga
                        )}
                    </div>

                    <div class="business-description">
                        ${escapeHTML(
                            business.description ||
                            "No description provided."
                        )}
                    </div>

                    <div class="business-contact">

                        ${
                            business.address
                                ? `
                                    <div>
                                        <strong>
                                            Address:
                                        </strong>
                                        ${escapeHTML(
                                            business.address
                                        )}
                                    </div>
                                `
                                : ""
                        }

                        ${
                            business.phone
                                ? `
                                    <div>
                                        <strong>
                                            Phone:
                                        </strong>
                                        ${escapeHTML(
                                            business.phone
                                        )}
                                    </div>
                                `
                                : ""
                        }

                        ${
                            business.whatsapp
                                ? `
                                    <div>
                                        <strong>
                                            WhatsApp:
                                        </strong>
                                        ${escapeHTML(
                                            business.whatsapp
                                        )}
                                    </div>
                                `
                                : ""
                        }

                    </div>

                    <div class="business-meta">
                        Submitted:
                        ${formatDate(
                            business.created_at
                        )}
                    </div>

                    <div class="business-actions">

                        <button
                            type="button"
                            class="action-button approve-button"
                            data-id="${business.id}"
                            onclick="approveBusiness(${business.id})"
                        >
                            Approve
                        </button>

                        <button
                            type="button"
                            class="action-button reject-button"
                            data-id="${business.id}"
                            onclick="rejectBusiness(${business.id})"
                        >
                            Reject
                        </button>

                    </div>

                </div>
            `;

            businessesList.appendChild(
                businessItem
            );

        }
    );
}

// =============================
// APPROVE BUSINESS
// =============================

async function approveBusiness(id) {

    const confirmed =
        confirm(
            "Are you sure you want to approve this business?"
        );

    if (!confirmed) {
        return;
    }

    setButtonsDisabled(
        id,
        true
    );

    try {

        const headers =
            getJsonAuthHeaders();

        if (!headers) {
            return;
        }

        const response =
            await fetch(
                `${API_BASE_URL}/admin/businesses/${id}/approve`,
                {
                    method: "PUT",
                    headers: headers
                }
            );

        if (
            response.status === 401 ||
            response.status === 403
        ) {
            handleUnauthorized();
            return;
        }

        const result =
            await response.json();

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to approve business."
            );
        }

        showMessage(
            "Business approved successfully.",
            "success"
        );

        await loadPendingBusinesses();

    } catch (error) {

        console.error(
            "Approval error:",
            error
        );

        showMessage(
            error.message ||
            "Failed to approve business.",
            "error"
        );

        setButtonsDisabled(
            id,
            false
        );
    }
}

// =============================
// REJECT BUSINESS
// =============================

async function rejectBusiness(id) {

    const confirmed =
        confirm(
            "Are you sure you want to reject this business?"
        );

    if (!confirmed) {
        return;
    }

    setButtonsDisabled(
        id,
        true
    );

    try {

        const headers =
            getJsonAuthHeaders();

        if (!headers) {
            return;
        }

        const response =
            await fetch(
                `${API_BASE_URL}/admin/businesses/${id}/reject`,
                {
                    method: "PUT",
                    headers: headers
                }
            );

        if (
            response.status === 401 ||
            response.status === 403
        ) {
            handleUnauthorized();
            return;
        }

        const result =
            await response.json();

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to reject business."
            );
        }

        showMessage(
            "Business rejected successfully.",
            "success"
        );

        await loadPendingBusinesses();

    } catch (error) {

        console.error(
            "Rejection error:",
            error
        );

        showMessage(
            error.message ||
            "Failed to reject business.",
            "error"
        );

        setButtonsDisabled(
            id,
            false
        );
    }
}

// =============================
// DISABLE BUTTONS
// =============================

function setButtonsDisabled(
    id,
    disabled
) {

    const buttons =
        document.querySelectorAll(
            `[data-id="${id}"]`
        );

    buttons.forEach(
        (button) => {
            button.disabled =
                disabled;
        }
    );
}

// =============================
// EMPTY STATE
// =============================

function showEmptyState() {

    businessesList.innerHTML = `
        <div class="empty-state">

            <h3>
                No Pending Businesses
            </h3>

            <p>
                There are currently no business
                submissions waiting for review.
            </p>

        </div>
    `;
}

// =============================
// SHOW MESSAGE
// =============================

function showMessage(
    text,
    type
) {

    message.className = "";

    message.textContent =
        text;

    message.classList.add(
        type === "success"
            ? "success-message"
            : "error-message"
    );
}

// =============================
// CLEAR MESSAGE
// =============================

function clearMessage() {

    message.className = "";

    message.textContent = "";
}

// =============================
// FORMAT DATE
// =============================

function formatDate(
    dateString
) {

    if (!dateString) {
        return "Unknown";
    }

    const date =
        new Date(dateString);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "Unknown";
    }

    return date.toLocaleString();
}

// =============================
// ESCAPE HTML
// =============================

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

// =============================
// REFRESH
// =============================

refreshButton.addEventListener(
    "click",
    loadPendingBusinesses
);

// =============================
// INITIAL LOAD
// =============================

loadPendingBusinesses();
