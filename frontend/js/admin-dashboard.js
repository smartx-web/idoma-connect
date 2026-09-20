const API = "http://localhost:8080/api/v1";

const approvedCount = document.getElementById("approvedCount");
const pendingCount = document.getElementById("pendingCount");
const rejectedCount = document.getElementById("rejectedCount");
const happeningsCount = document.getElementById("happeningsCount");
const activityList = document.getElementById("activityList");

async function fetchJSON(url) {
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error("Request failed");
    }

    return res.json();
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

        approvedCount.textContent = approved.count || 0;
        pendingCount.textContent = pending.count || 0;
        rejectedCount.textContent = rejected.count || 0;
        happeningsCount.textContent = happenings.data.length || 0;

        activityList.innerHTML = `
            <div class="activity-item">
                <span>Approved businesses</span>
                <strong>${approved.count}</strong>
            </div>

            <div class="activity-item">
                <span>Pending submissions</span>
                <strong>${pending.count}</strong>
            </div>

            <div class="activity-item">
                <span>Rejected businesses</span>
                <strong>${rejected.count}</strong>
            </div>

            <div class="activity-item">
                <span>Total happenings</span>
                <strong>${happenings.data.length}</strong>
            </div>
        `;

    } catch (err) {

        activityList.innerHTML = `
            <div style="color:#b42318">
                Unable to connect to the API.
            </div>
        `;

    }
}

loadDashboard();
