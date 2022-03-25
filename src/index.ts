import { scrape_tuition_exchange, scrape_usnews_all_schools } from "./scraper.js" 
import * as fs from "fs"
import yargs from 'yargs'
const writeFile = fs.promises.writeFile

const TUITION_EXCHANGE_URL = "https://telo.tuitionexchange.org/schools.cfm"
const TUITION_EXCHANGE_FILE = "data/tuition_exchange_schools.json"

const USNEWS_URL = "https://www.usnews.com/best-colleges/api/search?_sort=schoolName&_sortDirection=asc&_page="
const USNEWS_FILE = "data/usnews_schools.json"

async function scrape_tes()
{
  console.log("Starting - Tuition exchange scraper")
  const data = await scrape_tuition_exchange(TUITION_EXCHANGE_URL)
  const json = JSON.stringify(data, null, 2)
  writeFile(TUITION_EXCHANGE_FILE, json, 'utf8')
  console.log(`Finished - Tuition exchange scraper, saved file in ${TUITION_EXCHANGE_FILE}`)
}

async function scrape_usnews()
{
  console.log("Starting - US News Scraper")
  const data = await scrape_usnews_all_schools(USNEWS_URL)
  const json = JSON.stringify(data, null, 2)
  writeFile(USNEWS_FILE, json, 'utf8')
  console.log(`Finished - US News Scraper, saved file in ${USNEWS_FILE}`)
}

(async () => {
  const argv = yargs(process.argv.splice(2))
    .command('scrape-tes', 'Scrape all the Tuition Exchange Schools', () => {}, scrape_tes)
    .command('scrape-usnews', 'Scrape all the Tuition Exchange Schools', () => {}, scrape_usnews)
    .demandCommand(1, 1, 'choose a command: scrape-tes or scrape-usnews')
    .strict()
    .alias('scrape-tes','scrape-tuition-exchange-schools')
    .alias('scrape-usnews','scrape-usnews-schools')
    .help('h').argv;

  await argv;

})();