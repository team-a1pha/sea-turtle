// Saves options to chrome.storage
function save_options() {
  var apiEndpoint = document.getElementById('apiEndpoint').value;
  var apiToken = document.getElementById('apiToken').value;
  chrome.storage.sync.set({
    apiEndpoint: apiEndpoint,
    apiToken: apiToken
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    apiEndpoint: '',
    apiToken: ''
  }, function(items) {
    document.getElementById('apiEndpoint').value = items.apiEndpoint;
    document.getElementById('apiToken').value = items.apiToken;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
