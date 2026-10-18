# ENGSE203 Learning Dashboard

> LAB 02 — Modern JavaScript, Modules & Async Data

## Student Information

- Student ID: `<กรอกรหัสนักศึกษา>`
- Name: `<กรอกชื่อตามนโยบายรายวิชา>`
- Operating system: Windows
- GitHub Pages URL: `<เพิ่มหลัง Deploy สำเร็จ>`

## Project Overview

This project is a learning-task dashboard built with modern JavaScript ES modules and Vite. It loads learning-task data asynchronously from a JSON file and displays task statistics and task cards.

Main features:
- Load learning tasks asynchronously using Fetch API.
- Display task statistics for total, todo, doing, and done.
- Search tasks by title, topic, tags, or week.
- Filter tasks by status.
- Display loading, success, empty, and error messages.
- Simulate a loading error with the `?simulateError=1` query parameter.

## Installation and Run

Run these commands from this directory:

```bash
npm install
npm run check
npm run dev
```

Open the local URL printed by Vite in the terminal.

## Build and Preview

```bash
npm run build
npm run preview
```

The production build is generated in the `dist` directory. Generated files and `node_modules` should not be committed.

## Test Evidence

- Normal state screenshot: `evidence/normal-state.png`
- Error state screenshot: `evidence/error-state.png`

Capture and save these screenshots before submitting. Do not list a screenshot as completed until the file exists.

To test the error state, open the local development URL with `?simulateError=1` appended to it.

## Problems and Fixes

The dashboard needs to handle asynchronous requests and unsuccessful responses. The API module checks the HTTP response status and validates that the returned JSON is an array. Errors are caught by the main module and displayed to the user instead of leaving the dashboard without feedback.

The search and status filter are handled separately from the API module to keep data loading, filtering, and rendering responsibilities organized.

## References & AI Assistance

- Course starter files and LAB 02 instructions from the ENGSE203 course repository.
- AI assistance: used to help understand ES modules, asynchronous Fetch API error handling, filtering, rendering, and Git workflow. The implementation and behavior should be checked against the course requirements before submission.
