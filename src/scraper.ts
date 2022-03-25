import axios from "axios"
import jsdom from "jsdom"
import ora from 'ora';
import { USNewsInstitution, SimplifiedInstitution, TESchool } from "./types"


const { JSDOM } = jsdom;



export async function scrape_tuition_exchange(url: string): Promise<TESchool[]> {
  const html = await axios.get(url);
  const dom = new JSDOM(html.data);
  const data = dom.window.document.querySelectorAll("table")[0].textContent

  const cleaned = data.substr(data.indexOf("United Arab"))
  const result = cleaned.split(/\r?\n/);
  const schools: TESchool[] = []
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
    // See if there is a -, hyphen is used to separate the school name from the state
    const line_split = line.split("-")
    if (line_split.length < 2) {
      // This is just the continuation of some line about a state if there is a parantheses, its not a school
      if (line.includes("("))
        continue
      schools.push({ name: line_split[0].trim(), state_short: "", state_full: last_country });
    }
    else {
      try {
        // sometimes the line has two hyphens. This is just a school name with a hyphen in it
        if (line_split.length > 2)
        {
          line_split[0] = line_split[0].trim() + " " +  line_split[1].trim()
          line_split[1] = line_split[2]
        }
        schools.push({ name: line_split[0].trim(), state_short: line_split[1].trim(), state_full: last_country });
      } catch (error) {
        console.error(error, line);
      }
    }
  }

  return schools
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function scrape_usnews_all_schools(url: string): Promise<USNewsInstitution[]> {
  const max_counter = 187 // 187
  let all_items:USNewsInstitution[] = []
  const ora_instance = ora("Scraping US News Schools").start()
  for (let i = 1; i <= max_counter; i++) {
    const new_url = url + i.toString()
    try {
      const response = await axios.get(new_url);
      const items:USNewsInstitution[] = response.data.data.items
      all_items = all_items.concat(items)
    } catch (error) {
      console.error(error.response.data);     // NOTE - use "error.response.data` (not "error")
    }
    finally
    {
      ora_instance.text = `Scraping US News Schools - Page ${i} of ${max_counter}`
    }

  }
  ora_instance.stop();

  return all_items;

}



export function combine_tes_usnews(tes_school: TESchool[], usnews_schools: USNewsInstitution[]): SimplifiedInstitution[] {
  const simplified_institutions: SimplifiedInstitution[] = usnews_schools.map((usnews_school: USNewsInstitution): SimplifiedInstitution  => {
    return {
      displayName: usnews_school.institution.displayName,
      state: usnews_school.institution.state,
      city: usnews_school.institution.city,
      foundTE: false,
      foundUSNews: true,
      primaryKey: usnews_school.primaryKey,
      isPublic: usnews_school.institution.isPublic,
      aliasNames: usnews_school.institution.aliasNames,
      schoolType: usnews_school.institution.schoolType,
      sortName: usnews_school.institution.sortName,
      rankingType: usnews_school.institution.rankingType,
      rankingDisplayName: usnews_school.institution.rankingDisplayName,
      rankingDisplayRank: usnews_school.institution.rankingDisplayRank,
      rankingSortRank: usnews_school.institution.rankingSortRank,
      rankingFullDisplayText: usnews_school.institution.rankingFullDisplayText,
      zip: usnews_school.institution.zip,
      region: usnews_school.institution.region,
      tuition: usnews_school.searchData.tuition.rawValue,
      enrollment: usnews_school.searchData.enrollment.rawValue,
      acceptanceRate: usnews_school.searchData.acceptanceRate.rawValue,
      hsGpaAvg: usnews_school.searchData.hsGpaAvg.rawValue
    }
  })

  // for each tuition exchange school, try to find the other school in the list

  return []
}

