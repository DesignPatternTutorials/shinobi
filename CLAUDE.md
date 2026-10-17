# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Shinobi is a small practice project for learning Claude Code: a Bootstrap 5 blog backed by a JSON file, plus a static Bootstrap controls showcase page.

## Commands

- `npm install`: install dependencies (Express is the only one)
- `npm start`: run the server at http://localhost:3000 (set `PORT` to change it)
- `npm run dev`: run with `node --watch`, which restarts when `server.js` changes. Files in `public/` are served statically, so a browser refresh picks them up without a restart.

There is no build step, linter or test suite.

## Git workflow

- Never commit or push directly to `main`. `main` only receives merges from `develop`.
- `develop` is the integration branch. Do all work on a feature branch created from `develop`, named `feature/<short-description>` (or `fix/<short-description>` for bug fixes).
- Push the feature branch and open a pull request into `develop`. Do not merge it yourself unless asked.
- Use Conventional Commits for every commit message: `<type>(<optional scope>): <summary>`. Types are `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`, `ci` and `perf`. Mark a breaking change with `!` after the type or with a `BREAKING CHANGE:` footer.

## Architecture

- **`server.js`**: a single Express app (CommonJS). It serves `public/` statically and exposes a REST API under `/api/posts` (list, get, create, update, delete). Every request reads and rewrites the whole of `data/posts.json` synchronously; there is no database or cache. `validatePost` requires a non-empty `title`, `author` and `body`. The server generates `id` (`crypto.randomUUID()`), `createdAt` and `updatedAt` (ISO strings). The list endpoint sorts newest first by `createdAt`.
- **`data/posts.json`**: the data store, an array of post objects. It is committed to git and can be edited by hand, so running the app and creating, editing or deleting posts changes a tracked file.
- **`public/index.html` + `public/js/blog.js`**: the blog UI. It is plain browser JS with no framework or bundler. `blog.js` fetches the API through the `api()` helper, which throws using the server's `{ error }` message. It renders cards by building HTML template strings, so all user content must go through `escapeHtml()`. Create and edit share one modal (`#postModal`, with a hidden `postId` field that decides between POST and PUT). Card buttons are handled by one delegated click listener on `#postList` that reads the `data-action` and `data-id` attributes.
- **`public/showcase.html`**: a standalone demo of Bootstrap components, with only a small inline script. That script sets up tooltips and popovers (Bootstrap makes you turn these on yourself), the demo toast and the range readout. It does not use the API.
- **Front-end dependencies**: Bootstrap 5.3.3 and Bootstrap Icons 1.11.3 load from the jsDelivr CDN in each HTML page and are not npm packages. Custom styles are in `public/css/style.css`. Both pages repeat the same navbar markup, so a nav change must be made in both files.
