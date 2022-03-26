import axios from "axios"
import jsdom from "jsdom"
import ora from 'ora';
import TrieSearch from 'trie-search';
import Wade from 'wade'
import {removeStopwords} from 'stopword'
import { USNewsInstitution, SimplifiedInstitution, TESchool } from "./types"


const { JSDOM } = jsdom;

const duplicate_handle = {
  "universityofpittsburgh": "universityofpittsburghpittsburghcampus"
}


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


export function clean_name(word:string)
{
  let new_word = word.toLowerCase()
  new_word = new_word.replace(/\([^()]*\)/g, '')
  new_word = new_word.replace(/-*/g, '')
  new_word = new_word.replace("'", "")
  new_word = new_word.trim()
  const new_word_array:string[] = new_word.split(" ")
  if (new_word_array[0] == "the" || new_word_array[0] == "a" || new_word_array[0] == "an")
  {
    new_word_array.shift()
  }
  const final_word =  new_word_array.join("")
  return final_word
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
      hsGpaAvg: usnews_school.searchData.hsGpaAvg.rawValue,
      nameTE: "",
      stateTE: "" 
    }
  })


 
  
  // eslint-disable-next-line prefer-const
  let startTime = performance.now()
  const trie = new TrieSearch('sortName');
  trie.addAll(simplified_institutions);
  // eslint-disable-next-line prefer-const
  let endTime = performance.now()
  console.log(`Trie index took ${endTime - startTime} milliseconds.`);
  
  startTime = performance.now()
  const us_news_strings = simplified_institutions.map((school) => { 
    const index_words = removeStopwords(school.displayName.split(" ")).join(" ")
    return index_words
  })
  const searchWade = Wade(us_news_strings);
  endTime = performance.now()
  console.log(`Wade index took ${endTime - startTime} milliseconds.`);

  const ignore_list = ["university", "college", "state"] // dont search for these terms, they are not very unique
  const tes_school_full_data = []
  const missing_tes_schools = []
  const duplicate_test_schools = []
  for (let i = 0; i < tes_school.length; ++i) {
    const school = tes_school[i];
    const search_term = clean_name(school.name)
    const us_news_school_matches:SimplifiedInstitution[] = trie.get(search_term)
    // No Match Found
    if (us_news_school_matches.length == 0) {
      console.log(`Could not find #${i}, ${school.name} in US News using trie index. Searching using Wade index.`)
      let search_words = removeStopwords(school.name.split(' '))
      search_words = removeStopwords(search_words, ignore_list)
      let wadeMatches = searchWade(search_words.join(' '))
      wadeMatches = wadeMatches.sort((a, b) => {
        if (a.score > b.score)
          return -1
        else if (a.score < b.score)
          return 1
        else return 0;
      } )
      let found_match = false
      for (let j = 0; j < wadeMatches.length; ++j) {
        const wadeMatch = wadeMatches[j]
        const match = simplified_institutions[wadeMatch.index]
        if (match.state == school.state_short && wadeMatch.score > 0.6) {
          // TODO I should log this
          match.foundTE = true
          match.nameTE = school.name
          match.stateTE = school.state_short
          tes_school_full_data.push(match)
          found_match = true;
          break;
        }
      }
      if (!found_match) {
        missing_tes_schools.push(i)
        console.error(`Could not find #${i}, ${school.name} in US News using wade index.`)
      }
    }
    else
    {
      let match = us_news_school_matches[0]
      // Multiple Matches Found
      if (us_news_school_matches.length > 1) {
        // Reduce by state
        const filtered_schools = us_news_school_matches.filter((match) => match.state == school.state_short)
        if (filtered_schools.length == 1) {
          match = filtered_schools[0]
        }
        else
        {
          if (duplicate_handle[search_term])
          {
            const filtered_schools_2 = filtered_schools.filter((match) => match.sortName == duplicate_handle[search_term])
            match = filtered_schools_2[0]
          }
          else
          {
            console.error(`Found more than one match for ${school.name} in US News. ${us_news_school_matches}`)
            duplicate_test_schools.push({i: i, school: school, matches: us_news_school_matches})
            continue;
          }
        }
      }
      match.foundTE = true
      match.nameTE = school.name
      match.stateTE = school.state_short
      tes_school_full_data.push(match)
    }
    
  }
  console.log("Ready!")

  // const search_list = school.name.split(' ').filter((word) => !ignore_list.includes(word.toLowerCase()))
  // const possible_matches = new Map()  // store the possible matches in a Map, the value will be the number of hits!
  // for (const search_term of search_list) {
  //   console.log(search_term)
  //   const us_news_school_matches = trie.get(search_term)
  //   for (const us_news_school of us_news_school_matches)
  //   {
  //     if (possible_matches.has(us_news_school))
  //     { 
  //       possible_matches.set(us_news_school, possible_matches.get(us_news_school) + 1)
  //     }
  //     else
  //     {
  //       possible_matches.set(us_news_school, 1)
  //     }
  //   }
  // }

  // startTime = performance.now()
  // const results = trie.search('California');
  // endTime = performance.now()
  // console.log(`Trie search took ${endTime - startTime} milliseconds.`,);
  // for (const result of results) {
  //   console.log(result);
  // }

  

  // for each tuition exchange school, try to find the other school in the list

  return []
}


