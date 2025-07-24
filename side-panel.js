/** @type {HTMLInputElement | null} */
const searchInput = /** @type {HTMLInputElement} */ (
  document.getElementById('search-input')
);
/** @type {HTMLDivElement | null} */
const searchResults = /** @type {HTMLDivElement} */ (
  document.getElementById('search-results')
);
/** @type {HTMLInputElement | null} */
const transparentBackground = /** @type {HTMLInputElement} */ (
  document.getElementById('transparent-background')
);

function loadApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['apiKey'], (result) => resolve(result.apiKey));
  });
}

searchInput?.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    search();
  }
});

async function search() {
  const query = searchInput?.value;
  if (!query || !searchResults) {
    return;
  }

  searchResults.innerHTML = 'Loading...';

  const apiKey = await loadApiKey();
  if (!apiKey) {
    alert('Please set your API key in the extension options!');
    searchResults.innerHTML = '';
    return;
  }

  const searchQuery = [query];
  if (transparentBackground?.checked) {
    searchQuery.push('transparent background');
  }

  const url = `https://api.search.brave.com/res/v1/images/search?q=${encodeURIComponent(
    searchQuery.join(' '),
  )}`;

  const response = await fetch(url, {
    headers: {
      'X-Subscription-Token': apiKey,
    },
  });

  const data = await response.json();
  displayResults(data.results);
}

function displayResults(results) {
  if (!searchResults) {
    return;
  }

  searchResults.innerHTML = '';
  results.forEach((result) => {
    const img = document.createElement('img');
    img.src = result.thumbnail.src;
    img.className =
      'cursor-pointer rounded-md hover:shadow-xl transition-shadow';
    img.addEventListener('click', () => {
      console.log(result, result.url);
    });
    searchResults.appendChild(img);
  });
}
