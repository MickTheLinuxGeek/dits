# DITS GitHub Pages Site

This directory contains the GitHub Pages site for DITS (Developer Issue Tracking System).

## Setup Instructions

1. **Push to GitHub**: Make sure this `docs/` directory is pushed to your GitHub repository.

2. **Enable GitHub Pages**:
   - Go to your repository settings on GitHub
   - Scroll down to the "Pages" section in the left sidebar
   - Under "Source", select "Deploy from a branch"
   - Choose the branch containing this code (usually `main` or `master`)
   - Set the folder to `/docs`
   - Click "Save"

3. **Update GitHub Links**: 
   - Replace `yourusername` in the HTML files with your actual GitHub username
   - Update repository URLs to match your actual repository name

4. **Custom Domain** (Optional):
   - If you have a custom domain, add a `CNAME` file to this directory
   - The file should contain only your domain name (e.g., `dits.dev`)

## Files Structure

- `index.html` - Main landing page
- `styles.css` - CSS styling
- `favicon.svg` - Site favicon
- `.nojekyll` - Tells GitHub Pages to skip Jekyll processing
- `README.md` - This file

## Features

The landing page includes:

- **Hero section** with interactive terminal demo
- **Features showcase** highlighting DITS core principles
- **Comparison table** showing advantages over team tools
- **Architecture overview** with visual diagram
- **Platform support** information
- **Development roadmap** timeline
- **Call-to-action** sections

## Customization

To customize the site:

1. **Colors**: Update CSS custom properties in the `:root` section of `styles.css`
2. **Content**: Edit the HTML content in `index.html`
3. **Branding**: Replace the favicon and update meta descriptions

## Local Development

To test locally:

1. **Simple Method**: Open `index.html` directly in your browser
2. **HTTP Server** (recommended for proper testing):
   ```bash
   # Using Python
   cd docs/
   python3 -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```
   Then open `http://localhost:8000`

## Why No Jekyll?

This site is built as a static HTML/CSS/JS site without Jekyll for several reasons:
- **Faster deployment** - No build process required
- **Simpler setup** - Just push and it works
- **Better performance** - Pure static files load faster
- **Easier maintenance** - No Ruby dependencies or build system to manage
