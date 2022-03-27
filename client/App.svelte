<script>
  import data from '../data/combined_data.json';
  import { html } from "gridjs";
  import Grid from "gridjs-svelte"

  const settings = {
	  columns: [
		  {name: "Name", id: "displayName"},
		  {name: "State", id: "state"},
		  {name: "Category", id: "rankingDisplayName"},
		  {name: "Rank", data: (row) => row.rankingSortRank < 0? 1000: row.rankingSortRank},
		  {name: "Tuition Exch.", id:"urlTE", formatter: (row) => html(`<a href='${row}' target='__blank__'>Link</a>`)},
		  {name: "US News", id:"urlUSNews", formatter: (row) => html(`<a href='${row}' target='__blank__'>Link</a>`)},
		],
		pagination: {
			limit: 15
		},
		sort: true,
		fixedHeader: true,
		search: true,
  }
</script>

<article>
  <div class="wrapper">
    <div class="one" style="">
		<div style="height:60;justify-content: center; ">
			<h1 style="text-align:center;">Tuition Exchange Member School Ranking</h1>
		</div>
	</div>
    <div class="three" style="height:800px">
		<Grid {data} {...settings} />
    </div>
  </div>
</article>

<style global>
	@import "https://cdn.jsdelivr.net/npm/gridjs/dist/theme/mermaid.min.css";
  article {
    max-width: 1800;
    padding-bottom: 80px;
	margin: 0 auto !important; 
  }
  .wrapper {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 10px;
    grid-auto-rows: minmax(80, auto);
    background: rgba(255, 62, 0, 0.1);
    padding: 8px;
  }
  div {
    border-radius: 8px;
  }
  .one {
    background: rgba(255, 62, 0, 0.2);
    grid-column: 1 / 4;
    grid-row: 1;
  }
  .three {
    background: #ffffff;
    padding: 8px 0;
    grid-column: 1/5;
    grid-row: 2 / 4;
  }
  td {
    text-align: left;
    padding: 4px;
  }

</style>


