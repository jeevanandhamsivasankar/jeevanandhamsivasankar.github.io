# S. Jeevanandham — Portfolio

Personal portfolio of **S. Jeevanandham**, Senior HMI Engineer (Qt/QML, Embedded C++, automotive & medical device HMI).

**Live site:** https://jeevanandhamsivasankar.github.io

Built with [React](https://react.dev) and [Vite](https://vite.dev). Features a day/night theme that follows sunrise and sunset in Chennai, an animated hero gauge, and sections for experience, skills, projects, design work, education, certifications and resume.

## Development

```bash
npm install
npm run dev       # start the dev server at http://localhost:5173
npm run lint      # run ESLint
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## Deployment

The site is served by GitHub Pages from the `gh-pages` branch:

```bash
npm run build
npm run deploy    # publishes dist/ to the gh-pages branch
```

## Project structure

```
index.html              page shell, SEO / social meta tags, fonts
src/main.jsx            React entry point
src/App.jsx             all sections, styles, and content data
public/                 static assets (favicon, profile photo, resume PDF)
```

Content such as experience, skills, projects and certifications lives in the data constants near the top of `src/App.jsx` (`EXPERIENCE`, `SKILL_CATEGORIES`, `PROJECTS`, `CERTS`, …).
