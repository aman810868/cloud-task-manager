const genres = ['fiction', 'science_fiction', 'mystery', 'history', 'fantasy', 'horror', 'romance'];
let allFetchedBooks = []; 

async function fetchBooksByGenre(genre) {
    showLoading(true);
    try {
        const response = await fetch(`https://openlibrary.org/subjects/${genre.toLowerCase()}.json?limit=24`);
        const data = await response.json();
        
        allFetchedBooks = data.works.map(work => ({
            ...work,
            searchString: `${work.title} ${work.authors[0]?.name}`.toLowerCase()
        }));
        
        renderGrid(allFetchedBooks);
    } catch (error) {
        console.error("Cloud Fetch Error:", error);
    } finally {
        showLoading(false);
    }
}

function renderGrid(books) {
    const grid = document.getElementById('book-grid');
    grid.innerHTML = books.length ? '' : '<p>No books found for that search.</p>';

    books.forEach(work => {
        const card = document.createElement('div');
        card.className = 'book-card';
        const coverUrl = work.cover_id 
            ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg` 
            : 'https://via.placeholder.com/220x320?text=No+Cover';
            
        card.innerHTML = `
            <img src="${coverUrl}" loading="lazy" alt="${work.title}">
            <div class="book-info">
                <h4>${work.title}</h4>
                <p>${work.authors[0]?.name || "Unknown Author"}</p>
            </div>
        `;
        card.onclick = () => showOverview(work);
        grid.appendChild(card);
    });
}

function searchBooks() {
    const term = document.getElementById('search-input').value.toLowerCase();
    const filtered = allFetchedBooks.filter(b => b.searchString.includes(term));
    renderGrid(filtered);
}

// Reuse previous showOverview and Modal functions...
async function showOverview(work) {
    const modal = document.getElementById('book-modal');
    const body = document.getElementById('modal-body');
    modal.style.display = 'flex'; // Changed to flex for centering
    modal.style.alignItems = 'center';
    body.innerHTML = '<h2>Fetching Details...</h2>';

    try {
        const response = await fetch(`https://openlibrary.org${work.key}.json`);
        const data = await response.json();
        const desc = typeof data.description === 'string' ? data.description : (data.description?.value || "A timeless masterpiece.");

        body.innerHTML = `
            <h2 style="color:var(--accent)">${work.title}</h2>
            <p><strong>By ${work.authors[0]?.name}</strong></p>
            <hr style="opacity:0.1; margin: 20px 0;">
            <p style="line-height:1.8">${desc}</p>
        `;
    } catch (e) { body.innerHTML = '<h2>Description unavailable.</h2>'; }
}

function generateGenreSidebar() {
    const list = document.getElementById('genre-list');
    genres.forEach((genre, index) => {
        const li = document.createElement('li');
        li.textContent = genre.replace('_', ' ').toUpperCase();
        if (index === 0) li.classList.add('active');
        li.onclick = () => {
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

function closeModal() { document.getElementById('book-modal').style.display = 'none'; }
window.onclick = (e) => { if (e.target.id === 'book-modal') closeModal(); }

generateGenreSidebar();
