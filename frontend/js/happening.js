const API_URL = "http://localhost:8080/api/v1/happenings";

const loading = document.getElementById("loading");
const error = document.getElementById("error");
const article = document.getElementById("happeningArticle");

const happeningImage = document.getElementById("happeningImage");
const happeningCategory = document.getElementById("happeningCategory");
const happeningTitle = document.getElementById("happeningTitle");
const happeningDate = document.getElementById("happeningDate");
const happeningLocation = document.getElementById("happeningLocation");
const happeningDescription = document.getElementById("happeningDescription");

const shareButton = document.getElementById("shareButton");
const copyButton = document.getElementById("copyButton");
const shareMessage = document.getElementById("shareMessage");

const relatedSection = document.getElementById("relatedSection");
const relatedGrid = document.getElementById("relatedGrid");


let currentHappening = null;


function getHappeningId() {
    const params = new URLSearchParams(
        window.location.search
    );

    return params.get("id");
}


function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


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


async function loadHappening() {

    const id = getHappeningId();

    if (!id) {
        showError();
        return;
    }

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                "Failed to load happenings"
            );
        }

        const result = await response.json();

        const happenings = Array.isArray(result.data)
            ? result.data
            : [];

        const publishedHappenings = happenings
            .filter(item => item.published === true);

        const happening = publishedHappenings.find(
            item => String(item.id) === String(id)
        );

        if (!happening) {
            showError();
            return;
        }

        currentHappening = happening;

        renderHappening(happening);

        renderRelatedHappenings(
            publishedHappenings,
            happening.id
        );

    } catch (errorMessage) {

        console.error(
            "Unable to load happening:",
            errorMessage
        );

        showError();
    }
}


function renderHappening(happening) {

    const imageUrl = happening.image_url
        ? happening.image_url
        : "images/placeholder.jpg";

    happeningImage.src = imageUrl;

    happeningImage.alt =
        happening.title || "Idoma happening";

    happeningCategory.textContent =
        happening.category || "Happening";

    happeningTitle.textContent =
        happening.title || "Untitled happening";

    const formattedDate =
        formatDate(happening.event_date);

    if (formattedDate) {

        happeningDate.textContent =
            `📅 ${formattedDate}`;

    } else {

        happeningDate.style.display =
            "none";
    }


    if (happening.location) {

        happeningLocation.textContent =
            `📍 ${happening.location}`;

    } else {

        happeningLocation.style.display =
            "none";
    }


    happeningDescription.textContent =
        happening.description || "";


    document.title =
        `${happening.title} | IDOMA-CONNECT`;


    loading.style.display = "none";

    article.style.display = "block";
}


function renderRelatedHappenings(
    happenings,
    currentId
) {

    const related = happenings
        .filter(
            item =>
                String(item.id) !== String(currentId)
        )
        .slice(0, 3);


    if (related.length === 0) {
        return;
    }


    relatedGrid.innerHTML =
        related.map(renderRelatedCard).join("");


    relatedSection.style.display =
        "block";
}


function renderRelatedCard(item) {

    const imageUrl = item.image_url
        ? item.image_url
        : "images/placeholder.jpg";

    const description =
        item.description || "";

    const shortDescription =
        description.length > 110
            ? `${description.substring(0, 110)}...`
            : description;


    return `
        <article class="related-card">

            <a
                href="happening.html?id=${encodeURIComponent(item.id)}"
            >

                <img
                    class="related-image"
                    src="${escapeHTML(imageUrl)}"
                    alt="${escapeHTML(item.title)}"
                >

                <div class="related-content">

                    <span class="related-category">
                        ${escapeHTML(
                            item.category || "Happening"
                        )}
                    </span>

                    <h3>
                        ${escapeHTML(
                            item.title || "Untitled happening"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(shortDescription)}
                    </p>

                </div>

            </a>

        </article>
    `;
}


async function shareStory() {

    if (!currentHappening) {
        return;
    }

    const shareData = {
        title:
            currentHappening.title ||
            "IDOMA-CONNECT",

        text:
            currentHappening.description ||
            "Read this story on IDOMA-CONNECT.",

        url: window.location.href
    };


    if (
        navigator.share &&
        typeof navigator.share === "function"
    ) {

        try {

            await navigator.share(shareData);

        } catch (error) {

            if (error.name !== "AbortError") {

                console.error(
                    "Sharing failed:",
                    error
                );
            }
        }

        return;
    }


    await copyLink(
        "Story link copied. You can share it anywhere."
    );
}


async function copyLink(
    message = "Story link copied."
) {

    try {

        await navigator.clipboard.writeText(
            window.location.href
        );

        showShareMessage(message);

    } catch (error) {

        console.error(
            "Unable to copy link:",
            error
        );

        showShareMessage(
            "Unable to copy automatically. Please copy the URL from your browser."
        );
    }
}


function showShareMessage(message) {

    shareMessage.textContent =
        message;

    shareMessage.style.display =
        "block";


    setTimeout(() => {

        shareMessage.style.display =
            "none";

    }, 3500);
}


function showError() {

    loading.style.display =
        "none";

    article.style.display =
        "none";

    relatedSection.style.display =
        "none";

    error.style.display =
        "block";
}


shareButton.addEventListener(
    "click",
    shareStory
);


copyButton.addEventListener(
    "click",
    () => copyLink()
);


loadHappening();
