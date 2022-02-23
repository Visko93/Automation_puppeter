const request = require("request-promise");
const inquirer = require("inquirer");
const cheerio = require("cheerio");
const navigateToStore = require("./navigate");

const BASE_URL = "https://www.goodreads.com";

async function main() {
  const genreQuestions = [
    {
      type: "list",
      name: "genre",
      message: "Please, choose one genre",
      choices: await getGenres(),
      filter(val) {
        return val.toLowerCase();
      },
      filteringText: "Getting available genres...",
    },
  ];
  const acceptSuggestionQuestions = [
    {
      type: "rawlist",
      name: "action",
      message: "So did you liked it? What you wanna do?",
      choices: [
        {
          key: "1",
          name: "Select a new genre",
          value: "reset",
        },
        {
          key: "2",
          name: "I needed, take me to the payment both!!",
          value: "buy",
        },
      ],
      validatingText: "Processing your choice...",
    },
  ];

  inquirer
    .prompt(genreQuestions)
    .then(({ genre }) => {
      console.log("Hi, welcome to the book shelf!");

      const parseText = parseGenreText(genre);

      const GENRE_URL = `${BASE_URL}/choiceawards/best-${parseText}-books-2020`;
      return getBestBooks(GENRE_URL); // array
    })
    .then((books) => {
      const bookName = books[randomNumberGenerator(books.length)].name;
      console.log("\nWe suggest:");
      console.log("\x1b[32m%s\x1b[0m", bookName, "\n");

      inquirer.prompt(acceptSuggestionQuestions).then(({ action }) => {
        selectedBooksReducer(action, bookName);
      });
    });
}

function parseGenreText(string) {
  return string.toLowerCase().split(" ").join("-").replaceAll("-&-", "-");
}

function selectedBooksReducer(selecteString, bookName) {
  switch (selecteString) {
    case "reset":
      return main();
    case "buy":
      return navigateToStore(bookName, main);
    default:
      return console.log("Action not mapped");
  }
}

function randomNumberGenerator(ceil = 0) {
  let min = 0;
  let max = Math.ceil(ceil);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getGenres() {
  const html = await request.get(`${BASE_URL}/choiceawards/best-books-2020`);
  const $ = await cheerio.load(html);

  let result = new Array();
  $(".category__copy").each((i, e) =>
    result.push($(e).text().replaceAll("\n", ""))
  );

  return result;
}

async function getBestBooks(url) {
  const bestBooks = await request.get(url);
  const bookOption = [];
  const $ = await cheerio.load(bestBooks);
  $(".pollAnswer__bookLink").each((i, e) =>
    bookOption.push({
      href: $(e).attr("href"),
      name: $(e).children().attr("alt"),
    })
  );
  return bookOption;
}

main();
