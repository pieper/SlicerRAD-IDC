# SlicerRAD-IDC

A **stable, read-only web viewer for the [NCI Imaging Data Commons (IDC)](https://imaging.datacommons.cancer.gov/)**,
built on the SlicerLive WebGPU renderer and the IHE Radiology **Basic Image Review (BIR)** tool set.
It is a drop-in for OHIF-style IDC deep links: paste an IDC study URL and it opens the study in a
zero-install 4-up MPR + 3D reader.

**Live:** https://pieper.github.io/SlicerRAD-IDC/

> For Investigational Use Only — Not for Diagnostic Use.

## Why a separate repo

This is a **pinned, selectively-updated** distribution of the SlicerLive BIR reader. SlicerLive
(the renderer + demos) moves fast; SlicerRAD-IDC intentionally does **not** float with it. The
exact renderer version is pinned via the `vendor/SlicerLive` git submodule, so an IDC deployment
stays stable until someone deliberately takes an update.

## What's different from the SlicerLive demo

- **Measurements are disabled** (no Distance / Angle annotations). There is no annotation
  persistence yet, so the tools are hidden to avoid work the user can't save. Everything else in
  the BIR tool set stays: scroll, window/level, zoom, pan, select viewport, crosshair, layouts,
  cine, invert, reset, print.
- **Share and Download are kept** — copy an IDC-portal-style deep link, or stream the study's
  DICOM to a local folder.
- **Full-study series panel (OHIF-style):** a left thumbnail strip lists every series in the
  study (image stacks + SEG + SR/RTSTRUCT/…), ordered by series number, with real per-series
  previews. Click a series to load it — this works even when you arrive by a series-level URL
  (`SeriesInstanceUIDs`), so the whole study is always browsable.
- **Patient/study browser links removed** — this viewer is study-scoped; the series panel is the
  navigation surface.
- Volume-rendering presets (Slicer/OHIF CT presets, thumbnails rendered on the fly) and the VR
  shift slider are carried forward.

## URL parameters (OHIF / IDC-portal compatible)

```
# OHIF / IDC-portal form
?StudyInstanceUIDs=<uid>[,<uid>]&SeriesInstanceUIDs=<uid,...>&initialSeriesInstanceUID=<uid>

# IHE Invoke Image Display (IID) form
?requestType=STUDY&studyUID=<uid>&seriesUID=<uid>

# index-free direct form (opens straight from the IDC S3 bucket)
?series=<crdc_series_uuid>&bucket=idc-open-data[&seg=<uuid>&segBucket=idc-open-data&modality=CT]
```

StudyInstanceUID → S3 resolution uses a slim, radiology-only IDC index hosted with CORS on
Jetstream2; only the ~1 row group spanning the study is range-read (~0.6 MB), never the whole index.

Example (KiTS-00051):
<https://pieper.github.io/SlicerRAD-IDC/?StudyInstanceUIDs=1.3.6.1.4.1.14519.5.2.1.6919.4624.368281589441706814147998236429>

## Build

```
git submodule update --init --recursive
deno task build          # → _site/  (bir.js + index.html)
```

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`: it checks out the pinned submodule, bundles
the reader with Deno + esbuild, and publishes `_site/` to GitHub Pages.

## Taking a SlicerLive update (selective)

```
cd vendor/SlicerLive
git fetch origin
git checkout <commit-or-tag>     # pick the version to ship
cd ../..
git add vendor/SlicerLive
git commit -m "vendor: bump SlicerLive to <commit>"
git push                          # the deploy Action rebuilds + redeploys
```

## Roadmap

- Instant in-place series switching (currently a reload per switch — robust and deep-linkable).
- Per-series thumbnails for non-image objects beyond a modality placeholder.
