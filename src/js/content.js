(function(Kakashi) {

    'use strict';

    const _Content = function() {

        const
            _buildTableTBodyTR = data => {
                let tr = document.createElement('tr');

                let arr = data.td || [];
                arr.forEach(item => {
                    let td = document.createElement('td');
                    td.textContent = item;
                    tr.appendChild(td);
                });

                return tr;
            },
            _buildTableTHead = data => {
                let thead = document.createElement('thead');
                let tr = document.createElement('tr');

                let arr = data.th || [];
                arr.forEach(item => {
                    let th = document.createElement('th');
                    th.textContent = item;
                    tr.appendChild(th);
                });
                thead.appendChild(tr);

                return thead;
            },
            _buildTableTBody = (data = {}) => {
                let tbody = document.createElement('tbody');

                if (data.td) {
                    tbody.appendChild(_buildTableTBodyTR(data));
                }

                return tbody;
            },
            _buildTable = data => {
                let table = document.createElement('table');
                table.id = data.id;
                table.classList.add('kakashi-table', 'small');
                table.onclick = data.onclick;

                if (data.thead)
                    table.appendChild(data.thead);

                if (data.tbody)
                    table.appendChild(data.tbody);

                return table;
            };

        return {
            buildTable: _buildTable,
            buildTableTHead: _buildTableTHead,
            buildTableTBody: _buildTableTBody,
            buildTableTBodyTR: _buildTableTBodyTR,
        };
    }();

    /* Module Definition */

    Kakashi.modules.Content = _Content;

})(window.Kakashi);
