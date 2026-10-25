/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require("/home/z/my-project/node_modules/sharp");
const fs = require("fs");

const CAND = "/home/z/my-project/assets/candidates/";
const OUT = "/home/z/my-project/public/images/";

const jobs = [
  // hero background: crop to 16:10 landscape, dramatic overhead latte art
  { in: CAND + "h2.jpeg", out: OUT + "hero-main.jpg", w: 1920, h: 1200 },
  // hero 3D card: 4:5 crop, heart latte art
  { in: CAND + "h4.jpg", out: OUT + "hero-portrait.jpg", w: 1200, h: 1500 },
  // story section: barista pouring, 4:5
  { in: CAND + "b1.jpg", out: OUT + "barista-main.jpg", w: 1400, h: 1750 },
  // gallery beans tile: 4:5
  { in: CAND + "be1.jpeg", out: OUT + "beans.jpg", w: 1400, h: 1750 },
];

(async () => {
  for (const j of jobs) {
    const tmp = j.out + ".tmp";
    await sharp(j.in)
      .resize({ width: j.w, height: j.h, fit: "cover", position: "centre" })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(tmp);
    fs.renameSync(tmp, j.out);
    console.log(
      `${j.out.split("/").pop()} -> ${Math.round(fs.statSync(j.out).size / 1024)}KB (${j.w}x${j.h})`
    );
  }
})();
