const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto("https://gettingtoknowyou.co/");
  console.log("waiting for button");
  await page.waitForTimeout(2000);
  await page.waitForSelector("button.btn1.lang_btn");
  console.log("clicking button");
  await page.click("button.btn1.lang_btn");
  console.log("english choosen");
  await page.focus("input#inlineFormInputGroup");
  await page.keyboard.type("01705548264");
  await page.click("button.btn4");
  await page.waitForSelector("input#nameid");
  console.log("reached to details page");
  await page.screenshot({ path: "sample.png" });

  //   await browser.close();
})();
