var fs = require("fs").promises;
const puppeteer = require("puppeteer");

const executeCrawler = async (process) => {
  try {
    console.info(`Starting execution of process: ${process}.`);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    console.info(`Waiting page load.`);
    await page.goto(
      "https://sople.anm.gov.br/portalpublico/areas-nominadas/nova",
      { waitUntil: "load" }
    );

    console.info(`Waiting main selector load.`);
    await page.waitForSelector("form");

    console.info(`Typing numbers.`);
    await page.focus("input[id=mat-input-2]");
    process.split("").forEach((item) => {
      console.log(`Typed: ${item}.`);
      page.keyboard.press(item);
    });

    const typedValue = await page.$eval(
      "input[id=mat-input-2]",
      async (element) => element.value
    );
    console.log(`Typed value: ${typedValue}`);

    console.info(`Waiting for button enable.`);
    await page.waitForSelector(
      "button.mat-accent.mat-raised-button.mat-button-base:not(.ng-star-inserted):not([disabled])"
    );

    console.info(`Executing click in button.`);
    await page.click(
      "button.mat-accent.mat-raised-button.mat-button-base:not(.ng-star-inserted):not([disabled])"
    );

    console.info(`Waiting finish request.`);
    await page.waitForSelector(".mat-dialog-content.ng-star-inserted");

    browser.close();

    return true;
  } catch (error) {
    console.error(`Error to execute crawler for process: ${process}.`);
    console.error(error.message);

    return false;
  }
};

const getData = async () => {
  const response = [];
  const data = await fs.readFile("data.csv", "utf8");

  data.split(/\r?\n/).forEach((item) => {
    response.push(item.split(";")[0]);
  });

  return response;
};

const saveLog = async (data) => {
  console.log("Saving log of execution.");
  await fs.writeFile(`logs/${new Date().getTime()}.txt`, data, "utf8");
};

const main = async () => {
  const data = await getData();
  const successProcess = [];
  const errorProcess = [];

  for (let index = 0; index < data.length; index++) {
    const item = data[index];

    if (item.length === 10) {
      if (await executeCrawler(item)) {
        successProcess.push(item);
      } else {
        errorProcess.push(item);
      }
    } else {
      errorProcess.push(item);
    }
  }

  const logMessage =
    `Process executed with success: ${successProcess.join(", ")} \r\n` +
    `Process executed with error: ${errorProcess.join(", ")}`;

  await saveLog(logMessage);

  process.exit(0);
};

(async () => {
  await main();
})();
