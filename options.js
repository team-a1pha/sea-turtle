/* global chrome */

/**
 * Retrieve all inputs/selects with the `data-option` attribute.
 * @returns {HTMLInputElement[]}
 */
function getOptionElements() {
  // Cast NodeList -> Array<HTMLInputElement>
  return /** @type {HTMLInputElement[]} */ (
    Array.from(document.querySelectorAll('[data-option]'))
  );
}

/**
 * Populate form inputs from values stored in chrome.storage.sync.
 */
function restoreOptions() {
  const elements = getOptionElements();
  if (elements.length === 0) return;

  const keys = elements.map((el) => /** @type {string} */ (el.dataset.option));
  chrome.storage.sync.get(keys, (stored) => {
    elements.forEach((el) => {
      const key = /** @type {string} */ (el.dataset.option);
      const value = stored[key];
      if (value === undefined) return;

      if (el.type === 'checkbox') {
        /** @type {HTMLInputElement} */ (el).checked = Boolean(value);
      } else {
        el.value = value;
      }
    });
  });
}

/**
 * Collect current form values and persist them to chrome.storage.sync.
 * @param {Event | undefined} event
 */
function saveOptions(event) {
  if (event) {
    event.preventDefault();
  }

  const elements = getOptionElements();
  const data = {};
  elements.forEach((el) => {
    const key = /** @type {string} */ (el.dataset.option);
    data[key] =
      el.type === 'checkbox'
        ? /** @type {HTMLInputElement} */ (el).checked
        : el.value.trim();
  });

  chrome.storage.sync.set(data, () => {
    // Simple visual feedback that options were saved.
    const saveBtn = /** @type {HTMLButtonElement | null} */ (
      document.getElementById('saveButton')
    );
    if (saveBtn) {
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Saved!';
      saveBtn.disabled = true;
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
      }, 1500);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  restoreOptions();

  const saveBtn = /** @type {HTMLButtonElement | null} */ (
    document.getElementById('saveButton') ||
      document.querySelector('button[type="submit"]')
  );
  if (saveBtn) {
    saveBtn.addEventListener('click', saveOptions);
  }
});
