(function () {
  const config = window.ASSET_SITE_CONFIG;
  const grid = document.getElementById("assetGrid");

  if (!config || !Array.isArray(config.assets) || !grid) {
    return;
  }

  const { assetFolder, assets } = config;

  function makeAssetPath(slug, extension) {
    return `${assetFolder}/${slug}.${extension}`;
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
          <a class="download-btn" href="${pngPath}" download>Download PNG</a>
          <a class="download-btn" href="${svgPath}" download>Download SVG</a>
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

    return card;
  }

  assets.forEach((asset) => {
    grid.appendChild(createCard(asset));
  });
})();
