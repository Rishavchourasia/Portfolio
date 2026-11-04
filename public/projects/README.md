Project screenshots, one folder per project (WebP, 1600×1000, 16:10).

List them in `src/content/projects.json` under the project's `screens`, in slider order:

```json
"screens": [{ "src": "/projects/your-project/home.webp", "caption": "Home" }]
```

The caption shows in the preview's address bar and is the screenshot's alt text.
A project without `screens` falls back to a generated gradient placeholder.
Add an `architecture` block (nodes + edges) to get the animated Architecture tab.
