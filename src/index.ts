import { parse_tuition_exchange } from "./scraper.js" 
import * as fs from "fs"
const writeFile = fs.promises.writeFile

const TUITION_EXCHANGE_URL = "https://telo.tuitionexchange.org/schools.cfm"

async function main()
{
  const data = await parse_tuition_exchange(TUITION_EXCHANGE_URL)
  const json = JSON.stringify(data, null, 2);
  writeFile('data/tuition_exchange_schools.json', json, 'utf8');
}

(async () => {
  const test = 1

  await main()
})();