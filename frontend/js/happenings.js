const API_URL = "http://localhost:8080/api/v1/happenings";

const loading = document.getElementById("loading");
const grid = document.getElementById("happeningsGrid");
const emptyState = document.getElementById("emptyState");
const errorState = document.getElementById("errorState");
const noResults = document.getElementById("noResults");

const featuredSection = document.getElementById("featuredSection");
const featuredContainer = document.getElementById("featuredHappening");

const searchInput = document.getElementById("searchInput");
const categoryFilters = document.getElementById("categoryFilters");
const resultsInfo = document.getElementById("resultsInfo");
const latestHeading = document.getElementById("latestHeading");


let allHappenings = [];
let selectedCategory = "all";


/* ==========================================
   LOAD HAPPENINGS
   ========================================== */

async function loadHappenings() {

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


        allHappenings = happenings
            .filter(
                item =>
                    item.published === true
            )
            .sort(
                (a, b) =>
                    new Date(b.created_at) -
                    new Date(a.created_at)
            );


        loading.style.display = "none";


        if (allHappenings.length === 0) {

            emptyState.style.display =
                "block";

            return;
        }


        buildCategoryFilters();

        renderFeatured(allHappenings[0]);

        renderResults();

    } catch (error) {

        console.error(
            "Unable to load happenings:",
            error
        );

        loading.style.display = "none";

        errorState.style.display =
            "block";
    }
}


/* ==========================================
   BUILD CATEGORY FILTERS
   ========================================== */

function buildCategoryFilters() {

    const categories = [
        ...new Set(
            allHappenings
                .map(item =>
                    String(
                        item.category || ""
                    ).trim()
                )
                .filter(Boolean)
        )
    ];


    categories.sort(
        (a, b) =>
            a.localeCompare(b)
    );


    categoryFilters.innerHTML = "";


    const allButton =
        createCategoryButton(
            "all",
            "All"
        );

    categoryFilters.appendChild(
        allButton
    );


    categories.forEach(category => {

        const button =
            createCategoryButton(
                category,
                category
            );

        categoryFilters.appendChild(
            button
        );

    });
}


/* ==========================================
   CREATE CATEGORY BUTTON
   ========================================== */

function createCategoryButton(
    value,
    label
) {

    const button =
        document.createElement("button");

    button.type = "button";

    button.className =
        "category-button";


    if (value === selectedCategory) {

        button.classList.add(
            "active"
        );
    }


    button.textContent = label;


    button.addEventListener(
        "click",
        () => {

            selectedCategory =
                value;

            updateCategoryButtons();

            renderResults();

        }
    );


    return button;
}


/* ==========================================
   UPDATE ACTIVE CATEGORY
   ========================================== */

function updateCategoryButtons() {

    const buttons =
        categoryFilters.querySelectorAll(
            ".category-button"
        );


    buttons.forEach(button => {

        const buttonValue =
            button.textContent
                .trim()
                .toLowerCase();


        if (
            selectedCategory === "all" &&
            buttonValue === "all"
        ) {

            button.classList.add(
                "active"
            );

            return;
        }


        if (
            selectedCategory !== "all" &&
            buttonValue ===
                selectedCategory.toLowerCase()
        ) {

            button.classList.add(
                "active"
            );

        } else {

            button.classList.remove(
                "active"
            );
        }

    });
}


/* ==========================================
   FILTER + SEARCH
   ========================================== */

function getFilteredHappenings() {

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();


    return allHappenings.filter(
        item => {

            const category =
                String(
                    item.category || ""
                ).toLowerCase();

            const title =
                String(
                    item.title || ""
                ).toLowerCase();

            const description =
                String(
                    item.description || ""
                ).toLowerCase();

            const location =
                String(
                    item.location || ""
                ).toLowerCase();


            const matchesCategory =
                selectedCategory === "all" ||
                category ===
                    selectedCategory.toLowerCase();


            const matchesSearch =
                !searchTerm ||
                title.includes(searchTerm) ||
                description.includes(searchTerm) ||
                category.includes(searchTerm) ||
                location.includes(searchTerm);


            return (
                matchesCategory &&
                matchesSearch
            );
        }
    );
}


/* ==========================================
   RENDER RESULTS
   ========================================== */

function renderResults() {

    const filtered =
        getFilteredHappenings();


    const searchActive =
        searchInput.value.trim()
            .length > 0;

    const filterActive =
        selectedCategory !== "all";


    /*
     * When there is no search/filter,
     * keep the original featured story.
     */

    if (
        !searchActive &&
        !filterActive
    ) {

        featuredSection.style.display =
            "block";

        latestHeading.textContent =
            "Events & Community Updates";

    } else {

        featuredSection.style.display =
            "none";


        if (filterActive) {

            latestHeading.textContent =
                selectedCategory;

        } else {

            latestHeading.textContent =
                "Search Results";
        }
    }


    /*
     * Remove the featured item
     * from the normal grid only
     * when showing the default feed.
     */

    let results = filtered;


    if (
        !searchActive &&
        !filterActive
    ) {

        results =
            filtered.slice(1);
    }


    if (results.length === 0) {

        grid.innerHTML = "";

        grid.style.display =
            "none";

        noResults.style.display =
            "block";

    } else {

        noResults.style.display =
            "none";

        grid.style.display =
            "grid";

        grid.innerHTML =
            results
                .map(renderCard)
                .join("");
    }


    updateResultsInfo(
        filtered.length,
        searchActive || filterActive
    );
}


/* ==========================================
   RESULTS INFORMATION
   ========================================== */

function updateResultsInfo(
    count,
    shouldShow
) {

    if (!shouldShow) {

        resultsInfo.style.display =
            "none";

        resultsInfo.textContent =
            "";

        return;
    }


    resultsInfo.style.display =
        "block";


    if (count === 1) {

        resultsInfo.textContent =
            "1 happening found";

    } else {

        resultsInfo.textContent =
            `${count} happenings found`;
    }
}


/* ==========================================
   FEATURED
   ========================================== */

function renderFeatured(item) {

    featuredSection.style.display =
        "block";


    const imageUrl =
        item.image_url
            ? item.image_url
            : "images/placeholder.jpg";


    const date =
        formatDate(
            item.event_date
        );


    featuredContainer.innerHTML = `

        <div class="featured-image">

            <img
                src="${escapeHTML(imageUrl)}"
                alt="${escapeHTML(item.title)}"
            >

        </div>


        <div class="featured-content">

            <span class="featured-badge">
                FEATURED
            </span>


            <span class="featured-category">
                ${escapeHTML(
                    item.category ||
                    "Happening"
                )}
            </span>


            <h2>
                ${escapeHTML(
                    item.title
                )}
            </h2>


            <p>
                ${escapeHTML(
                    item.description
                )}
            </p>


            ${
                item.location
                    ? `
                        <div class="featured-meta">
                            📍 ${escapeHTML(
                                item.location
                            )}
                        </div>
                    `
                    : ""
            }


            ${
                date
                    ? `
                        <div class="featured-meta">
                            📅 ${escapeHTML(
                                date
                            )}
                        </div>
                    `
                    : ""
            }


            <a
                href="happening.html?id=${encodeURIComponent(
                    item.id
                )}"
                class="featured-button"
            >
                Read Full Story →
            </a>

        </div>
    `;
}


/* ==========================================
   STORY CARD
   ========================================== */

function renderCard(item) {

    const imageUrl =
        item.image_url
            ? item.image_url
            : "images/placeholder.jpg";


    const date =
        formatDate(
            item.event_date
        );


    return `

        <article class="happening-card">

            <a
                href="happening.html?id=${encodeURIComponent(
                    item.id
                )}"
                class="happening-card-link"
            >

                <img
                    class="happening-card-image"
                    src="${escapeHTML(imageUrl)}"
                    alt="${escapeHTML(item.title)}"
                >


                <div class="happening-card-content">

                    <span class="happening-category">
                        ${escapeHTML(
                            item.category ||
                            "Happening"
                        )}
                    </span>


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


                    ${
                        item.location
                            ? `
                                <div class="happening-meta">
                                    📍 ${escapeHTML(
                                        item.location
                                    )}
                                </div>
                            `
                            : ""
                    }


                    ${
                        date
                            ? `
                                <div class="happening-meta">
                                    📅 ${escapeHTML(
                                        date
                                    )}
                                </div>
                            `
                            : ""
                    }


                    <span class="read-more">
                        Read Full Story →
                    </span>

                </div>

            </a>

        </article>
    `;
}


/* ==========================================
   DATE FORMATTER
   ========================================== */

function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";
    }


    return date.toLocaleDateString(
        "en-NG",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


/* ==========================================
   HTML ESCAPE
   ========================================== */

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


/* ==========================================
   SEARCH LISTENER
   ========================================== */

searchInput.addEventListener(
    "input",
    () => {

        renderResults();

    }
);


/* ==========================================
   START
   ========================================== */

loadHappenings();
