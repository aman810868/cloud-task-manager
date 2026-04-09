// A refined approach to fetching data from a dynamic API
// (Much better for a Cloud Computing PBL)

const genres = ['fiction', 'sci-fi', 'mystery', 'non-fiction', 'fantasy'];
let currentBooks = []; // This will hold the current list

async function fetchBooksByGenre(genre) {
    showLoading(true);
    try {
        const response = await fetch(`https://openlibrary.org/subjects/${genre}.json?limit=20&details=true`);
        const data = await response.json();
        
        // Open Library data is messy; we must clean it up
        currentBooks = data.works.map(work => ({
            title: work.title,
            author: work.authors[0]?.name || "Unknown Author",
            coverId: work.cover_id,
            overview: work.key // We will use the key to fetch the overview when clicked
        }));
        
        displayBooks(currentBooks);
    } catch (error) {
        console.error("Error fetching books:", error);
        document.getElementById('loading').innerHTML = "<p>⚠️ Error fetching data. Please try again later.</p>";
    }
}

function displayBooks(books) {
    const grid = document.getElementById('book-grid');
    grid.innerHTML = ''; // Clear the grid
    
    books.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        
        // Open Library Cover image URLs follow a simple pattern
        const coverUrl = book.coverId 
            ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg` 
            : 'https://via.placeholder.com/180x250?text=No+Cover';
            
        card.innerHTML = `
            <img src="${coverUrl}" alt="${book.title}">
            <div class="book-info">
                <h4>${book.title}</h4>
                <p>${book.author}</p>
            </div>
        `;
        card.onclick = () => showOverview(book);
        grid.appendChild(card);
    });
    showLoading(false);
}

// When a user clicks a book, we dynamically fetch the overview description
async function showOverview(book) {
    const modal = document.getElementById('book-modal');
    const body = document.getElementById('modal-body');
    
    body.innerHTML = '<h3>Loading Overview...</h3>';
    modal.style.display = 'block';

    try {
        const response = await fetch(`https://openlibrary.org${book.overview}.json`);
        const data = await response.json();
        const description = data.description || "No overview available for this title.";
        
        body.innerHTML = `
            <h2>${book.title}</h2>
            <h3>By ${book.author}</h3>
            <p>${description}</p>
        `;
    } catch (error) {
        body.innerHTML = '<h3>Could not load description.</h3>';
    }
}

function closeModal() {
    document.getElementById('book-modal').style.display = 'none';
}

function generateGenreSidebar() {
    const list = document.getElementById('genre-list');
    genres.forEach(genre => {
        const li = document.createElement('li');
        li.textContent = genre.charAt(0).toUpperCase() + genre.slice(1);
        li.onclick = (e) => filterGenre(e, genre);
        list.appendChild(li);
    });
    // Load the first genre by default
    document.querySelector('#genre-list li').classList.add('active');
    fetchBooksByGenre(genres[0]);
}

function filterGenre(event, genre) {
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    event.target.classList.add('active');
    fetchBooksByGenre(genre);
}

function showLoading(isLoading) {
    const loadingDiv = document.getElementById('loading');
    const gridDiv = document.getElementById('book-grid');
    if (isLoading) {
        loadingDiv.style.display = 'block';
        gridDiv.style.display = 'none';
    } else {
        loadingDiv.style.display = 'none';
        gridDiv.style.display = 'grid';
    }
}

// Initialize
generateGenreSidebar();
