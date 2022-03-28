const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const csv = require("csvtojson/v2");
const { parse } = require("json2csv");
var ncp = require("copy-paste");
let inputElements = {
  composeBtn: `div > div.window-body.classic-toolbar-visible > div.classic-toolbar-container > ul > li:nth-child(1) > a`,
  sendBtn: `#window-1 > div > div.floating-body.abs > div > div.window-footer > div > button`,
  toField: `.token-input.tt-input`,
  subjectField: `.mail-input input[name="subject"]`,
  bodyField: `.mce-content-body.ox-mce`,
};
const { createMessage, createSubject } = require("./utils");
// const { ID: retailerID, phone: retailerPhone } = retailer;

(async () => {
  async function paste() {
    await page.waitForTimeout(500);
    await page.keyboard.down("Control");
    await page.keyboard.press("V");
    await page.keyboard.up("Control");
  }
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 200,
    defaultViewport: null,
    args: ["--start-maximized"],
  });
  browser.on("disconnected", () => {
    console.log("::::Puppet stopped::::");
    // process.exit(this);
  });

  //load data
  let allContacts = await csv().fromFile(
    path.resolve(__dirname, "contacts.csv")
  );
  let notSentContacts = allContacts.filter((c) => c.status == 0);
  console.log("TOTAL CONTACTS:", allContacts.length);
  console.log("NOT SENT CONTACTS:", notSentContacts.length);

  const page = await browser.newPage();

  await page.goto("https://privateemail.com/");

  // Login
  await page.type("#txtMailbox", "support@win4local.net");
  await page.type("#txtPwd", "Salman100%great");
  await page.click("#btnLogin");
  await page.waitForNavigation();
  await page.waitForSelector(inputElements.composeBtn, {
    visible: true,
  });

  //Send emails to not sent contacts
  for (let [idx, contact] of allContacts.entries()) {
    if (contact.name && contact.email && contact.status == 0) {
      try {
        await page.goto("https://privateemail.com/");
        await page.waitForNavigation();
        await page.waitForSelector(inputElements.composeBtn, {
          visible: true,
        });
        await page.waitForTimeout(1000);
        await page.click(inputElements.composeBtn);
        await page.waitForSelector(inputElements.toField, {
          visible: true,
        });
        await page.waitForTimeout(1000);
        await page.evaluate((inputElements) => {
          document.querySelector(inputElements.toField).focus();
        }, inputElements);

        ncp.copy(createMessage(contact.email));
        await paste();
        await page.keyboard.press("Enter");
        await page.type(
          inputElements.subjectField,
          createSubject(contact.name)
        );

        await page.evaluate((inputElements) => {
          document.querySelector(inputElements.subjectField).focus();
        }, inputElements);

        await page.keyboard.press("Tab");
        ncp.copy(createMessage(contact.name));
        await paste();
        await page.click(inputElements.sendBtn);
        await page.waitForTimeout(2000);

        await page.evaluate((inputElements) => {
          Array.from(
            document.querySelectorAll(
              "div.floating-header.abs > div > button:nth-child(4)"
            )
          ).forEach((btn) => {
            btn.click();
          });
        }, inputElements);

        await page.waitForTimeout(1000);
        console.log(`Passed ${idx + 1 + ":" + contact.email || contact.name}`);
        allContacts[idx].status = 1;
      } catch (e) {
        console.log(`Failed ${idx + 1 + ":" + contact.email || contact.name}`);
        allContacts[idx].status = 0;
      }
    } else {
      console.log(`Skipped ${idx + 1 + ":" + contact.email || contact.name}`);
    }
  }

  //Log results
  try {
    const fields = ["name", "email", "status"];
    const opts = { fields };
    const csv = parse(allContacts, opts);
    fs.writeFileSync("contacts.csv", csv);
    console.log("Results written successfully\n");
  } catch (err) {
    console.error(err);
  }

  //End
  console.log(":::END:::");
  await browser.disconnect();
})();
