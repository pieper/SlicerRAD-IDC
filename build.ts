// Build the SlicerRAD-IDC static site into _site/:
//   _site/bir.js    — the pinned SlicerLive BIR reader (vendor submodule), bundled with esbuild
//   _site/index.html — the read-only IDC viewer page (measurements off, Share/Download on)
//
// The whole app is the SlicerLive Basic Image Review reader, pinned via the vendor/SlicerLive
// git submodule so this deployment does NOT float with SlicerLive main. To take an update,
// bump the submodule (see README) and let the deploy Action rebuild.
//
//   deno task build      # or: deno run -A build.ts

const OUT = "_site";
const ENTRY = "vendor/SlicerLive/render/demos/bir-browser.ts";

try {
  Deno.statSync(ENTRY);
} catch {
  console.error(`missing ${ENTRY} — run: git submodule update --init --recursive`);
  Deno.exit(1);
}

await Deno.mkdir(OUT, { recursive: true });

const esbuild = new Deno.Command("deno", {
  args: ["run", "-A", "npm:esbuild@0.21.5", ENTRY, "--bundle", "--format=esm", `--outfile=${OUT}/bir.js`],
  stdout: "inherit",
  stderr: "inherit",
});
const { code } = await esbuild.output();
if (code !== 0) Deno.exit(code);

await Deno.copyFile("index.html", `${OUT}/index.html`);
// The idc_tools loader spawns a classic Web Worker resolved as ./idc-worker.js next to the
// bundle (it importScripts dcmjs from a CDN itself), so it must sit beside bir.js in _site.
await Deno.copyFile("vendor/SlicerLive/render/vendor/idc_tools/idc-worker.js", `${OUT}/idc-worker.js`);
console.log(`built ${OUT}/ (bir.js + index.html + idc-worker.js)`);
