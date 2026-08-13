# GitHub Pages Public Website

This repository includes a GitHub Actions workflow that publishes the organization’s public Hackfinity website to GitHub Pages whenever changes are pushed to `main`.

## Verified organization links

The project is owned by the **St-John-s-Hackfinity-2026** GitHub organization. Use these links when sharing or administering the public website:

| Resource | Link |
|---|---|
| GitHub Pages public website | https://st-john-s-hackfinity-2026.github.io/hackfinity-26-pages-preview/ |
| GitHub Pages repository | https://github.com/St-John-s-Hackfinity-2026/hackfinity-26-pages-preview |
| Organization-managed website source | https://github.com/St-John-s-Hackfinity-2026/hackfinity-26-website-source |

## Activate it on GitHub

Open the repository, choose **Settings → Pages**, and select **GitHub Actions** as the publishing source. Then open the **Actions** tab and run **Deploy GitHub Pages Preview** once, or push a commit to `main`. When the workflow finishes, GitHub shows the published URL in the workflow summary and on **Settings → Pages**.

## Live-service architecture

GitHub Pages hosts the public website’s static interface, including its visual design, animation, countdown, FAQ, prizes, and registration layout. Secure registration submission, organizer authentication, the database, live squad counts, and Google Sheets sync are handled by the connected live event service. The public registration section contains a direct link to that service.

| Feature | GitHub Pages public website | Connected live event service |
|---|---|---|
| Website design and motion | Available | Available |
| Countdown and visual form | Available | Available |
| Registration submission | Not available | Available |
| Organizer dashboard | Not available | Available |
| Database and Google Sheets sync | Not available | Available |
