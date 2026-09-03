# Blog Platform — Reader/Author CMS with Express, EJS & SQLite

A full-stack blog/content-management web application built on a three-tier architecture (client, logic, data), letting readers browse and comment on published articles while authors draft, edit, publish, and format their own content with a rich text editor. Built as a midterm coursework project extending a provided Node.js/Express/SQLite template with a custom schema, routes, and two major feature extensions.

## Contents

| File / Folder | Description |
|---|---|
| `index.js` | Main Express server — all application routes (home, author/reader pages, drafts, publishing, comments, article view). |
| `db_schema.sql` | SQLite schema and seed data for `Users`, `Articles`, `Drafts`, and `Comments` tables. |
| `routes/users.js` | Example/template router showing the suggested pattern for structuring routes and querying the database. |
| `routes/custom.js` | Client-side helper script (`copyToClipboard`) for sharing article links. |
| `views/` | EJS templates for every page: home, readers page, authors page, author settings, create/edit draft, edit published article, and article + comments view. |
| `public/main.css` | Site-wide stylesheet. |
| `package.json` | Project dependencies and npm scripts (`build-db`, `clean-db`, `start`). |
| `report.pdf` | Write-up covering architecture overview and extension descriptions (rich text editor, inline CSS styling). |

## How It Works

### Architecture

The application follows a three-tier structure:

- **Client tier (Views)** — EJS templates rendering HTML/CSS/JavaScript for every page a user sees.
- **Logic tier (Server)** — an Express.js server whose `Routes` handle incoming requests, pass them to controller-style route handlers, and return rendered views.
- **Data tier** — a SQLite database (`database.db`, built from `db_schema.sql`) storing users, articles, drafts, and comments.

Requests flow from Views → Routes → Controller logic → Model (SQL queries) → SQLite, with responses flowing back the same path to render the appropriate EJS view.

### Core Functionality

1. **Role-based landing** — the home page (`/`) lists all published articles and offers a role selector (reader or author) that redirects (`POST /redirect`) to `/readers_page` or `/authors_page` accordingly.
2. **Reader flow** — `/readers_page` lists published articles; clicking into one (`/article-id?id=...`) shows the full article plus its comments, and readers can submit new comments (`POST /submit-comment`).
3. **Author flow** — `/authors_page` lists both published articles and drafts. Authors can:
   - Create a new draft (`GET /create_draft`, `POST /create-draft`).
   - Edit an existing draft (`GET /edit_draft`, `POST /changed-draft`) or a published article (`GET /edit_published`, `POST /changed-published`).
   - Publish a draft, which copies it into `Articles` and removes it from `Drafts` (`POST /publish-draft`).
   - Delete a draft (`POST /delete-draft`).
   - View/update author settings (`GET /author_settings`).
4. **User accounts** — new users can be created from the home page form (`POST /home`), stored in the `Users` table with an `is_author` flag distinguishing readers from authors.
5. **Database layer** — all tables (`Users`, `Articles`, `Drafts`, `Comments`) are defined in `db_schema.sql` with foreign key constraints enabled, and seeded with sample data for testing.

### Feature Extensions

**Rich text editor (Quill.js)** — integrated into the article/comment creation flow to give authors a WYSIWYG editing experience:
- The Quill stylesheet and scripts are included directly in the relevant EJS views.
- An editor instance is initialized against a target DOM element with a customized toolbar (bold, italic, underline, strike, ordered/bullet lists, links, images, clean).
- On form submission, the editor's HTML content (`quill.root.innerHTML`) is written into a hidden input so it's captured and stored in the database alongside the rest of the form data.

**Inline CSS styling** — authors can apply inline styles (bold, italic, underline, text color) to their content, with page-wide CSS chosen for a simple, relaxed visual style across all views, implemented directly in the EJS templates.

## Usage

1. Install [Node.js](https://nodejs.org/en/) (latest LTS recommended) and SQLite3.
2. Run `npm install` from the project directory to install dependencies (Express, EJS, sqlite3).
3. Build the database:
   - Mac/Linux: `npm run build-db`
   - Windows: `npm run build-db-win`
4. Start the server: `npm run start`, then visit `http://localhost:3000`.
5. From the home page, choose **Reader** or **Author** to explore the corresponding flow, or create a new account via the sign-up form.
6. To reset the database during development:
   - Mac/Linux: `npm run clean-db`
   - Windows: `npm run clean-db-win`
   — then rebuild with `build-db` again.

## Summary

The application implements a robust three-tier structure for handling user interaction, server-side logic, and persistent storage. The Quill.js rich text editor gives authors a powerful, intuitive content-creation tool, while inline CSS styling adds a layer of customization to article presentation. Together with the draft/publish workflow and reader commenting, the project provides a solid foundation for a lightweight blogging platform with room for further scaling.

## Skills Demonstrated

- Server-side web development with Node.js, Express, and EJS templating
- Relational database design and querying with SQLite (foreign keys, joins across Articles/Drafts/Comments/Users)
- RESTful-style route design for CRUD operations (create, read, update, delete, publish)
- Third-party library integration (Quill.js rich text editor, Bootstrap)
- Three-tier (client/logic/data) application architecture
- Form handling and server-side data persistence with `body-parser`
