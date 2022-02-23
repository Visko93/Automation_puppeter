const puppeteer = require("puppeteer");

const icons = {
  check: "✅",
  error: "❌",
  warning: "⚠️",
};

module.exports = async function navigateToStore(bookName, reset) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    await page.goto("https://www.amazon.com");
    await page.type("#twotabsearchtextbox", bookName);
    await page.click("#nav-search-submit-button");

    console.log(icons.check, "Book searched.");

    await page.waitForNavigation();
    const hrefElement = await page.$(
      ".s-product-image-container > div > span > a"
    );
    console.log(icons.check, "Book details page.");

    await hrefElement.click();

    await page.waitForNavigation();

    
    try {
      const addCartButton = page.$("#add-to-cart-button")
      await (await addCartButton).click()

    } catch (error) {
      console.log(
        icons.warning,
        "Hmm this book is not avalable. Let's try again",
      );
      await browser.close();
      reset();
    }
  } catch (err) {
    console.log(icons.error, err);
  } finally {
    await browser.close();
  }
};
