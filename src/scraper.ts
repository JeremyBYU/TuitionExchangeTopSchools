import axios from "axios"
import jsdom from "jsdom"
import ora from 'ora';
import TrieSearch from 'trie-search';
import Wade from 'wade'
import chalk from 'chalk'
import { removeStopwords } from 'stopword'
import { distance } from 'fastest-levenshtein'
import { USNewsInstitution, SimplifiedInstitution, TESchool } from "./types"


const { JSDOM } = jsdom;

const duplicate_handle = {
  "universityofpittsburgh": "universityofpittsburghpittsburghcampus"
}


export async function scrape_tuition_exchange(url: string): Promise<TESchool[]> {
  const html = await axios.get(url);
  const dom = new JSDOM(html.data);
  // const data = dom.window.document.querySelectorAll("table")[0].textContent
  const data = dom.window.document.querySelectorAll("table a")
  // const filtered_data = data.filter(x => x.href.includes("memlist.cfm"))
  const schools: TESchool[] = []

  for (const school of data) {
    if (!school.href.includes("memlist.cfm")) {
      continue
    }
    const line = school.textContent
    const trimmed_line = line.trim()
    if (trimmed_line == "")
      continue
    const line_split = line.split("-")
    if (line_split.length < 2) {
      // This is just the continuation of some line about a state if there is a parantheses, its not a school
      if (line.includes("("))
        continue
      schools.push({ name: line_split[0].trim(), state_short: "", state_full: "", urlTE: "https://telo.tuitionexchange.org/" + school.href, urlSchoolTE: "" });
    }
    else {
      try {
        // sometimes the line has two hyphens. This is just a school name with a hyphen in it
        if (line_split.length > 2) {
          line_split[0] = line_split[0].trim() + " " + line_split[1].trim()
          line_split[1] = line_split[2]
        }
        schools.push({ name: line_split[0].trim(), state_short: line_split[1].trim(), state_full: "", urlTE: "https://telo.tuitionexchange.org/" + school.href, urlSchoolTE: "" });
      } catch (error) {
        console.error(error, line);
      }
    }

  }

  // Scrape **individual** school pages, need to get school url
  // I slowly realized that the school url is actually the most unique thing about a school!
  const ora_instance = ora("Scraping Tuition Exchange Schools").start()
  for (let i = 0; i < schools.length; ++i) {
    const school = schools[i]

    try {
      const html = await axios.get(school.urlTE);
      const dom = new JSDOM(html.data);
  
      const xpath = "//strong[text()='School URL']";
      const matchingElement = dom.window.document.evaluate(xpath, dom.window.document, null, 9, null).singleNodeValue;
      const urlSchoolTE = matchingElement.nextElementSibling.nextElementSibling
      school["urlSchoolTE"] = urlSchoolTE.href
    } catch (error) {
      console.error(error.response.data);     // NOTE - use "error.response.data` (not "error")
    }
    finally
    {
      ora_instance.text = `Scraping Tuition Exchange Schools - Page ${i} of ${schools.length}`
    }

  }
  ora_instance.stop();

  return schools
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function scrape_usnews_all_schools(url: string): Promise<USNewsInstitution[]> {
  const max_counter = 187 // 187
  let all_items: USNewsInstitution[] = []
  const ora_instance = ora("Scraping US News Schools in Bulk").start()
  for (let i = 1; i <= max_counter; i++) {
    const new_url = url + i.toString()
    try {
      const response = await axios.get(new_url);
      let items: USNewsInstitution[] = response.data.data.items
      items = items.map((item: USNewsInstitution) => { 
        const urlUSNews = "https://www.usnews.com/best-colleges/" + item.institution.urlName + "-" + item.institution.primaryKey
        item.additional = {urlUSNews: urlUSNews, urlSchool: ""}
        return item
      })
      all_items = all_items.concat(items)
    } catch (error) {
      console.error(error.response.data);     // NOTE - use "error.response.data` (not "error")
    }
    finally {
      ora_instance.text = `Scraping US News Schools in Bulk - Page ${i} of ${max_counter}`
    }

  }
  ora_instance.succeed("Scraping US News Schools in Bulk - Done");
  ora_instance.start("Scraping US News Schools Individually")

  for (const item of all_items) {
    try {
      const html = await axios.get(item.additional.urlUSNews);
      const dom = new JSDOM(html.data);
  
      const xpath = "//a[text()='Website']";
      const matchingElement = dom.window.document.evaluate(xpath, dom.window.document, null, 9, null).singleNodeValue;
      item.additional.urlSchool = matchingElement.href
      // console.log("tst")
    
    } catch (error) {
      console.error(error);     // NOTE - use "error.response.data` (not "error")
      console.error(item.additional.urlUSNews)
    }
    finally {
      ora_instance.text = `Scraping US News Schools Individually - ${item.institution.displayName}`
    }

  }
  ora_instance.succeed("Scraping US News Schools Individually - Done");


  return all_items;

}


export function clean_name(word: string) {
  let new_word = word.toLowerCase()
  new_word = new_word.replace(/\([^()]*\)/g, '')
  new_word = new_word.replace(/-*/g, '')
  new_word = new_word.replace("'", "")
  new_word = new_word.trim()
  const new_word_array: string[] = new_word.split(" ")
  if (new_word_array[0] == "the" || new_word_array[0] == "a" || new_word_array[0] == "an") {
    new_word_array.shift()
  }
  const final_word = new_word_array.join("")
  return final_word
}

export function searchWithWadeIndex(school: TESchool, ignore_list: string[], searchWade, simplified_institutions: SimplifiedInstitution[]) {
  let search_words = removeStopwords(school.name.split(' ')) // remove stop words (the, a, an, etc.)
  search_words = removeStopwords(search_words, ignore_list) // remove obvious words that are not unique
  let wadeMatches = searchWade(search_words.join(' '))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let match: SimplifiedInstitution = null
  // sort the list by score, high score first
  wadeMatches = wadeMatches.sort((a, b) => {
    if (a.score > b.score)
      return -1
    else if (a.score < b.score)
      return 1
    else return 0;
  })
  let found_match = false
  wadeMatches = wadeMatches.filter((match) => match.score > 0.6)
  if (wadeMatches.length == 0)
    return null
  // eslint-disable-next-line prefer-spread
  const max_score = Math.max.apply(Math, wadeMatches.map(function (o) { return o.score; }))
  // only get the top matches that belong in the correct state
  wadeMatches = wadeMatches.filter((wadeMatch) => (wadeMatch.score >= max_score) && simplified_institutions[wadeMatch.index].state == school.state_short)
  let min_ldist = 100000
  for (let j = 0; j < wadeMatches.length; ++j) {
    const wadeMatch = wadeMatches[j]
    const match_j = simplified_institutions[wadeMatch.index]
    const l_ldist = distance(match_j.displayName, school.name)
    if (l_ldist < min_ldist) {
      min_ldist = l_ldist
      found_match = true
      match = match_j
    }
  }
  if (found_match) {
    match.foundTE = true
    match.nameTE = school.name
    match.stateTE = school.state_short
    return match
  }
  else
    return null
}

export function url_to_key(url: string) {
  const no_https =  url.replace(/^https?:\/\//, '');
  const no_www =  no_https.replace(/^www./, '');
  const no_trailing_slash = no_www.endsWith('/') ? no_www.slice(0, -1) : no_www;
  return no_trailing_slash
}

export function combine_tes_usnews(tes_school: TESchool[], usnews_schools: USNewsInstitution[]): [SimplifiedInstitution[], TESchool[]] {

  const simplified_institutions: SimplifiedInstitution[] = usnews_schools.map((usnews_school: USNewsInstitution): SimplifiedInstitution => {
    return {
      displayName: usnews_school.institution.displayName,
      state: usnews_school.institution.state,
      city: usnews_school.institution.city,
      foundTE: false,
      foundUSNews: true,
      primaryKey: usnews_school.institution.primaryKey,
      urlName: usnews_school.institution.urlName,
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
      urlSchoolUSNews: usnews_school.additional.urlSchool,
      urlUSNews: usnews_school.additional.urlUSNews,
      urlSchoolTE: "",
      urlTE: "",
      nameTE: "",
      stateTE: "",
      suspicious: false
    }
  })


  // make hashmap USNews url -> index
  // Used to search for paring a TE School with USNews school by URL
  const usnews_url_map = {}
  simplified_institutions.forEach((simplified_institution: SimplifiedInstitution) => {
    if (simplified_institution.urlSchoolUSNews != "")
      usnews_url_map[url_to_key(simplified_institution.urlSchoolUSNews)] = simplified_institution
  })

  // Create Tri Search Index - Used for searching by institution (prefix type search)
  // eslint-disable-next-line prefer-const
  let startTime = performance.now()
  const trie = new TrieSearch('sortName');
  trie.addAll(simplified_institutions);
  // eslint-disable-next-line prefer-const
  let endTime = performance.now()
  console.log(`Trie index took ${endTime - startTime} milliseconds.`);

  // Create Wade Index - Has a confidence score, searches for all tokens in name search
  startTime = performance.now()
  const us_news_strings = simplified_institutions.map((school) => {
    const index_words = removeStopwords(school.displayName.split(" ")).join(" ")
    return index_words
  })
  const searchWade = Wade(us_news_strings);
  endTime = performance.now()
  console.log(`Wade index took ${endTime - startTime} milliseconds.`);

  let count_found_1 = 0
  let count_found_2 = 0

  // eslint-disable-next-line prefer-const
  const ignore_list = ["university", "college", "state"] // dont search for these terms, they are not very unique
  const tes_school_full_data = []
  const missing_tes_schools = []
  const duplicate_test_schools = []
  for (let i = 0; i < tes_school.length; ++i) {
    const school = tes_school[i];
    
    // First to a trie search on just the institution name
    const search_term = clean_name(school.name)
    const us_news_school_matches: SimplifiedInstitution[] = trie.get(search_term)
    let match:SimplifiedInstitution = null // the matched school we have found in the usnews list
    if (us_news_school_matches.length == 0) {
      // No Match Found
      // try to search for the using URL hashmap. Urls are unique, so we can use this to find the school
      const usnews_url_key = url_to_key(school.urlSchoolTE)
      if (usnews_url_map[usnews_url_key] != undefined) {
        // console.log(chalk.blue(`Found #${i}, ${school.name} using URL hashmap, ${usnews_url_key}=${usnews_url_map[usnews_url_key]}`))
        match = usnews_url_map[usnews_url_key]
        match.foundTE = true
        count_found_1+= 1
      }
      else
      {
        // try and use the school name as a search term use a Wade index
        // console.log(chalk.yellow(`Could not find #${i}, ${school.name} in US News using trie index. Searching using Wade index.`))
        match = searchWithWadeIndex(school, ignore_list, searchWade, simplified_institutions)
        if (match != null)
        {
          count_found_1+= 1
          match.foundTE = true
          match.suspicious = true // this has a false positive rate of about 10% i would guess
        }
      }
      // output an error if we could not find it
      if (match == null) {
        console.error(chalk.red(`Could not find #${i}, ${school.name} in US News using wade index.`))
        missing_tes_schools.push(school)
      }
    }
    else {
      // we found matches with our trie search! but how many...
      match = us_news_school_matches[0]
      count_found_2 += 1
      if (us_news_school_matches.length > 1) {
        // Multiple Matches Found 
        // Reduce by state
        const filtered_schools = us_news_school_matches.filter((match) => match.state == school.state_short)
        if (filtered_schools.length == 1) {
          match = filtered_schools[0]
          // match.foundTE = true
        }
        else {
          if (duplicate_handle[search_term]) {
            const filtered_schools_2 = filtered_schools.filter((match) => match.sortName == duplicate_handle[search_term])
            match = filtered_schools_2[0]
            // match.foundTE = true
          }
          else {
            console.error(chalk.red(`Found more than one match for ${school.name} in US News. ${us_news_school_matches}`))
            duplicate_test_schools.push({ i: i, school: school, matches: us_news_school_matches })
            count_found_2 -= 1
            continue;
          }
        }
      }
    }
    if (match)
    {
      match.foundTE = true
      match.nameTE = school.name
      match.stateTE = school.state_short
      match.urlTE = school.urlTE
      match.urlSchoolTE = school.urlSchoolTE
      tes_school_full_data.push(match)
    }

  }

  console.log(count_found_1, count_found_2)

  return [tes_school_full_data, missing_tes_schools]
}


