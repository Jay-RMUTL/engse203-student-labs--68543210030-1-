# ENGSE203 LAB 3 — Responsive Web UI & Form Interaction

## Overview

A responsive Campus Service Request form built with semantic HTML, CSS and vanilla JavaScript using Vite.

## Requirements

- Node.js 22.12 or newer
- npm

## Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Verify and build

```bash
npm run check
npm run build
npm run preview
```

## Features

- Responsive one-column layout on small screens and two-column layout on wider screens.
- Semantic form controls, associated labels, keyboard focus styles and accessible validation messages.
- Live preview updates as the user types or changes the request type.
- Input validation for name, request type and details.
- Invalid submission keeps the entered values and focuses the first invalid field.
- Successful submission adds a request to the on-page list and resets the form.
- User-provided text is rendered with `textContent` or text nodes rather than HTML injection.

## Manual test checklist

1. Open the page at a 375px-wide mobile viewport; confirm there is no horizontal page overflow.
2. Open the page at desktop width; confirm the form and preview are side by side.
3. Type a name and details; confirm the preview and character counter update.
4. Submit an empty form; confirm field-level errors appear and the form is not reset.
5. Enter a one-character name and details shorter than 10 characters; confirm validation errors.
6. Submit a valid request; confirm it appears in the list and the form resets.
7. Enter text containing `<script>` in a field; confirm it appears as text and does not execute.
8. Navigate using the keyboard and confirm focus indicators are visible.

## Evidence

Record actual test results and add screenshots in `../evidence/` after running the application.
