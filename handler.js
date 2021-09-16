const chromium = require("chrome-aws-lambda");

exports.main = async (event) => {
  const { url } = event.queryStringParameters || {};

  try {
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    let page = await browser.newPage();

    await page.goto(url);

    await page.waitForSelector(".Opta-Title", { visible: true });

    const optaJson = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll(".Opta-Striped > li"),
        (element) => ({
          minute: element
            .querySelector(".Opta-Time")
            .textContent.replace(/\n          /g, ""),
          comment: element
            .querySelector(".Opta-comment")
            .textContent.replace(/\n          /g, ""),
        })
      )
    );

    const result = JSON.stringify(optaJson || {});
    await browser.close();
    return {
      statusCode: 200,
      body: result,
    };
  } catch (error) {
    await browser.close();
    return {
      statusCode: 500,
      errorMessage: err.message,
    };
  }
};
