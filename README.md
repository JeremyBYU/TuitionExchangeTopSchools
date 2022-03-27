# Tuition Exchange - Top Schools

This repository contains data, web scraping code, and analysis code for determining the US News College rankings of Tuition Exchange member schools. A tuition exchange program is one where colleges/universities provide *possible* free/reduced tuition to staff/faculty of any other member school. 

If you are just interested in the data please see the `data` folder. A website has also been created which is shown in the `public` folder. If you want a real quick highlight here are the top 5 schools in each US News College ranking "categories":

## Running the Program

All code is written in JavaScript/TypeScript. You must have `nodejs` installed and then run `npm install`.

1. `npm run start scrape-tes` - This will scrape all the **T**uition **E**xchange **S**chools and output the data in JSON format to the `data` folder under `data/tuition_exchange_schools.json`.
2. `npm run start scrape-usnews` - This will scrape all the US News Colleges and Universities and output the data in JSON format to the `data` folder under `data/usnews_schools.json`.
3. `npm run start combine-data` - This will try to combine match every TE school with a US News school to get ranking information. It will output the data in JSON format to the `data` folder under `data/combined_schools.json`.



<!-- US News Ranking

https://www.usnews.com/best-colleges/api/search?_sort=schoolName&_sortDirection=asc&_page=100

data.items[0].urlName
data.items[0].primaryKey

https://github.com/kajchang/USNews-College-Scraper -->
