<script>
  import data from '../data/combined_data.json';

  const data_mapped = data.map((d) => {
    d.rankingSortRank = d.rankingSortRank < 0 ? 1000 : d.rankingSortRank;
    return d;
  });
  const jq = window.$;

  jq(document).ready(function () {
    jq('#mytable').DataTable({
      dom: 'Bfrtip',
      orderCellsTop: true,
      data: data_mapped,
      columns: [
        { data: 'displayName', title: 'Name' },
        { data: 'state', title: 'State', width: 70, },
        { data: 'rankingDisplayName', title: 'Category' },
        { data: 'rankingSortRank', title: 'Rank' },
        {
          data: 'urlTE',
          title: 'Tutiion Exch.',
          render: (data, type, row) => {
            return `<a href='${data}' target='__blank__'>Link</a>`;
          },
          orderable: false 
        },
        {
          data: 'urlUSNews',
          title: 'US News',
          render: (data, type, row) => {
            return `<a href='${data}' target='__blank__'>Link</a>`;
          },
          orderable: false 
        },
      ],
      buttons: ['copy', 'excel', 'pdf'],
      initComplete: function () {
        this.api()
          .columns('.dropdown')
          .every(function () {
            var column = this;
            window.mytest = column;
            console.log('test');
            var select = jq('<select class="form-select form-select-sm"><option value=""></option></select>')
              .appendTo(
                jq('#mytable thead tr:eq(1) th').eq(column.index()).empty(),
              )
              // .appendTo( jq(column.footer()).empty() )
              .on('change', function () {
                var val = jq.fn.dataTable.util.escapeRegex(jq(this).val());

                column.search(val ? '^' + val + '$' : '', true, false).draw();
              });

            column
              .data()
              .unique()
              .sort()
              .each(function (d, j) {
                select.append('<option value="' + d + '">' + d + '</option>');
              });
          });
        this.api()
          .columns('.search')
          .every(function () {
            var column = this;
            console.log('that');
            let title = "";
            var select = jq(
              '<input class="form-control form-control-sm" type="text" placeholder="Search ' + title + '" />',
            )
              .appendTo(
                jq('#mytable thead tr:eq(1) th').eq(column.index()).empty(),
              )
              // .appendTo( jq(column.footer()).empty() )
              .on('keyup change clear', function () {
                if (column.search() !== this.value) {
                  column.search(this.value).draw();
                }
              });

            column
              .data()
              .unique()
              .sort()
              .each(function (d, j) {
                select.append('<option value="' + d + '">' + d + '</option>');
              });
          });
      },
    });
  });
</script>

<div class="container py-3">
  <header>
    <div
      class="d-flex flex-column flex-md-row align-items-center pb-3 mb-4 border-bottom"
    >
      <a
        href="/"
        class="d-flex align-items-center text-dark text-decoration-none"
      >
        <span class="fs-4">Tuition Exchange - Top Schools</span>
      </a>

      <nav class="d-inline-flex mt-2 mt-md-0 ms-md-auto">
        <a class="me-3 py-2 text-dark text-decoration-none" href="#">Data</a>
        <a class="me-3 py-2 text-dark text-decoration-none" href="#" data-bs-toggle="modal" data-bs-target="#exampleModal">About</a>
      </nav>
    </div>

    <div class="pricing-header p-1 pb-md-4 mx-auto text-center">
      <h3 class="display-6 fw-normal">Data</h3>
      <p class="fs-5 text-muted">See all the top schools under the <a href="https://www.tuitionexchange.org/" target='__blank__'>Tution Exchange</a> program according to <a href="https://www.usnews.com/best-colleges" target='__blank__'>US News</a>. 
        You can filter the data by state, category, and school name. You can also sort by clicking the column headers at the top. </p>
    </div>
  </header>

  <main>
    <div class="table-responsive">
      <table id="mytable" class="table text-center">
        <thead>
          <tr>
            <th class="search">Name</th>
            <th class="dropdown">State</th>
            <th class="dropdown">Category</th>
            <th>Rank</th>
            <th>Tutiion Exch.</th>
            <th>US News</th>
          </tr>
          <tr>
            <th class="search">Name</th>
            <th class="dropdown">State</th>
            <th class="dropdown">Category</th>
            <th>Rank</th>
            <th>Tutiion Exch.</th>
            <th>US News</th>
          </tr>
        </thead>
      </table>
    </div>
  </main>
</div>

<!-- Modal -->
<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">About Site</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        Hi! I'm <a href="https://robosim.dev/pages/about/" target='__blank__'>Jeremy</a>, a software engineer and Professor. <br><br>
        I made this website to see how the schools in the <a href="https://www.tuitionexchange.org/" target='__blank__'>Tution Exchange</a>  program are ranked according to <a href="https://www.usnews.com/best-colleges" target='__blank__'>US News</a>. 
        I have three children and wanted to find the top ranked colleges with free/reduced tuition. I hope this may be useful for you! <br><br>
        If you want to see how I gathered the data and made the website, check out the  <a href="https://github.com/JeremyBYU/TuitionExchangeTopSchools" target='__blank__'>Github Repository</a> 
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>


<style global>
  select { min-width: 100; }
</style>
