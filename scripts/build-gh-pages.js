const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const apiDir = path.join(root, "app", "api");
const apiBackup = path.join(root, "app", "_api_temp");
const middlewareFile = path.join(root, "middleware.ts");
const middlewareBackup = path.join(root, "_middleware_temp.ts");
const outDir = path.join(root, "out");

console.log("🚀 Starting GitHub Pages static build...");

let movedApi = false;
let movedMiddleware = false;

try {
  // 1. Temporarily stash app/api if present
  if (fs.existsSync(apiDir)) {
    console.log("📦 Temporarily shelving app/api for static export...");
    fs.renameSync(apiDir, apiBackup);
    movedApi = true;
  }

  // 2. Temporarily stash middleware.ts if present
  if (fs.existsSync(middlewareFile)) {
    console.log("📦 Temporarily shelving middleware.ts for static export...");
    fs.renameSync(middlewareFile, middlewareBackup);
    movedMiddleware = true;
  }

  // 3. Run Next.js build with GITHUB_PAGES=true
  console.log("⚙️  Running 'next build' with GITHUB_PAGES=true...");
  execSync("npx next build", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
      NODE_ENV: "production",
    },
  });

  // 4. Create .nojekyll in out/
  if (fs.existsSync(outDir)) {
    fs.writeFileSync(path.join(outDir, ".nojekyll"), "");
    console.log("✅ Created out/.nojekyll");

    // Copy 404.html fallback
    const indexHtml = path.join(outDir, "index.html");
    const fourOhFour = path.join(outDir, "404.html");
    if (fs.existsSync(indexHtml) && !fs.existsSync(fourOhFour)) {
      fs.copyFileSync(indexHtml, fourOhFour);
      console.log("✅ Created out/404.html fallback from index.html");
    }
  }

  console.log("🎉 Static export built successfully into 'out/'!");
} catch (err) {
  console.error("❌ Build failed:", err.message);
  process.exitCode = 1;
} finally {
  // Always restore stashed files
  if (movedApi && fs.existsSync(apiBackup)) {
    console.log("🔄 Restoring app/api...");
    fs.renameSync(apiBackup, apiDir);
  }
  if (movedMiddleware && fs.existsSync(middlewareBackup)) {
    console.log("🔄 Restoring middleware.ts...");
    fs.renameSync(middlewareBackup, middlewareFile);
  }
}
