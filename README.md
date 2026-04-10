# hackanomous-assets
A place where all Hackanomous' YSWS assets are. 

## Asset Site

This repo now includes a static Asset Site built with HTML/CSS/JS.

### Structure

- `index.html` - page layout
- `css/styles.css` - styling and responsive grid
- `js/assets.config.js` - single place to edit asset entries
- `js/main.js` - renders cards from config
- `assets/` - place `asset1.png`, `asset1.svg`, `asset2.png`, `asset2.svg`, etc.

### How to add/edit assets

1. Add image files in `assets/` with matching names (for example `asset3.png` and `asset3.svg`).
2. Add one object for that asset inside `js/assets.config.js`:

```js
{
	slug: "asset3",
	title: "Asset 3",
	description: "Short description here."
}
```

The site automatically renders all assets listed in the config and the grid adapts to window size.
