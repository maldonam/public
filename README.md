# Cashy Oversight Challenge website

Static site for the UNHCR Innovation challenge on human oversight of AI-supported cash assistance targeting, part of the Data & Innovation for Refugee Inclusion Hackathon (UNHCR Innovation and the University of Trento).

No build step. Plain HTML, CSS and a small script that draws the data charts as inline SVG.

## Structure

```
index.html                      the whole site (one page, anchored sections)
assets/style.css                styles, colour tokens, light and dark mode
assets/site.js                  mobile nav + charts (summary stats embedded)
assets/cashy-icon.svg           Cashy mark (placeholder, see below)
assets/favicon.svg
data/S8.synthetic_cashy_sample.csv   the synthetic sample (1,900 rows, 26 columns)
docs/                           the challenge brief and the FAQ (DOCX)
scripts/summarize.py            recomputes the chart statistics from the CSV
.nojekyll                       tells GitHub Pages to serve files as-is
```

## Publish on GitHub Pages

1. Create a repository (for example `cashy-oversight-challenge`) in your organization and push this folder to the `main` branch.
2. In the repository, open Settings, then Pages. Under "Build and deployment" choose "Deploy from a branch", branch `main`, folder `/ (root)`. Save.
3. The site appears at `https://<org>.github.io/cashy-oversight-challenge/` within a minute or two. For a custom domain, add a `CNAME` file containing the domain and configure DNS as GitHub describes.

All links in the site are relative, so it works at the repository sub-path and on a custom domain alike.

## Things to fill in before launch

Search `index.html` for `TODO`. Each one is a dashed placeholder visible on the page:

- Registration link (hero button and the Event section)
- Event dates, venue and registration deadline (Event section)
- University of Trento contact and link (Team section)

## Cashy icon

`assets/cashy-icon.svg` is an original placeholder mark (an open ring with a check). Replace it with the official Cashy icon by overwriting that file and `assets/favicon.svg`; the site references them in the header, the hero and the browser tab.

## Charts

The five charts on the Data section are drawn from summary counts embedded in `assets/site.js`. To recompute them after changing the CSV:

```
pip install pandas
python scripts/summarize.py data/S8.synthetic_cashy_sample.csv
```

and paste the printed object over `STATS` in `assets/site.js`.

## Data note

The CSV is a synthetic sample. It contains no real household and should not be used to claim model performance. See the Data section of the site and the challenge brief for the terms of use.
