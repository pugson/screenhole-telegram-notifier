const puppeteer = require("puppeteer");
const fs = require("fs");
const axios = require("axios");
const dotenv = require('dotenv');

dotenv.config();

async function getCache() {
  try {
    const cache = await fs.promises.readFile("last_grab_url.txt", "utf8");
    return cache;
  } catch (fileError) {
    console.log(fileError);
    console.log('Run "touch last_grab_url.txt" to create the file first.');
  }
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://screenhole.net");

  const grab = await page.waitForSelector(".grabs-feed .grab:first-child .grab-upload a");
  const query = await grab.evaluate((element) => element.href);

  getCache().then((data) => {
    const cachedGrab = data;

    fs.writeFileSync("last_grab_url.txt", query);

    if (query === cachedGrab) {
      // nothing
      console.log('cached grab')
    } else {
      axios.post(
        `https://api.telegram.org/${process.env.TOKEN}/sendMessage?chat_id=${process.env.CHAT_ID}&text=${query}`
      );
    }
  });

  await browser.close();
})();