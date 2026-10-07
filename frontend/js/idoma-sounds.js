/* =========================================================
   IDOMA SOUNDS
   IDOMA-CONNECT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const filterButtons = document.querySelectorAll(".filter-button");
    const soundCards = document.querySelectorAll(".sound-card");

    const categoryCards = document.querySelectorAll(".category-card");


    /* ================= FILTER SOUNDS ================= */

    function filterSounds(category) {

        soundCards.forEach((card) => {

            const cardCategory = card.dataset.category;

            if (
                category === "all" ||
                cardCategory === category
            ) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }

        });

    }


    filterButtons.forEach((button) => {

        button.addEventListener("click", () => {

            filterButtons.forEach((item) => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            const category = button.dataset.filter;

            filterSounds(category);

        });

    });


    /* ================= CATEGORY CARDS ================= */

    categoryCards.forEach((card) => {

        card.addEventListener("click", () => {

            const category = card.dataset.categoryLink;

            const matchingFilter = document.querySelector(
                `.filter-button[data-filter="${category}"]`
            );

            if (matchingFilter) {

                matchingFilter.click();

                const latestSection =
                    document.querySelector("#latest");

                if (latestSection) {
                    latestSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }

            } else {

                const allButton =
                    document.querySelector(
                        '.filter-button[data-filter="all"]'
                    );

                if (allButton) {
                    allButton.click();
                }

                const latestSection =
                    document.querySelector("#latest");

                if (latestSection) {
                    latestSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }

            }

        });

    });


    /* ================= PLAY BUTTON PLACEHOLDERS ================= */

    const playButtons =
        document.querySelectorAll(".mini-play");

    playButtons.forEach((button) => {

        button.addEventListener("click", (event) => {

            event.preventDefault();

            alert(
                "Audio playback will be connected when the Idoma Sounds archive is ready."
            );

        });

    });


    console.log("Idoma Sounds loaded.");

});
