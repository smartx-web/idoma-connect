const API = "http://localhost:8080/api/v1";

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

async function loadDashboard() {
    try {
        const [
            approved,
            pending,
            rejected,
            happeningStats
        ] = await Promise.all([
            fetchJSON(`${API}/admin/businesses/approved`),
            fetchJSON(`${API}/admin/businesses/pending`),
            fetchJSON(`${API}/admin/businesses/rejected`),
            fetchJSON(`${API}/admin/happenings/stats`)
        ]);

        if (!approved || !pending || !rejected || !happeningStats) {
            return;
        }

        setCount(
            approvedCount,
            approved.count
        );

        setCount(
            pendingCount,
            pending.count
        );

        setCount(
            rejectedCount,
            rejected.count
        );

        setCount(
            happeningsCount,
            happeningStats?.data?.total
        );

        renderActivity(
            happeningStats,
            pending
        );

    } catch (error) {
        console.error("Failed to load dashboard:", error);
        showDashboardError();
    }
}

loadDashboard();
