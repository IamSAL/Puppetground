const puppeteer = require("puppeteer");
const retailerID='D01P0069';

const fieldName='input#nameid';
const fieldBday='select#day';
const fieldBmonth='select#month';
const fieldByear='select#year';
const fieldBrand='select#brand';
const formFirstButton='button.btn5';

const consentCheckbox='input#flexCheckChecked';
const consentSubmit='button.chectbtn';

const formRetailerID='input#retailerid';
const formRetailerNum='input#retailernumber';
const formRetailerBtn='button#code_send';
const formRetailerOTP='input#otp_code';
const formRetailerFinalSubmit='button#final_submit_btn';

const finalbrand='button#brand_1';

const finalbranBtn='button.btn4';


const signInCanvas=(name,font="zeyada")=>{
  document.head.innerHTML+=`<link rel="preconnect" href="https://fonts.gstatic.com">
<link href="https://fonts.googleapis.com/css2?family=Zeyada&display=swap" rel="stylesheet">`
  const canvas=document.querySelector('canvas');
  const canvasToSign=canvas.getContext('2d')
  canvasToSign.fillStyle="#ffffff"
  canvasToSign.fillRect(0,0,canvas.width,canvas.height);
  canvasToSign.fillStyle="#000000"
  canvasToSign.font=`50px ${font}`;
  canvasToSign.fillText(name,60,60)
  return true;
}


(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    defaultViewport: null,
  });
  browser.on('disconnected',()=>{console.log("Browser disconnected from puppeteer")})
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
  await browser.disconnect();

  //   await browser.close();
})();
