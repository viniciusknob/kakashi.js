(function (Kakashi) {

    'use strict';

    const {
        Style,
        Snackbar,
        FAB,

    } = Kakashi.modules;

    const _Module = function () {

        const
            HOST_REGEX = /pro\.clear\.com\.br/,

            MINHA_CONTA_EXTRATO_PAGE_REGEX = /#minha-conta\/extrato/,

            MINHA_CONTA_EXTRATO_PROVENTOS_REGEX = /DIVIDENDOS|JUROS.+CAPITAL|RENDIMENTO/;

        const
            __copyEarnings_minhaContaExtrato_onclick = () => {
                let _items = Array
                    .from(document.querySelectorAll('.exchange-items .item'))
                    .filter(item => MINHA_CONTA_EXTRATO_PROVENTOS_REGEX.test(item.querySelector('.cont-description').textContent))
                    .map(item => {
                        // capture data
                        return {
                            date: item.querySelector('.cont-date.operation').textContent.trim(),
                            desc: item.querySelector('.cont-description').textContent.trim(),
                            value: item.querySelector('.cont-value').textContent.trim(),
                        };
                    })
                    .map(item => {
                        // format/handle data
                        return {
                            date: item.date.trim(),
                            desc: item.desc.replace('* PROV *', '').trim(),
                            value: item.value.trim(),
                        };
                    })
                    .map(item => {
                        // build final object
                        return [
                            item.date,
                            item.desc.match(/[A-Z]{4}\d{1,2}$/)[ 0 ],
                            item.desc.substring(0, 1),
                            item.value,
                        ].join('\t');
                    })
                    .join('\n');

                navigator.clipboard.writeText(_items)
                    .then(() => {
                        Snackbar.fire('Copiado!');
                    });
            },
            _match = function (location) {
                return HOST_REGEX.test(location.host);
            },
            _init = function () {
                if (MINHA_CONTA_EXTRATO_PAGE_REGEX.test(location.hash)) {
                    if (Array.from(document.body.classList).find(clazz => clazz == 'extrato')) { // iframe
                        Style.inject();
                        FAB.build([ {
                            textLabel: 'Copiar Proventos',
                            iconClass: 'lar la-copy',
                            click: __copyEarnings_minhaContaExtrato_onclick,
                        } ]);
                    }
                }
            };

        return {
            match: _match,
            init: _init,
        };
    }();

    Kakashi.modules.Clear = _Module;

})(Kakashi);
