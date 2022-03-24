import { parse_tuition_exchange } from "./scraper" 
const fs = require('fs').promises

const TUITION_EXCHANGE_URL = "https://telo.tuitionexchange.org/schools.cfm"

async function main()
{
  let data = await parse_tuition_exchange(TUITION_EXCHANGE_URL)
  let json = JSON.stringify(data);
  fs.writeFile('data/tuition_exchange_schools.json', json, 'utf8');
}

(async () => {
  main()
})();