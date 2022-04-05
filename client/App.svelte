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
        { data: 'state', title: 'State' },
        { data: 'rankingDisplayName', title: 'Category' },
        { data: 'rankingSortRank', title: 'Rank' },
        {
          data: 'urlTE',
          title: 'Tutiion Exch.',
          render: (data, type, row) => {
            return `<a href='${data}' target='__blank__'>Link</a>`;
          },
        },
        {
          data: 'urlUSNews',
          title: 'US News',
          render: (data, type, row) => {
            return `<a href='${data}' target='__blank__'>Link</a>`;
          },
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
            var select = jq('<select><option value=""></option></select>')
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
              '<input type="text" placeholder="Search ' + title + '" />',
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
        <a class="me-3 py-2 text-dark text-decoration-none" href="#">About</a>
      </nav>
    </div>

    <div class="pricing-header p-1 pb-md-4 mx-auto text-center">
      <h3 class="display-6 fw-normal">Data</h3>
      <p class="fs-5 text-muted">See all the top schools</p>
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

<style global>
</style>
