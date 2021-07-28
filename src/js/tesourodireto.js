(function (Kakashi) {

    'use strict';

    const {
        Style,
        Snackbar,
        FAB,

    } = Kakashi.modules;

    const _Module = function () {

        const
            HOST_REGEX = /portalinvestidor\.tesourodireto\.com\.br/,

            PROTOCOLO_PAGE_REGEX = /Protocolo\/\d+/;

        const
            __copyOperation_protocolo_onclick = () => {
                let _baseInfo = {};

                document.querySelectorAll(".td-protocolo-content p")
                    .forEach(item => {
                        const lineArr = item.textContent
                            .split('\n')
                            .map(item => item.trim())
                            .filter(item => !!item);

                        const label = lineArr[ 0 ];
                        if (label == 'Data da operação') {
                            _baseInfo.date = lineArr[ 1 ];
                        }
                        if (label == 'Operação') {
                            let value = lineArr[ 1 ];
                            switch (value) {
                                case 'Investimento':
                                    _baseInfo.operation = 'APLICAÇÃO';
                                    break;
                                case 'Resgate':
                                    _baseInfo.operation = 'RESGATE';
                                    break;
                                default:
                                    _baseInfo.operation = value;
                                    break;
                            }
                        }
                    });

                let _operations = [];

                document.querySelectorAll(".td-protocolo-content .td-protocolo-box-info")
                    .forEach(boxOperation => {
                        let _operation = new Array(8);
                        _operation[ 0 ] = _baseInfo.date;
                        _operation[ 1 ] = _baseInfo.operation;

                        let product = boxOperation.querySelector("h3").textContent.trim().toUpperCase();
                        _operation[ 2 ] = product;
                        
                        if (_baseInfo.operation == 'APLICAÇÃO') {
                            _operation[ 5 ] = product.split(' ')[ 1 ].toUpperCase(); // indexador
                        }

                        boxOperation.querySelectorAll('p')
                            .forEach(item => {
                                const lineArr = item.textContent
                                    .split('\n')
                                    .map(item => item.trim())
                                    .filter(item => !!item);

                                const label = lineArr[ 0 ];
                                if (/^Valor líquido$/.test(label)) {
                                    if (_baseInfo.operation == 'APLICAÇÃO') {
                                        let value = lineArr[ 1 ];
                                        _operation[ 3 ] = value.replace('R$', '');
                                    }
                                }
                                if (/^Valor bruto$/.test(label)) {
                                    if (_baseInfo.operation == 'RESGATE') {
                                        let value = lineArr[ 1 ];
                                        _operation[ 3 ] = value.replace('R$', '');
                                    }
                                }
                                if (/^Taxa/.test(label)) { // custo
                                    if (!!!_operation[ 4 ] && _operation[ 4 ] !== 0)
                                        _operation[ 4 ] = 0;

                                    let value = lineArr[ 1 ];
                                    _operation[ 4 ] += parseFloat(value.replace('R$', '').replace(',', '.'));
                                }
                                if (label == 'Rentabilidade') { // taxa prefixada contratada
                                    if (_baseInfo.operation == 'APLICAÇÃO') {
                                        _operation[ 6 ] = lineArr[ 1 ];
                                    }
                                }
                            });
                        
                        _operation[ 4 ] = (_operation[ 4 ]+'').replace('.',',');

                        _operations.push(_operation.join('\t'));
                    });

                navigator.clipboard.writeText(_operations.join('\n'))
                    .then(() => {
                        Snackbar.fire('Copiado!');
                    });
            },
            _match = function (location) {
                return HOST_REGEX.test(location.host);
            },
            _init = function () {
                if (PROTOCOLO_PAGE_REGEX.test(location.pathname)) {
                    Style.inject();
                    FAB.build([ {
                        textLabel: 'Copiar Operação',
                        iconClass: 'lar la-copy',
                        click: __copyOperation_protocolo_onclick,
                    } ]);
                }
            };

        return {
            match: _match,
            init: _init,
        };
    }();

    Kakashi.modules.TesouroDireto = _Module;

})(Kakashi);
