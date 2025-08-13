(async function () {
  /**
   * @typedef {Object} StickerPack
   * @property {string} id - the id (folder name) of this sticker pack
   * @property {string} name - the name of this sticker pack
   * @property {string} thumbnail - the thumbnail file name of this sticker pack
   * @property {string[]} files - the file names of the stickers in this pack
   */

  /**
   * @type {StickerPack[]}
   */
  const stickerPacks = [
    {
      id: 'muscular-sailor',
      name: 'Muscular Sailor',
      thumbnail: 'thumbnail.png',
      files: ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png'],
    },
  ];

  function getStickerAssetUrl(packId, fileName) {
    return chrome.runtime.getURL(`assets/stickers/${packId}/${fileName}`);
  }

  function waitForElement(selector, root = document) {
    return new Promise((resolve) => {
      const existing = root.querySelector(selector);
      if (existing) {
        resolve(existing);
        return;
      }
      const observer = new MutationObserver(() => {
        const el = root.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });
      observer.observe(root, { childList: true, subtree: true });
    });
  }

  async function initStickersUI() {
    const [editor, navContainer, stickerBox] = await Promise.all([
      waitForElement('.seatalk-editor > [contenteditable="true"]'),
      waitForElement('.sealabs-stickers-panel .sticker-nav-content'),
      waitForElement('.sealabs-stickers-panel .sticker-box'),
    ]);

    if (!navContainer || !stickerBox) return;
    if (navContainer.dataset.sealabsStickersInitialized === 'true') return;
    navContainer.dataset.sealabsStickersInitialized = 'true';

    // Build thumbnails
    stickerPacks.forEach((pack, index) => {
      const tab = document.createElement('div');
      tab.className = 'tab';
      tab.style.backgroundImage = `url("${getStickerAssetUrl(
        pack.id,
        pack.thumbnail,
      )}")`;
      tab.dataset.packId = pack.id;
      navContainer.appendChild(tab);
    });

    // Build sticker grids
    stickerPacks.forEach((pack, index) => {
      const grid = document.createElement('div');
      grid.className = 'sticker-grid-box';
      grid.style.top = `50px`;
      grid.style.bottom = `0`;
      grid.style.left = `0`;
      grid.style.right = `0`;
      grid.style.overflow = 'auto';
      grid.style.padding = '10px';
      grid.style.backgroundColor = '#f2f2f6';
      grid.dataset.packId = pack.id;

      pack.files.forEach((fileName) => {
        const item = document.createElement('div');
        item.className = 'sealabs-sticker';
        const img = document.createElement('img');
        const targetUrl = getStickerAssetUrl(pack.id, fileName);
        item.dataset.stickerUrl = targetUrl;
        img.src = targetUrl;
        img.alt = '';
        item.appendChild(img);
        grid.appendChild(item);
      });

      stickerBox.appendChild(grid);
    });

    // Click handling: switch selected grid
    navContainer.addEventListener('click', (event) => {
      const tab = event.target.closest('.tab');
      if (!tab) return;

      // update selected class on all tabs
      navContainer.querySelectorAll('.tab').forEach((el) => {
        el.classList.remove('selected');
      });
      tab.classList.add('selected');

      // update selected class on all grids
      stickerBox.querySelectorAll('.sticker-grid-box').forEach((el) => {
        el.classList.remove('selected');
      });

      const packId = tab.dataset.packId;
      if (!packId) return;
      const targetGrid = stickerBox.querySelector(
        `.sticker-grid-box[data-pack-id="${packId}"]`,
      );
      if (targetGrid) {
        targetGrid.classList.add('selected');
      }
    });

    // Click handling: paste sticker
    stickerBox.addEventListener('click', async (event) => {
      const sticker = event.target.closest('.sealabs-sticker');
      if (!sticker) return;
      const stickerUrl = sticker.dataset.stickerUrl;
      if (!stickerUrl) return;

      try {
        const response = await fetch(stickerUrl);
        const imageBlob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': imageBlob,
          }),
        ]);

        editor.focus();

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(
          new File([imageBlob], 'sticker.png', { type: 'image/png' }),
        );
        const pasteEvent = new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          composed: true,
          clipboardData: dataTransfer,
        });
        editor.dispatchEvent(pasteEvent);

        setTimeout(() => {
          const sendButton = document.querySelector(
            '.send-message-dropdown-button-container > button',
          );
          if (sendButton) {
            sendButton.click();
          }
        }, 100);
      } catch (err) {
        console.error('Failed to paste sticker: ', err);
      }
    });
  }

  initStickersUI().catch(() => {});
})();
