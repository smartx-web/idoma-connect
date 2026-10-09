const API = "https://idoma-connect-api.onrender.com/api/v1";

const approvedCount = document.getElementById("approvedCount");
const pendingCount = document.getElementById("pendingCount");
const rejectedCount = document.getElementById("rejectedCount");
const happeningsCount = document.getElementById("happeningsCount");
const activityList = document.getElementById("activityList");

function getToken() {
    return localStorage.getItem("admin_token");
}

function getAuthHeaders() {
    const token = getToken();

    if (!token) {
        redirectToLogin();
        return null;
    }

    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
}

function redirectToLogin() {
    localStorage.removeItem("admin_token");
    window.location.href = "login.html";
}

async function fetchJSON(url) {
    const headers = getAuthHeaders();

    if (!headers) {
        return null;
    }

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: headers
        });

        if (response.status === 401 || response.status === 403) {
            redirectToLogin();
            return null;
        }

        if (!response.ok) {
            throw new Error(
                `Request failed with status ${response.status}`
            );
        }

        return await response.json();

    } catch (error) {
        console.error("Dashboard request failed:", error);
        throw error;
    }
}

function setCount(element, value) {
    if (!element) {
        return;
    }

    element.textContent = value ?? 0;
}

function renderActivity(stats, pendingBusinesses) {
    if (!activityList) {
        return;
    }

    const published =
        stats?.data?.published ?? 0;

    const unpublished =
        stats?.data?.unpublished ?? 0;

    const pending =
        pendingBusinesses?.count ?? 0;

    activityList.innerHTML = "";

    const activities = [
        {
            label: "Published happenings",
            value: published
        },
        {
            label: "Unpublished happenings",
            value: unpublished
        },
        {
            label: "Pending business approvals",
            value: pending
        }
    ];

    activities.forEach((activity) => {
        const item = document.createElement("div");
        item.className = "activity-item";

        const label = document.createElement("span");
        label.textContent = activity.label;

        const value = document.createElement("strong");
        value.textContent = activity.value;

        item.appendChild(label);
        item.appendChild(value);

        activityList.appendChild(item);
    });
}

function showDashboardError() {
    if (!activityList) {
        return;
    }

    activityList.innerHTML = "";

    const errorMessage = document.createElement("div");
    errorMessage.className = "error";
    errorMessage.textContent =
        "Unable to load dashboard data. Please refresh the page.";

    activityList.appendChild(errorMessage);
}

function renderPendingBusinesses(result) {
    const list = document.getElementById("pendingBusinessesList");
    if (!list) return;
    list.replaceChildren();
    if (!Array.isArray(result?.data)) {
        list.textContent = "Unable to load pending businesses. Refresh to try again.";
        return;
    }
    if (result.data.length === 0) {
        list.textContent = "No business submissions are waiting for review.";
        return;
    }
    result.data.forEach(business => {
        const item = document.createElement("div");
        item.className = "activity-item";
        item.style.gap = "16px";
        item.style.flexWrap = "wrap";
        const detail = document.createElement("span");
        detail.textContent = [business.name, business.category, business.lga].filter(Boolean).join(" · ");
        const review = document.createElement("a");
        review.href = "businesses.html#business-" + encodeURIComponent(business.id);
        review.textContent = "Review submission";
        item.appendChild(detail);
        item.appendChild(review);
        list.appendChild(item);
    });
}

async function loadDashboard() {
    try {
        const results = await Promise.allSettled([
            fetchJSON(`${API}/admin/businesses/approved`),
            fetchJSON(`${API}/admin/businesses/pending`),
            fetchJSON(`${API}/admin/businesses/rejected`),
            fetchJSON(`${API}/admin/happenings/stats`)
        ]);
        const [approved, pending, rejected, happeningStats] =
            results.map(result => result.status === "fulfilled" ? result.value : null);
        setCount(approvedCount, approved ? approved.count : "Unavailable");
        setCount(pendingCount, pending ? pending.count : "Unavailable");
        setCount(rejectedCount, rejected ? rejected.count : "Unavailable");
        setCount(happeningsCount, happeningStats ? happeningStats?.data?.total : "Unavailable");
        renderPendingBusinesses(pending);
        renderActivity(happeningStats, pending);
        if (results.some(result => result.status === "rejected")) {
            showDashboardError();
        }

    } catch (error) {
        console.error("Failed to load dashboard:", error);
        showDashboardError();
    }
}

document.getElementById("refreshDashboard")?.addEventListener("click", loadDashboard);
loadDashboard();
