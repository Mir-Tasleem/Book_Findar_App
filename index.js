const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchType = document.getElementById("search-type");
const results = document.getElementById("results");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

// Google Books API base URL
const API_URL = "https://www.googleapis.com/books/v1/volumes?q=";
let currentQuery = "";
let currentType = "title";
let currentPage = 0; // Track the current page
const RESULTS_PER_PAGE = 10; // Google Books API returns a max of 10 results per request

// Event listeners
// Handle search on button click
searchBtn.addEventListener("click", () => {
  performSearch();
});

// Handle search when pressing Enter key
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    performSearch();
  }
});

// Common search logic
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

// Fetch books
async function searchBooks(query, type, page) {
  results.innerHTML = "<p>Loading...</p>";
  togglePaginationButtons(false); // Disable pagination buttons during loading

  try {
    const startIndex = page * RESULTS_PER_PAGE;
    const searchQuery = type === "author" ? `inauthor:${query}` : query;
    const response = await fetch(
      `${API_URL}${searchQuery}&startIndex=${startIndex}&maxResults=${RESULTS_PER_PAGE}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    displayResults(data.items);
    updatePaginationButtons(data.totalItems, page);
  } catch (error) {
    console.error(error);
    results.innerHTML = "<p>Error fetching books. Please try again.</p>";
  }
}

function displayResults(books) {
  results.innerHTML = ""; // Clear previous results
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
      <img src="${thumbnail}" alt="${bookInfo.title}">
      <div>
        <h3>${bookInfo.title}</h3>
        <p><strong>Author:</strong> ${
          bookInfo.authors?.join(", ") || "Unknown"
        }</p>
        <p><strong>Published:</strong> ${bookInfo.publishedDate || "N/A"}</p>
        <p>${
          bookInfo.description?.substring(0, 200) || "No description available"
        }...</p>
        <a href="${bookInfo.infoLink}" target="_blank">Read More</a>
      </div>
    `;

    results.appendChild(bookElement);
  });
}

function updatePaginationButtons(totalItems, page) {
  const totalPages = Math.ceil(totalItems / RESULTS_PER_PAGE);

  // Enable or disable buttons based on the current page and total items
  prevBtn.disabled = page <= 0;
  nextBtn.disabled = (page + 1) * RESULTS_PER_PAGE >= totalItems;
}

function togglePaginationButtons(enable) {
  prevBtn.disabled = !enable;
  nextBtn.disabled = !enable;
}
