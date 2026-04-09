const genres = ['fiction', 'science_fiction', 'mystery', 'history', 'fantasy'];

async function fetchBooksByGenre(genre) {
    showLoading(true);
    const grid = document.getElementById('book-grid');
    grid.innerHTML = ''; 

    try {
        // Updated URL to use underscore for science_fiction
        const response = await fetch(`https://openlibrary.org/subjects/${genre.toLowerCase()}.json?limit=20`);
        const data = await response.json();
        
        if (!data.works || data.works.length === 0) {
            throw new Error("No books found");
        }

        data.works.forEach(work => {
            const card = document.createElement('div');
            card.className = 'book-card';
            const coverUrl = work.cover_id 
                ? `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg` 
                : 'https://via.placeholder.com/200x280?text=No+Cover';
                
            card.innerHTML = `
                <img src="${coverUrl}" alt="${work.title}" onerror="this.src='https://via.placeholder.com/200x280?text=Cover+Error'">
                <div class="book-info">
                    <h4>${work.title}</h4>
                    <p>${work.authors[0]?.name || "Unknown Author"}</p>
                </div>
            `;
            card.onclick = () => showOverview(work);
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Fetch Error:", error);
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">⚠️ Failed to load books. Please try a different genre.</p>`;
    } finally {
        showLoading(false);
    }
}

async function showOverview(work) {
    const modal = document.getElementById('book-modal');
    const body = document.getElementById('modal-body');
    modal.style.display = 'block';
    body.innerHTML = '<h2>Loading description...</h2>';

    try {
        const response = await fetch(`https://openlibrary.org${work.key}.json`);
        const data = await response.json();
        let description = "No description available for this classic.";
        
        if (typeof data.description === 'string') description = data.description;
        else if (data.description?.value) description = data.description.value;

        body.innerHTML = `
            <h2>${work.title}</h2>
            <p style="color: var(--accent); font-weight: bold;">${work.authors[0]?.name}</p>
            <div style="max-height: 300px; overflow-y: auto; margin-top: 15px;">
                <p>${description}</p>
            </div>
        `;
    } catch (e) {
        body.innerHTML = '<h2>Error loading details.</h2>';
    }
}

function generateGenreSidebar() {
    const list = document.getElementById('genre-list');
    list.innerHTML = '';
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
    const loadingDiv = document.getElementById('loading');
    const gridDiv = document.getElementById('book-grid');
    loadingDiv.style.display = isLoading ? 'block' : 'none';
    gridDiv.style.display = isLoading ? 'none' : 'grid';
}

function closeModal() { document.getElementById('book-modal').style.display = 'none'; }

// Close modal when clicking outside of it
window.onclick = (event) => {
    if (event.target == document.getElementById('book-modal')) closeModal();
}

generateGenreSidebar();
