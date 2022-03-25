import axios from "axios"
import jsdom from "jsdom"
const { JSDOM } = jsdom;

interface School {
  name: string;
  state_full: string;
  state_short: string;
}

export async function parse_tuition_exchange(url: string): Promise<School[]> {
  const html = await axios.get(url);
  const dom = new JSDOM(html.data);
  const data = dom.window.document.querySelectorAll("table")[0].textContent

  const cleaned = data.substr(data.indexOf("United Arab"))
  const result = cleaned.split(/\r?\n/);
  const schools: School[] = []
  let last_country = "";
  for (const line of result) {
    const trimmed_line = line.trim();
    // skip blank lines
    if (trimmed_line == "")
      continue
    // determine how many tabs are on the line
    // if 2 or 0 tabs, this is just the country or state name
    // eslint-disable-next-line no-control-regex
    const regex_match = line.match(new RegExp("\t", "g")) // null if no match
    const num_tabs = regex_match == null ? 0 : regex_match.length
    if (num_tabs >= 2 || num_tabs == 0) {
      last_country = trimmed_line
      continue; // there is no school information on this line, skip
    }
    // See if there is a -
    const line_split = line.split("-")
    if (line_split.length < 2) {
      // This is just the continuation of some line about a state if there is a parantheses, its not a school
      if (line.includes("("))
        continue
      schools.push({ name: line_split[0].trim(), state_short: "", state_full: last_country });
    }
    else {
      try {
        schools.push({ name: line_split[0].trim(), state_short: line_split[1].trim(), state_full: last_country });
      } catch (error) {
        console.error(error, line);
      }
    }
  }

  return schools
}

export async function get_us_news_schools(url: string): Promise<School[]> {

  return {};

}


