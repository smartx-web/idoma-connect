// ==========================================
// IDOMA HALL OF FAME
// ==========================================


// ==========================================
// HALL OF FAME DATA
// ==========================================

const hallOfFame = [

    {
        name: "HRM Agabaidu Ogiri Oko",
        title: "Och'Idoma I",
        reign: "1948 – 1959",

        description:
            "The first Och'Idoma installed under British administration. He laid the foundation for the institution and established Otukpo as the permanent seat of the Idoma nation.",

        image:
            "images/hall-of-fame/ogiri-oko.jpg"
    },


    {
        name: "HRM Agabaidu Ajene Okpabi",
        title: "Och'Idoma II",
        reign: "1960 – 1995",

        description:
            "Of Igede descent, he had the longest reign on the throne, overseeing the transition through Nigeria's independence and decades of regional administrative changes.",

        image:
            "images/hall-of-fame/ajene-okpabi.jpg"
    },


    {
        name: "HRM Agabaidu Edwin Ogbu",
        title: "Och'Idoma III",
        reign: "1996",

        description:
            "A former Nigerian diplomat and Permanent Representative to the United Nations who brought extensive international and administrative experience to the traditional institution.",

        image:
            "images/hall-of-fame/edwin-ogbu.jpg"
    },


    {
        name: "HRH Agabaidu Elias Ikoyi Obekpa",
        title: "Och'Idoma IV",
        reign: "1997 – 2021",

        description:
            "A long-reigning monarch remembered for his role in traditional administration, peace, unity and cooperation among communities in Idoma Land.",

        image:
            "images/hall-of-fame/elias-obekpa.jpg"
    },


    {
        name: "HRM Elaigwu Odogbo John",
        title: "Och'Idoma V",
        reign: "2022 – Present",

        description:
            "Installed on June 30, 2022, as the fifth Och'Idoma, representing a modern generation of traditional leadership focused on cultural identity, unity and communal development.",

        image:
            "images/hall-of-fame/elaigwu-odogbo.jpg"
    }

];


// ==========================================
// GET GRID
// ==========================================

const grid =
    document.getElementById("hallOfFameGrid");


// ==========================================
// RENDER CARDS
// ==========================================

function renderHallOfFame() {

    grid.innerHTML = hallOfFame.map(person => `

        <article class="hall-card">

            <img
                class="hall-image"
                src="${person.image}"
                alt="${person.name}"
                onerror="this.style.display='none'"
            >

            <div class="hall-content">

                <span class="title-badge">
                    ${person.title}
                </span>

                <h3>
                    ${person.name}
                </h3>

                <p class="reign">
                    ${person.reign}
                </p>

                <p>
                    ${person.description}
                </p>

            </div>

        </article>

    `).join("");

}


// ==========================================
// INITIALIZE
// ==========================================

renderHallOfFame();
