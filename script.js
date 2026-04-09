const genres = ['fiction', 'science_fiction', 'mystery', 'history', 'fantasy', 'horror', 'romance'];
let allFetchedBooks = []; // This acts as our "Local Cloud Cache"

async function fetchBooksByGenre(genre) {
    showLoading(true);
    const grid = document.getElementById('book-grid');
    grid.innerHTML = ''; 

    try {
        const response = await fetch(`https://openlibrary.org/subjects/${genre.toLowerCase()}.json?limit=24`);
        const data = await response.json();
        
        // Map and store books so the search bar can find them
        allFetchedBooks = data.works.map(work => ({
            key: work.key,
            title: work.title,
            author: work.authors[0]?.name || "Unknown Author",
            cover_id: work.cover_id,
            searchString: `${work.title} ${work.authors[0]?.name}`.toLowerCase()
        }));
        
        renderGrid(allFetchedBooks);
    } catch (error) {
        console.error("Cloud Fetch Error:", error);
        grid.innerHTML = `<p>⚠️ Connection lost. Retrying...</p>`;
    } finally {
        showLoading(false);
    }
}

// Separate render function so search can use it too
function renderGrid(booksToDisplay) {
    const grid = document.getElementById('book-grid');
    grid.innerHTML = '';

    if (booksToDisplay.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                            <p style="color: var(--text-dim);">No books match your search in this genre.</p>
                          </div>`;
        return;
    }

    booksToDisplay.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        const coverUrl = book.cover_id 
            ? `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg` 
            : 'https://via.placeholder.com/220x320?text=No+Cover';
            
        card.innerHTML = `
            <img src="${coverUrl}" loading="lazy" alt="${book.title}">
            <div class="book-info">
                <h4>${book.title}</h4>
                <p>${book.author}</p>
            </div>
        `;
        // Pass the specific book object to the overview function
        card.onclick = () => showOverview(book);
        grid.appendChild(card);
    });
}

// FIXED SEARCH: Now filters through the current genre's cache
function searchBooks() {
    const term = document.getElementById('search-input').value.toLowerCase().trim();
    if (!term) {
        renderGrid(allFetchedBooks);
        return;
    }
    const filtered = allFetchedBooks.filter(b => b.searchString.includes(term));
    renderGrid(filtered);
}

// FIXED OVERVIEW: Fetches the actual description from the OpenLibrary API
async function showOverview(book) {
    const modal = document.getElementById('book-modal');
    const body = document.getElementById('modal-body');
    
    // Show the modal immediately with a loader
    modal.style.display = 'flex';
    body.innerHTML = `
        <div style="text-align:center; padding: 20px;">
            <div class="spinner"></div>
            <p>Fetching book details from the cloud...</p>
        </div>
    `;

    try {
        // We fetch the specific book's JSON data using its unique key
        const response = await fetch(`https://openlibrary.org${book.key}.json`);
        const data = await response.json();
        
        // Handle different description formats (OpenLibrary sometimes returns an object, sometimes a string)
        let description = "No detailed overview available for this specific edition.";
        if (data.description) {
            description = typeof data.description === 'string' ? data.description : (data.description.value || description);
        }

        body.innerHTML = `
            <div class="overview-layout">
                <h2 style="color: var(--accent); margin-top: 0;">${book.title}</h2>
                <p style="font-weight: bold; margin-bottom: 20px;">By ${book.author}</p>
                <div style="max-height: 400px; overflow-y: auto; padding-right: 10px; line-height: 1.6; color: #cbd5e1;">
                    <p>${description}</p>
                </div>
                <button onclick="closeModal()" style="margin-top: 20px; padding: 10px 20px; background: var(--accent); border: none; color: white; border-radius: 8px; cursor: pointer;">Close Overview</button>
            </div>
        `;
    } catch (e) {
        body.innerHTML = `<h2>Error</h2><p>Could not load the overview at this time.</p>`;
    }
}

function closeModal() {
    document.getElementById('book-modal').style.display = 'none';
}

// Initialize Sidebar and first fetch
function init() {
    const list = document.getElementById('genre-list');
    genres.forEach((genre, index) => {
        const li = document.createElement('li');
        li.textContent = genre.replace('_', ' ').toUpperCase();
        if (index === 0) li.classList.add('active');
        li.onclick = (e) => {
            document.querySelectorAll('.sidebar li').forEach(el => el.classList.remove('active'));
            li.classList.add('active');
            fetchBooksByGenre(genre);
        };
        list.appendChild(li);
    });
    fetchBooksByGenre(genres[0]);
}

function showLoading(isLoading) {
    document.getElementById('loading').style.display = isLoading ? 'block' : 'none';
    document.getElementById('book-grid').style.display = isLoading ? 'none' : 'grid';
}

window.onclick = (e) => { if (e.target.id === 'book-modal') closeModal(); }

init();
