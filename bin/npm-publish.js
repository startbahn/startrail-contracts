const fs = require("fs");
const childProcess = require("child_process");

// Derive a minimal package.json to be published - hide project details
const pjPath = "package.json";
const pj = JSON.parse(fs.readFileSync(pjPath).toString());
delete pj.dependencies;
delete pj.devDependencies;
delete pj.scripts;
delete pj.engines;

// backup package.json and write the minimal version
const pjBackupPath = "package.json.backup";
fs.renameSync(pjPath, pjBackupPath);
fs.writeFileSync(pjPath, JSON.stringify(pj, null, 2));

// rename README.md so it is not published (README cannot be ignored)
const readmePath = 'README.md'
const hiddenPath = 'HIDEME.md'
fs.renameSync(readmePath, hiddenPath);

try {
  childProcess.execFileSync("npm", ["publish", "--access", "public"]);
  console.log(`\nPublished.\n`);
} catch (err) {
  console.error(
    `\nFailed to publish module (are you logged into npm with ` +
    `the correct user?): ${err}`
  );
} finally {
  // restore files
  fs.renameSync(pjBackupPath, pjPath);
  fs.renameSync(hiddenPath, readmePath);
}
