/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require("/home/z/my-project/node_modules/sharp");
const fs = require("fs");
const path = "/home/z/my-project/public/images/";

const jobs = [
  { in: "interior-main.jpg", out: "interior-main.jpg", w: 2400 },
  { in: "interior-square.jpg", out: "interior-square.jpg", w: 1600 },
  { in: "beans-portrait.jpg", out: "beans-portrait.jpg", w: 1400 },
  { in: "pastry-alt.jpg", out: "pastry-alt.jpg", w: 1600 },
  { in: "pastry-main.jpg", out: "pastry-main.jpg", w: 1800 },
  { in: "hero-main.jpg", out: "hero-main.jpg", w: 1600 },
  { in: "barista-main.jpg", out: "barista-main.jpg", w: 1600 },
];

(async () => {
  for (const j of jobs) {
    const src = path + j.in;
    const tmp = path + "tmp_" + j.out;
    await sharp(src)
      .resize({ width: j.w, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(tmp);
    fs.renameSync(tmp, path + j.out);
    console.log(`${j.out} -> ${Math.round(fs.statSync(path + j.out).size / 1024)}KB`);
  }
})();
