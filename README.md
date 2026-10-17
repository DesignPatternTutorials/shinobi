# Shinobi

A small practice project for learning Claude Code: a Bootstrap 5 blog that saves posts to a local JSON file, plus a Bootstrap controls showcase page.

## Run it

```
npm install
npm start
```

Then open http://localhost:3000.

Use `npm run dev` instead to restart the server automatically when you change `server.js`.

## Pages

- **Blog** (`/`): list, create, edit and delete posts.
- **Bootstrap Showcase** (`/showcase.html`): buttons, forms, cards, tables, tabs, modals, toasts and more.

## How it works

- `server.js` is an Express server. It serves the files in `public/` and provides a small REST API:
  - `GET /api/posts` lists posts
  - `GET /api/posts/:id` gets one post
  - `POST /api/posts` creates a post
  - `PUT /api/posts/:id` updates a post
  - `DELETE /api/posts/:id` deletes a post
- Posts are stored in `data/posts.json`. You can edit that file by hand too.
- `public/js/blog.js` calls the API and renders the posts with Bootstrap cards and modals.
