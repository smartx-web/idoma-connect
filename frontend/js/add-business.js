const API_URL = "http://localhost:8080/api/v1/businesses";

const form = document.getElementById("businessForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const business = {
        name: document.getElementById("name").value.trim(),
        description: document.getElementById("description").value.trim(),
        category: document.getElementById("category").value,
        lga: document.getElementById("lga").value,
        address: document.getElementById("address").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        whatsapp: document.getElementById("whatsapp").value.trim(),

        image_url: "",
        video_url: "",
        latitude: 7.1905,
        longitude: 8.1347,
        verified: false
    };

    const submitBtn = document.querySelector(".submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(business)
        });

        const result = await response.json();

        if (result.success) {
            message.style.color = "green";
            message.textContent = "Business listed successfully! Redirecting...";

            form.reset();

            setTimeout(() => {
                window.location.href = "businesses.html";
            }, 1800);

        } else {
            message.style.color = "red";
            message.textContent = result.message || "Submission failed.";
        }

    } catch (error) {
        console.error(error);
        message.style.color = "red";
        message.textContent = "Unable to connect to the server.";
    }

    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Business";
});
