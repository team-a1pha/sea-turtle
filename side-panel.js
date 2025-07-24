/* global chrome */

const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const largeSize = document.getElementById('large-size');
const transparentBackground = document.getElementById('transparent-background');

let apiKey;

chrome.storage.sync.get(['apiKey'], (result) => {
  apiKey = result.apiKey;
});

searchInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    search();
  }
});

async function search() {
  const query = searchInput.value;
  if (!query) {
    return;
  }

  let url = `https://api.search.brave.com/res/v1/images/search?q=${query}`;
  if (largeSize.checked) {
    url += '&size=large';
  }
  if (transparentBackground.checked) {
    url += '&transparent=true';
  }

  const response = await fetch(url, {
    headers: {
      'X-Subscription-Token': apiKey,
    },
  });

  const data = await response.json();
  displayResults(data.results);
}

function displayResults(results) {
  searchResults.innerHTML = '';
  results.forEach((result) => {
    const img = document.createElement('img');
    img.src = result.thumbnail.src;
    img.addEventListener('click', () => {
      console.log(result.url);
    });
    searchResults.appendChild(img);
  });
}
