const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchType = document.getElementById("search-type");
const results = document.getElementById("results");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const themeToggle = document.getElementById("theme-toggle");

// Google Books API base URL
const API_URL = "https://www.googleapis.com/books/v1/volumes?q=";
let currentQuery = "";
let currentType = "title";
let currentPage = 0; // Track the current page
const RESULTS_PER_PAGE = 10; // Google Books API returns a max of 10 results per request

// Toggle dark mode
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  // Change the icon of the toggle button
  if (document.body.classList.contains("dark-theme")) {
    themeToggle.textContent = "🌞"; // Light mode icon
  } else {
    themeToggle.textContent = "🌙"; // Dark mode icon
  }
});

// Event listeners
searchBtn.addEventListener("click", () => {
  performSearch();
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    performSearch();
  }
});

function performSearch() {
  const query = searchInput.value.trim();
  const type = searchType.value;

  if (query) {
    currentQuery = query;
    currentType = type;
    currentPage = 0; // Reset to first page
    searchBooks(query, type, currentPage);
  } else {
    alert("Please enter a search term");
  }
}

prevBtn.addEventListener("click", () => {
  if (currentPage > 0) {
    currentPage--;
    searchBooks(currentQuery, currentType, currentPage);
  }
});

nextBtn.addEventListener("click", () => {
  currentPage++;
  searchBooks(currentQuery, currentType, currentPage);
});

async function searchBooks(query, type, page) {
  results.innerHTML = "<p>Loading...</p>";

  try {
    const startIndex = page * RESULTS_PER_PAGE;
    const searchQuery = type === "author" ? `inauthor:${query}` : query;
    const response = await fetch(
      `${API_URL}${searchQuery}&startIndex=${startIndex}&maxResults=${RESULTS_PER_PAGE}`
    );

    if (!response.ok) throw new Error("HTTP error! Status: " + response.status);

    const data = await response.json();
    displayResults(data.items);
    updatePaginationButtons(data.totalItems, page);
  } catch (error) {
    console.error(error);
    results.innerHTML = "<p>Error fetching books. Please try again.</p>";
  }
}

function displayResults(books) {
  results.innerHTML = "";
  if (!books || books.length === 0) {
    results.innerHTML = "<p>No results found</p>";
    return;
  }

  books.forEach((book) => {
    const bookInfo = book.volumeInfo;
    const bookElement = document.createElement("div");
    bookElement.className = "book";

    const thumbnail =
      bookInfo.imageLinks?.thumbnail ||
      "https://via.placeholder.com/100x150?text=No+Image";

    bookElement.innerHTML = `
      <img src="${thumbnail}" alt="${bookInfo.title}" />
      <div class="book-details">
        <h3>${bookInfo.title}</h3>
        <p>by ${bookInfo.authors?.join(", ") || "Unknown"}</p>
        <p>${bookInfo.description || "No description available."}</p>
      </div>
    `;

    results.appendChild(bookElement);
  });
}

function updatePaginationButtons(totalItems, currentPage) {
  const totalPages = Math.ceil(totalItems / RESULTS_PER_PAGE);

  // Enable or disable buttons based on the current page and total pages
  prevBtn.disabled = currentPage === 0;
  nextBtn.disabled = currentPage >= totalPages - 1;
}
