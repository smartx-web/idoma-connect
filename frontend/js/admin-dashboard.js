const API = "http://localhost:8080/api/v1";

const approvedCount = document.getElementById("approvedCount");
const pendingCount = document.getElementById("pendingCount");
const rejectedCount = document.getElementById("rejectedCount");
const happeningsCount = document.getElementById("happeningsCount");
const activityList = document.getElementById("activityList");

function getAdminToken() {
    return localStorage.getItem("admin_token");
}

async function fetchJSON(url) {
    const token = localStorage.getItem("admin_token");

    console.log("Using token:", token ? "YES" : "NO");

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    console.log(url, response.status);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
}


async function loadDashboard() {
    try {

        const [
            approved,
            pending,
            rejected,
            happenings
        ] = await Promise.all([
            fetchJSON(`${API}/admin/businesses/approved`),
            fetchJSON(`${API}/admin/businesses/pending`),
            fetchJSON(`${API}/admin/businesses/rejected`),
            fetchJSON(`${API}/happenings`)
        ]);

        if (!approved || !pending || !rejected || !happenings) {
            return;
        }

        approvedCount.textContent = approved.count ?? 0;
        pendingCount.textContent = pending.count ?? 0;
        rejectedCount.textContent = rejected.count ?? 0;

        const happeningsData = Array.isArray(happenings.data)
            ? happenings.data
            : [];

        happeningsCount.textContent = happeningsData.length;

        activityList.innerHTML = `
            <div class="activity-item">
                <span>Approved businesses</span>
                <strong>${approved.count ?? 0}</strong>
            </div>

            <div class="activity-item">
                <span>Pending submissions</span>
                <strong>${pending.count ?? 0}</strong>
            </div>

            <div class="activity-item">
                <span>Rejected businesses</span>
                <strong>${rejected.count ?? 0}</strong>
            </div>

            <div class="activity-item">
                <span>Total happenings</span>
                <strong>${happeningsData.length}</strong>
            </div>
        `;

    } catch (error) {
        console.error("Dashboard error:", error);

        activityList.innerHTML = `
            <div style="color:#b42318">
                Unable to connect to the API.
            </div>
        `;

    }
}

loadDashboard();
