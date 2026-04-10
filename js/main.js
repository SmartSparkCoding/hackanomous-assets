(function () {
  const config = window.ASSET_SITE_CONFIG;
  const grid = document.getElementById("assetGrid");

  if (!config || !Array.isArray(config.assets) || !grid) {
    return;
  }

  const { assetFolder, assets } = config;
  const modal = createModal();

  function makeAssetPath(slug, extension) {
    return `${assetFolder}/${slug}.${extension}`;
  }

  function setStatus(message, isError) {
    modal.status.textContent = message;
    modal.status.classList.toggle("is-error", Boolean(isError));
  }

  function openModal(asset, extension, path) {
    const format = extension.toUpperCase();
    modal.title.textContent = `${asset.title} (${format})`;
    modal.preview.src = path;
    modal.preview.alt = `${asset.title} ${format} preview`;
    modal.download.href = path;
    modal.download.download = `${asset.slug}.${extension}`;
    modal.copy.dataset.path = path;
    modal.copy.dataset.extension = extension;
    setStatus("", false);
    modal.overlay.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeModal() {
    modal.overlay.hidden = true;
    modal.preview.removeAttribute("src");
    document.body.classList.remove("modal-open");
  }

  async function copyAssetToClipboard(path, extension) {
    if (!navigator.clipboard) {
      throw new Error("Clipboard access is unavailable in this browser context.");
    }

    const response = await fetch(path);
    if (!response.ok) {
      throw new Error("Could not load the asset file.");
    }

    const blob = await response.blob();
    const fallbackUrl = new URL(path, window.location.href).href;

    if (window.ClipboardItem && navigator.clipboard.write) {
      const preferredType = extension === "svg" ? "image/svg+xml" : "image/png";
      const typedBlob = blob.type === preferredType ? blob : new Blob([blob], { type: preferredType });
      await navigator.clipboard.write([new ClipboardItem({ [preferredType]: typedBlob })]);
      return "Copied image to clipboard.";
    }

    await navigator.clipboard.writeText(fallbackUrl);
    return "Copied asset URL to clipboard.";
  }

  function createModal() {
    const overlay = document.createElement("div");
    overlay.className = "asset-modal-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="asset-modal" role="dialog" aria-modal="true" aria-labelledby="assetModalTitle">
        <button class="asset-modal-close" type="button" aria-label="Close popup">Close</button>
        <h2 class="asset-modal-title" id="assetModalTitle"></h2>
        <div class="asset-modal-preview-wrap">
          <img class="asset-modal-preview" alt="Asset preview" />
        </div>
        <p class="asset-modal-status" aria-live="polite"></p>
        <div class="asset-modal-actions">
          <a class="modal-action-btn" download>Download</a>
          <button class="modal-action-btn" type="button">Copy to Clipboard</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector(".asset-modal-close");
    const title = overlay.querySelector(".asset-modal-title");
    const preview = overlay.querySelector(".asset-modal-preview");
    const status = overlay.querySelector(".asset-modal-status");
    const download = overlay.querySelector(".modal-action-btn");
    const copy = overlay.querySelector(".asset-modal-actions button");

    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !overlay.hidden) {
        closeModal();
      }
    });

    copy.addEventListener("click", async () => {
      const path = copy.dataset.path;
      const extension = copy.dataset.extension;
      if (!path || !extension) {
        setStatus("Asset path is missing.", true);
        return;
      }

      setStatus("Copying...", false);
      try {
        const message = await copyAssetToClipboard(path, extension);
        setStatus(message, false);
      } catch (error) {
        setStatus(error.message || "Copy failed.", true);
      }
    });

    return {
      overlay,
      title,
      preview,
      status,
      download,
      copy
    };
  }

  function createCard(asset) {
    const pngPath = makeAssetPath(asset.slug, "png");
    const svgPath = makeAssetPath(asset.slug, "svg");

    const card = document.createElement("article");
    card.className = "asset-card";

    card.innerHTML = `
      <div class="asset-preview-wrap">
        <img class="asset-preview" src="${pngPath}" alt="${asset.title}" loading="lazy" />
      </div>
      <div class="asset-content">
        <h2 class="asset-title">${asset.title}</h2>
        <p class="asset-description">${asset.description}</p>
        <div class="asset-actions">
          <button class="download-btn" type="button" data-ext="png">PNG</button>
          <button class="download-btn" type="button" data-ext="svg">SVG</button>
        </div>
      </div>
    `;

    const img = card.querySelector(".asset-preview");
    img.addEventListener("error", () => {
      if (!img.dataset.fallbackUsed) {
        img.dataset.fallbackUsed = "true";
        img.src = svgPath;
      }
    });

    const pngButton = card.querySelector('button[data-ext="png"]');
    const svgButton = card.querySelector('button[data-ext="svg"]');

    pngButton.addEventListener("click", () => {
      openModal(asset, "png", pngPath);
    });

    svgButton.addEventListener("click", () => {
      openModal(asset, "svg", svgPath);
    });

    return card;
  }

  assets.forEach((asset) => {
    grid.appendChild(createCard(asset));
  });
})();
