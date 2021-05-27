const puppeteer = require("puppeteer");
const fs = require("fs");
const { customers, retailer, signtareFontUrl } = require("./data");
const { TargetError, TakenError } = require("./utils");
const { ID: retailerID, phone: retailerPhone } = retailer;

const fieldName = "input#nameid";
const fieldBday = "select#day";
const fieldBmonth = "select#month";
const fieldByear = "select#year";
const fieldBrand = "select#brand";
const formFirstButton = "button.btn5";

const consentCheckbox = "label.form-check-label";

const formRetailerID = "input#retailerid";
const formRetailerNum = "input#retailernumber";
const formRetailerBtn = "button#code_send";
const formRetailerOTP = "input#otp_code";
const formRetailerFinalSubmit = "button#final_submit_btn";

const finalbrand = "button#brand_1";
const finalbrandBtn = "button.btn4";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });
  browser.on("disconnected", () => {
    console.log("::::Puppet stopped::::");
    // process.exit(this);
  });

  const page = await browser.newPage();

  const signInCanvas = async (user, font = "zeyada") => {
    await page.addStyleTag({
      url: signtareFontUrl,
    });
    const { name: fullname } = user;
    let name = fullname.split(" ").slice(-1)[0];
    let signed = await page.evaluate(
      (font, name) => {
        const canvas = document.querySelector("canvas");
        const canvasToSign = canvas.getContext("2d");
        canvasToSign.font = `50px ${font}`;
        let i = 0;
        let sign = () => {
          console.log(i);
          canvasToSign.fillStyle = "#ffffff";
          canvasToSign.fillRect(0, 0, canvas.width, canvas.height);
          canvasToSign.fillStyle = "#000000";
          canvasToSign.fillText(name, 60, 60);
          i++;
        };
        sign();
        //to confirm its getting the loaded font
        setInterval(sign, 500);
      },
      font,
      name
    );

    await page.waitForTimeout(2000);
    await page.screenshot({ path: `sign_${customer.name}.png` });
    await page.evaluate(() => {
      document.forms[0].submit();
    });
    await page.waitForNavigation();
    console.log("Signed");
    return signed;
  };
  const fillCustomerDetails = async (user) => {
    const { name } = user;
    let bday = Math.round(Math.random() * 29 + 1).toString();
    let bmonth = Math.round(Math.random() * 11 + 1).toString();
    let byear = Math.round(Math.random() * (2000 - 1977) + 1977).toString();

    await page.focus(fieldName);
    await page.keyboard.type(name);
    await page.select(fieldBday, bday);
    await page.select(fieldBmonth, bmonth);
    await page.select(fieldByear, byear);
    await page.select(fieldBrand, "JPGL");
    await page.click(formFirstButton);
    await page.waitForSelector(consentCheckbox);
    console.log("details form filled:");
    console.log({ name, bday, bmonth, byear });
    return true;
  };

  const fillConsentForm = async () => {
    let cickcheckbox = await page.evaluate((consentCheckbox) => {
      document.querySelector(consentCheckbox).click();
      document.forms[0].submit();
    }, consentCheckbox);
    await page.waitForSelector("canvas");
    console.log("checked consent");
    return true;
  };

  const fillOTPForm = async () => {
    let OTPstatus = false;
    await page.focus(formRetailerID);
    await page.keyboard.type(retailerID);
    await page.focus(formRetailerNum);
    await page.keyboard.type(retailerPhone);
    await page.evaluate((formRetailerBtn) => {
      document.querySelector(formRetailerBtn).click();
      console.log(document.querySelector(formRetailerBtn) + " Clicked");
    }, formRetailerBtn);

    try {
      await page.waitForSelector("div#vlidation_msg", { visible: true });
      throw new TargetError();
    } catch (e) {
      if (e instanceof TargetError) {
        throw e;
      }
      console.log("Waiting for OTP...");
      await page.waitForFunction(
        `document.querySelector("button#code_send").innerText.includes("Resend Code")`
      );
      console.log("continuing...");
      OTPstatus = await page.evaluate(
        (formRetailerOTP, formRetailerFinalSubmit) => {
          let otpCode = prompt("SMS OTP:");
          document.querySelector(formRetailerOTP).value = otpCode;
          document.querySelector(formRetailerFinalSubmit).click();
          return true;
        },
        formRetailerOTP,
        formRetailerFinalSubmit
      );
    }

    console.log("Otp submitted:", OTPstatus);
    return true;
  };

  const fillBrandQuizForm = async () => {
    await page.waitForFunction(
      `  document.querySelector('h2').innerText.includes("name of the brand")`
    );
    await page.click(finalbrand);
    await page.click(finalbrandBtn);
    console.log("Brand quick done");
    return true;
  };

  const fillTrialForm = async () => {
    await page.waitForSelector(finalbrand);
    console.log("processing ask for trial form...");
    await page.waitForFunction(
      `  document.querySelector('h2').innerText.includes("ask you to try")`
    );

    await page.click(finalbrand);
    await page.evaluate(() => {
      document.forms[0].submit();
    });
    console.log("processing did you try form...");
    await page.waitForSelector("body:not(:empty)");
    await page.click(finalbrand);
    await page.evaluate(() => {
      document.forms[0].submit();
    });
    await page.waitForSelector("h2.thankyou");
    console.log("processing thank you form...");
    await page.evaluate(() => {
      document.forms[0].submit();
    });
    // await page.waitForNavigation();
  };
  const skipVideo = async () => {
    await page.waitForSelector("video#videoPlayer");
    await page.evaluate(() => {
      document.forms[0].submit();
    });
    await page.waitForNavigation();
  };
  for (customer of customers) {
    try {
      await page.goto("https://gettingtoknowyou.co/");
      await page.waitForSelector("button.btn1.lang_btn");
      await page.click("button.btn1.lang_btn");
      console.log("Language selected...");
      await page.waitForSelector("input#inlineFormInputGroup");
      await page.focus("input#inlineFormInputGroup");
      await page.keyboard.type(customer.phone);
      await page.evaluate(() => {
        document.forms[0].submit();
      });
      await page.waitForNavigation();
      console.log("Phone number entered");
      try {
        console.log("waiting for phone number confirmation...");
        await page.waitForFunction(
          `document.querySelector('p.back-error.error-item.text-left').innerText.includes('This phone number has already been used')`
        );
        throw new TakenError("Phone number taken, Skipping to next...");
      } catch (e) {
        if (e instanceof TakenError) {
          throw e;
        }
        console.log("Phone number accepted");
      }
      await page.waitForSelector("input#nameid");
      await fillCustomerDetails(customer);
      await fillConsentForm();
      await signInCanvas(customer);
      await fillOTPForm();
      await skipVideo();
      console.log("Video Skipped...");
      await fillBrandQuizForm();
      await fillTrialForm();
      console.log("Done:");
      fs.appendFileSync("Result.txt", `PASS:    ${customer.name}\n`);
    } catch (e) {
      if (e instanceof TargetError) {
        console.log("Your Target is filled up, Can't submit more");
        browser.disconnect();
      } else {
        console.log(e.message);
      }
      console.log("Failed:", customer.name);
      fs.appendFileSync("Result.txt", `FAIL:    ${customer.name}\n`);
    }
  }
  console.log(":::END:::");
  await browser.disconnect();
})();
