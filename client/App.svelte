<script>
  import data from '../data/combined_data.json';
  import { Datatable } from 'svelte-simple-datatables';
  const settings = { columnFilter: true, css: true };
  let rows;
</script>

<main>
<div id="main-container">
	<!-- <div id="container-1"></div> -->
	<div id="container-2">
		<Datatable {settings} {data} bind:dataRows={rows}>
		  <thead>
			<th data-key="displayName">First Name</th>
			<th data-key="state">State</th>
			<th data-key="rankingDisplayName">Ranking Category</th>
			<th data-key="rankingDisplayRank">Rank</th>
			<th >Tution Exch.</th>
			<th >US News</th>
		  </thead>
		  <tbody>
			{#if rows}
			  {#each $rows as row}
				<tr>
				  <td>{row.displayName}</td>
				  <td>{row.state}</td>
				  <td>{row.rankingDisplayName}</td>
				  <td>{row.rankingDisplayRank}</td>
				  <td><a href="{row.urlTE}">Link</a></td>
				  <td><a href="{row.urlUSNews}">Link</a></td>
				</tr>
			  {/each}
			{/if}
		  </tbody>
		</Datatable>
	</div>
	<!-- <div id="container-3"> -->

</div>
</main>

<style>
  td {
    text-align: left;
    padding: 4px 0;
  }
  
body, div{
	margin: 0;
	padding: 0;
	border: 0;
	height: 100vh; 
  	box-sizing: border-box;
}

/*You can use flex for this excercise*/
#main-container{
  height: 100%; 
  border: 1px solid gray;
  display: -webkit-flex;
  display: flex; 
  -webkit-flex-direction: column;
   flex-direction: column; /**make the direction vertival*/
   box-sizing: border-box;/*include the padding and border included in the elements total sizet*/
   
}

#container-1{
  background-color: red;
  border: 1px solid gray;
  height: 20px;
  box-sizing: border-box;/*include the padding and border included in the elements total sizet*/
  
}

#container-2{
  background-color: blue;
  border: 1px solid gray;
  flex-grow: 1; /**Enable the growth of this element*/
  box-sizing: border-box;/*include the padding and border included in the elements total sizet*/
}

#container-3{
  background-color: green;
  border: 1px solid gray;
  height: 20px;
  box-sizing: border-box;/*include the padding and border included in the elements total sizet*/
}
</style>
