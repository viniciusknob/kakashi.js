(function(Kakashi) {

    'use strict';

    const {
        Style,
		Snackbar,
        FAB,

    } = Kakashi.modules;

    const _Avenue = function() {

        const
            HOST = /pit\.avenue\.us/,

            REPORTS_STATEMENT_US = /reports\/statement-us/;

            const
                $ = document.querySelector.bind(document),
                __copyEarnings_reportStatementUs_onclick = function() {
                    const
                        _table = $('table.ui.striped.very.basic.table'),
                        _lines = _table.querySelectorAll('tbody tr'),
                        _defineType = desc => {
                            if (/Impostos.+tax/.test(desc))
                                return 'T';

                            if (/Dividendos.+dividend/.test(desc))
                                return 'D';

                            throw new Error(`not supported: ${desc}`);
                        },
                        _items = Array.from(_lines)
                            .map(tr => {
                                try {
                                    const tdList = tr.querySelectorAll('td');
                                    if (tdList.length === 1) {
                                        const td = tdList[0];
                                        return {
                                            date: td.textContent,
                                        };
                                    }
                                    else {
                                        const desc = tdList[2].textContent;
                                        const type = _defineType(desc);
                                        return {
                                            date: '',
                                            asset: desc.match(/\.\s(\w+)\s/)[1],
                                            type,
                                            value: tdList[3].textContent.match(/\d+,\d+/)[0],
                                        };
                                    }
                                } catch(e) {
                                    return;
                                }
                            })
                            .filter(item => !!item)
                            .map((item,idx,arr) => {
                                if (item.date.length === 0) {
                                    item.date = arr[idx-1].date;
                                }
                                return item;
                            })
                            .filter(item => !!item.asset)
                            .map(item => {
                                return [item.date, item.asset, item.type, item.value].join('\t');
                            })
                            .reduce((acc,item) => acc.concat(`${acc.length ? '\n' : ''}${item}`));

                    navigator.clipboard.writeText(_items)
                        .then(() => {
                            Snackbar.fire('Copiado!');
                        });
                },
                _match = function(location) {
                    return HOST.test(location.host);
                },
                _init = function() {
                    if (REPORTS_STATEMENT_US.test(location.pathname)) {
                        Style.inject();
                        FAB.build([
                            {
                                textLabel: 'Copiar Proventos/Taxes',
                                iconClass: 'fa-copy',
                                click: __copyEarnings_reportStatementUs_onclick,
                            }
                        ]);
                    }
                };

        return {
            match: _match,
            init: _init,
        };
    }();

    Kakashi.modules.Avenue = _Avenue;

})(window.Kakashi);
