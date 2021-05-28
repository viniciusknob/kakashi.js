(function(Kakashi) {

    'use strict';

    const {
        Content,
        IndexedDB,
        Style,
        Snackbar,
        FAB,
        Modal,

    } = Kakashi.modules;

    Modal.init();

    const _StatusInvest = function() {

        const
            HOST_REGEX = /statusinvest\.com\.br/,
            ACOES_PAGE = "/acoes",
            MODAL_CONTENT_SELECTOR = '#kakashi-modal-content',
            TEXTAREA_TICKERS_SELECTOR = '#kakashi-tickers',
            RESULT_TABLE_SELECTOR = '#kakashi-result-table';

        let _assets = [];

        const
            $ = document.querySelector.bind(document),
            _buildStock = doc => {
                let stock = {
                    ticker: '',
                    company: {
                        name: '',
                        doc: '',
                        sector: '',
                        subsector: '',
                        segment: '',
                    },
                };

                stock.ticker = doc.querySelector('.company-pages').children[0].firstElementChild.textContent;
                stock.company.name = doc.querySelector('.company-description h4 span').textContent;
                stock.company.doc = doc.querySelector('.company-description h4 small').textContent;

                /*
                // Setor, Subsetor e Segmento
                let $parentElement;
                document.querySelectorAll('span.sub-value').forEach(item => {
                    if (item.textContent.indexOf('Setor') == -1) {
                        return;
                    }

                    $parentElement = item.parentElement.parentElement.parentElement.parentElement;
                });

                if ($parentElement) {
                    const info = $parentElement.querySelectorAll('strong');
                    stock.company.sector = info[0].textContent.toUpperCase();
                    stock.company.subsector = info[1].textContent.toUpperCase();
                    stock.company.segment = info[2].textContent.toUpperCase();
                }
                */

                return stock;
            },
            _addToModalTable = asset => {
                _assets.push(asset);
                let tableTBody = $(`${RESULT_TABLE_SELECTOR} tbody`);
                tableTBody.appendChild(Content.buildTableTBodyTR({
                    td: [
                        asset.ticker,
                        asset.company.name,
                        asset.company.doc,
                    ],
                }));
            },
            _iterableLoad = (tickers = []) => {
                if (tickers.length === 0)
                    return;

                const location = window.location;
                const protocol = location.protocol;
                const host = location.host;

                let ticker = tickers.shift();
                console.log(ticker);

                fetch(`${protocol}//${host}${ACOES_PAGE}/${ticker}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8'
                        },
                    })
                    .then(response => response.text())
                    .then(plainText => new DOMParser().parseFromString(plainText, 'text/html'))
                    .then(doc => _buildStock(doc))
                    .then(asset => _addToModalTable(asset))
                    .then(() => _iterableLoad(tickers));
            },
            __copyDataTable_onclick = () => {
                let _items = _assets
                    .map(item => {
                        return [item.ticker, item.company.name, item.company.doc].join('\t');
                    })
                    .reduce((acc, item) => acc.concat(`${acc.length ? '\n' : ''}${item}`));

                navigator.clipboard.writeText(_items)
                    .then(() => {
                        Snackbar.fire('Copiado!');
                    });
            },
            _processAssetList = () => {
                _assets = [];
                let tickers = $(TEXTAREA_TICKERS_SELECTOR).value;

                if (tickers) {
                    let content = $(MODAL_CONTENT_SELECTOR);

                    let table = $(RESULT_TABLE_SELECTOR);
                    if (table)
                        table.parentElement.removeChild(table);

                    table = Content.buildTable({
                        id: RESULT_TABLE_SELECTOR.substring(1),
                        onclick: __copyDataTable_onclick,
                        thead: Content.buildTableTHead({
                            th: ['Ticker', 'Company Name', 'Company Doc'],
                        }),
                        tbody: Content.buildTableTBody(),
                    });
                    content.appendChild(table);

                    _iterableLoad(tickers.split(','));
                }
            },
            _buildModalContent = () => {
                let content = document.createElement('div');

                let textarea = document.createElement('textarea');
                textarea.classList.add('form-control');
                textarea.id = TEXTAREA_TICKERS_SELECTOR.substring(1);
                textarea.rows = 5;
                content.appendChild(textarea);

                return content;
            },
            __copyAssetInfo_onclick = () => {
                const stock = _buildStock();

                navigator.clipboard.writeText(_toLineSheet(stock))
                    .then(() => {
                        Snackbar.fire('Copiado!');
                    });
            },
            _match = function(location) {
                return HOST_REGEX.test(location.host);
            },
            _init = function() {
                Style.inject();
                FAB.build([{
                        textLabel: 'Copiar Informações',
                        iconClass: 'lar la-copy',
                        click: __copyAssetInfo_onclick,
                    },
                    {
                        textLabel: 'Copiar Informações (lote)',
                        iconClass: 'lar la-clipboard',
                        click: () => {
                            Modal.open({
                                title: 'Lista de Ativos',
                                content: _buildModalContent(),
                                mainAction: _processAssetList,
                            });
                        },
                    }
                ]);
            };

        return {
            match: _match,
            init: _init,
        };
    }();

    Kakashi.modules.StatusInvest = _StatusInvest;

})(window.Kakashi);
