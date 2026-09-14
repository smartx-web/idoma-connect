const businesses = [
  {
    id: 1,
    name: "Royal Specialist Hospital",
    category: "Hospital",
    lga: "Otukpo",
    address: "No. 12 Otukpo Road, Otukpo",
    phone: "07060784477",
    whatsapp: "07060784477",
    description: "24-hour specialist healthcare services.",
    image: "images/royal.jpg",
    verified: true
  },
  {
    id: 2,
    name: "MB Electronics",
    category: "Market",
    lga: "Otukpo",
    address: "Otukpo Main Market",
    phone: "08031234567",
    whatsapp: "08031234567",
    description: "Phones, accessories and electronics.",
    image: "images/electronics.jpg",
    verified: false
  }
];

const grid = document.querySelector(".business-grid");
const search = document.getElementById("searchInput");
const lga = document.getElementById("lgaFilter");
const category = document.getElementById("categoryFilter");

function render(list) {
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML = "<p>No business found.</p>";
    return;
  }

  list.forEach(b => {
    grid.innerHTML += `
      <div class="business-card">
        <img src="${b.image}" alt="${b.name}">
        <div class="content">
          <span class="badge">${b.category}</span>
          <h3>${b.name} ${b.verified ? "✅" : ""}</h3>
          <p class="desc">${b.description}</p>
          <p>📍 ${b.address}</p>

          <div class="actions">
            <a href="tel:${b.phone}" class="call">Call</a>
            <a href="https://wa.me/234${b.whatsapp.slice(1)}" class="whatsapp" target="_blank">WhatsApp</a>
          </div>
        </div>
      </div>
    `;
  });
}

function filterBusinesses() {
  const term = search.value.toLowerCase();

  const filtered = businesses.filter(b =>
    (b.name.toLowerCase().includes(term) ||
     b.description.toLowerCase().includes(term)) &&
    (lga.value === "" || b.lga === lga.value) &&
    (category.value === "" || b.category === category.value)
  );

  render(filtered);
}

search.addEventListener("input", filterBusinesses);
lga.addEventListener("change", filterBusinesses);
category.addEventListener("change", filterBusinesses);

render(businesses);
