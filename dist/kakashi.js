(function(window) {

	'use strict';

	const _Kakashi = function() {

		return {
			modules: {},
		};
	}();

	window.Kakashi = _Kakashi;

})(window);

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

(function(indexedDB, Kakashi) {
	'use strict';

	const _IndexedDB = function() {

		const DB_NAME = 'KakashiDB';
		const STORE_NAME = 'stocks';

		let _db = undefined;

		const
			_getOrCreateDB = () => {
				return new Promise((resolve, reject) => {

					if (_db) {
						resolve(_db);
						return;
					}
				
					//check for support
					if (!(indexedDB)) {
						console.log('This browser doesn\'t support IndexedDB');
						reject();
						return;
					}
					
					const idb = indexedDB.open(DB_NAME);
					
					idb.onerror = function(event) {
						console.log('idb.onerror');
						console.dir(event);
						reject();
					};
					
					idb.onsuccess = (event) => {
						console.log('idb.onsuccess');
						
						_db = event.target.result;
						
						_db.onerror = function(event) {
							console.log('Error', event.target.error.name);
						};
						
						resolve(_db);
					};
					
					idb.onupgradeneeded = function(event) { // specific by site
						console.log('idb.onupgradeneeded');
						
						const db = event.target.result;
						
						if (db.objectStoreNames.contains(STORE_NAME) === false) {
							db.createObjectStore(STORE_NAME, { keyPath: "ticker" });
							console.log('db.createObjectStore');
						}
					};
				});
			},
			_toArray = function(db) {
				return new Promise(function(resolve, reject) {
					const stocks = [];
					const objectStore = db.transaction([STORE_NAME], "readonly").objectStore(STORE_NAME);
					objectStore.openCursor().onsuccess = function(event) {
						var cursor = event.target.result;
						if (cursor) {
							console.log(`Cursor => key ${cursor.key} : value ${cursor.value}`);
							stocks.push(cursor.value);
							cursor.continue();
						} else {
							resolve(stocks);
						}
					};
				});
			},
			_addItemToDB = function(db, stock) {
				return new Promise(function(resolve, reject) {
					console.log('_addItemToDB => Enter');
					
					const transaction = db.transaction([STORE_NAME], "readwrite");
					
					transaction.oncomplete = function(event) {
						console.log('_addItemToDB => transaction.oncomplete');
						resolve();
					};
	
					transaction.onerror = function(event) {
						console.log('_addItemToDB => Error', event.target.error.name);
						reject();
					};
	
					const objectStore = transaction.objectStore(STORE_NAME);
					
					const singleKeyRange = IDBKeyRange.only(stock.ticker);
					const _cursor = objectStore.openCursor(singleKeyRange);
					
					_cursor.onsuccess = function(event) {
						console.log('_addItemToDB => _cursor.onsuccess');
						
						var cursor = event.target.result;
						let request = cursor ? objectStore.put(stock) : objectStore.add(stock);
						
						request.onsuccess = function(event) {
							console.log('_addItemToDB => Woot! Did it');
						};
						
						request.onerror = function(event) {
							console.log('_addItemToDB => Error', event.target.error.name);
							reject();
						};
					};
					
					_cursor.onerror = function(event) {
						console.log('_addItemToDB => Error', event.target.error.name);
						reject();
					};
				});
			},
			_cleanTheHouse = function(db) {
				return new Promise(function(resolve, reject) {
					console.log('_cleanTheHouse');
					
					const transaction = db.transaction([STORE_NAME], "readwrite");
					
					transaction.oncomplete = function(event) {
						console.log('_cleanTheHouse => transaction.oncomplete');
						resolve();
					};
	
					transaction.onerror = function(event) {
						console.log('_cleanTheHouse => Error', event.target.error.name);
						reject();
					};
	
					const objectStore = transaction.objectStore(STORE_NAME);

					const _cursor = objectStore.openCursor();
					
					_cursor.onsuccess = function(event) {
						console.log('_cleanTheHouse => _cursor.onsuccess');
						
						var cursor = event.target.result;
						if (cursor) {
							console.log('_cleanTheHouse => _cursor exists');
							let request = objectStore.delete(cursor.key);
							
							request.onsuccess = function(event) {
								console.log('_cleanTheHouse => Woot! Did it');
							};
							
							request.onerror = function(event) {
								console.log('_cleanTheHouse => Error', event.target.error.name);
								reject();
							};

							cursor.continue();
						} else {
							console.log('_cleanTheHouse => _cursor undefined');
							resolve();
						}
					};
					
					_cursor.onerror = function(event) {
						console.log('_cleanTheHouse => Error', event.target.error.name);
						reject();
					};
				});
			};

		return {
			getOrCreateDB: _getOrCreateDB,
			toArray: _toArray,
			addItemToDB: _addItemToDB,
			cleanTheHouse: _cleanTheHouse,
		};
	}();

	Kakashi.modules.IndexedDB = _IndexedDB;

})(window.indexedDB, window.Kakashi);

(function(Kakashi) {

    'use strict';

    const _Style = function() {

        const CSS = '.small{font-size:80%;font-weight:400}.kakashi-table{width:100%;margin-top:1rem;background-color:transparent}.kakashi-table td,.kakashi-table th{padding:.3rem}.fab-container{position:fixed;bottom:50px;right:50px;z-index:999;cursor:pointer}.fab-icon-holder{width:50px;height:50px;border-radius:100%;background:#f58634;box-shadow:0 6px 20px rgba(0,0,0,.2)}.fab-image-holder{background-image:url(https://imgur.com/nbL1mka.png);background-size:58px;background-repeat:no-repeat;background-position:top}.fab-icon-holder:hover{opacity:.8}.fab-icon-holder i{display:flex;align-items:center;justify-content:center;height:100%;font-size:25px;color:#fff}.fab-main{width:60px;height:60px;background-color:#3e4095}.fab-options{list-style-type:none;margin:0;position:absolute;bottom:70px;right:0;opacity:0;transition:all .3s ease;transform:scale(0);transform-origin:85% bottom}.fab-main:hover+.fab-options,.fab-options:hover{opacity:1;transform:scale(1)}.fab-options li{display:flex;justify-content:flex-end;padding:5px}.fab-label{padding:2px 5px;align-self:center;user-select:none;white-space:nowrap;border-radius:3px;font-size:16px;background:#666;color:#fff;box-shadow:0 6px 20px rgba(0,0,0,.2);margin-right:10px}.micromodal{font-family:-apple-system,BlinkMacSystemFont,avenir next,avenir,helvetica neue,helvetica,ubuntu,roboto,noto,segoe ui,arial,sans-serif}.modal__overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);display:flex;justify-content:center;align-items:center;z-index:999999}.modal__container{background-color:#fff;padding:30px;max-width:500px;max-height:100vh;border-radius:4px;overflow-y:auto;box-sizing:border-box;min-width:30%}.modal__header{display:flex;justify-content:space-between;align-items:center}.modal__title{margin-top:0;margin-bottom:0;font-weight:600;font-size:1.25rem;line-height:1.25;color:#3e4095;box-sizing:border-box}.modal__close{background-color:transparent!important;border:0}.modal__close:before{content:"\\2715"}.modal__close:focus,.modal__close:hover{color:#000;text-decoration:none;opacity:.75}.modal__content{margin-top:2rem;margin-bottom:2rem;line-height:1.5;color:rgba(0,0,0,.8)}.modal__footer{text-align:right}.modal__btn{font-size:.875rem;padding-left:1rem;padding-right:1rem;padding-top:.5rem;padding-bottom:.5rem;background-color:#e6e6e6!important;color:rgba(0,0,0,.8);border-radius:.25rem;border-style:none;border-width:0;cursor:pointer;-webkit-appearance:button;text-transform:none;overflow:visible;line-height:1.15;margin:0;will-change:transform;-moz-osx-font-smoothing:grayscale;-webkit-backface-visibility:hidden;backface-visibility:hidden;-webkit-transform:translateZ(0);transform:translateZ(0);transition:-webkit-transform .25s ease-out;transition:transform .25s ease-out;transition:transform .25s ease-out,-webkit-transform .25s ease-out}.modal__btn:focus,.modal__btn:hover{-webkit-transform:scale(1.05);transform:scale(1.05)}.modal__btn-primary{background-color:#3e4095!important;color:#fff}@keyframes mmfadeIn{from{opacity:0}to{opacity:1}}@keyframes mmfadeOut{from{opacity:1}to{opacity:0}}@keyframes mmslideIn{from{transform:translateY(15%)}to{transform:translateY(0)}}@keyframes mmslideOut{from{transform:translateY(0)}to{transform:translateY(-10%)}}.micromodal-slide{display:none}.micromodal-slide.is-open{display:block}.micromodal-slide[aria-hidden=false] .modal__overlay{animation:mmfadeIn .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=false] .modal__container{animation:mmslideIn .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=true] .modal__overlay{animation:mmfadeOut .3s cubic-bezier(0,0,.2,1)}.micromodal-slide[aria-hidden=true] .modal__container{animation:mmslideOut .3s cubic-bezier(0,0,.2,1)}.micromodal-slide .modal__container,.micromodal-slide .modal__overlay{will-change:transform}.modal__container .form-control{display:block;width:100%;padding:.375rem .75rem;font-size:1rem;line-height:1.5;color:#495057;background-color:#fff;background-clip:padding-box;border:1px solid #ced4da;border-radius:.25rem;transition:border-color .15s ease-in-out,box-shadow .15s ease-in-out}.modal__container .form-control:focus{color:#495057;background-color:#fff;border-color:#80bdff;outline:0;box-shadow:0 0 0 .2rem rgb(0 123 255 / 25%)}.modal__container textarea{height:initial;overflow:auto;resize:vertical}#snackbar{visibility:hidden;opacity:0;min-width:250px;margin-left:-125px;background-color:#3e4095;color:#fff;text-align:center;border-radius:2px;padding:16px;position:fixed;z-index:9999999;left:50%;bottom:20%;font-size:17px}#snackbar.show{visibility:visible;opacity:1;-webkit-animation:fadein .5s,fadeout .5s 2.5s;animation:fadein .5s,fadeout .5s 2.5s}@-webkit-keyframes fadein{from{bottom:0;opacity:0}to{bottom:20%;opacity:1}}@keyframes fadein{from{bottom:0;opacity:0}to{bottom:20%;opacity:1}}@-webkit-keyframes fadeout{from{bottom:20%;opacity:1}to{bottom:0;opacity:0}}@keyframes fadeout{from{bottom:20%;opacity:1}to{bottom:0;opacity:0}}';

        const
            _addMaterialIconsToPage = () => {
                let link = document.createElement('link');
                link.rel = 'stylesheet';
                /**
                 * https://icons8.com/line-awesome
                 * https://github.com/icons8/line-awesome
                 */
                link.href = 'https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css';
                document.head.appendChild(link);
            },
            _addCustomCSSToPage = () => {
                let style = document.createElement('style');
                style.innerHTML = CSS;
                document.head.appendChild(style);
            },
            _inject = () => {
                _addMaterialIconsToPage();
                _addCustomCSSToPage();
            };

        return {
            inject: _inject,
        };
    }();

    /* Module Definition */

    Kakashi.modules.Style = _Style;

})(window.Kakashi);

(function(Kakashi) {

    'use strict';

    const _Snackbar = function() {

        const
            SHOW_CLASS = 'show',
            $ = document.querySelector.bind(document),
            _fire = message => {
                let x = $('#snackbar');

                if (!!!x) {
                    x = document.createElement('div');
                    x.id = 'snackbar';
                    $('body').appendChild(x);
                }

                x.textContent = message;

                x.classList.add(SHOW_CLASS);
                setTimeout(() => { x.classList.remove(SHOW_CLASS) }, 2850);
            };

        return {
            fire: _fire,
        };
    }();

    /* Module Definition */

    Kakashi.modules.Snackbar = _Snackbar;

})(window.Kakashi);
// https://stackoverflow.com/questions/29209244/css-floating-action-button

(function(Kakashi) {

    'use strict';

    const _FAB = function() {

        const
            _buildIconHolder = iconClass => {
                let icon_holder = document.createElement('div');
                icon_holder.classList.add('fab-icon-holder');

                if (iconClass) {
                    let i = document.createElement('i');
                    i.classList.add(...iconClass.split(' '));
                    icon_holder.appendChild(i);
                } else {
                    icon_holder.classList.add('fab-main', 'fab-image-holder');
                }

                return icon_holder;
            },
            _buildLabel = textLabel => {
                let label = document.createElement('span');
                label.classList.add('fab-label');
                label.textContent = textLabel;
                return label;
            },
            _buildItem = options => {
                let item = document.createElement('li');

                item.appendChild(_buildLabel(options.textLabel));
                item.appendChild(_buildIconHolder(options.iconClass));
                item.onclick = options.click;

                return item;
            },
            _buildFabAndAddToPage = optionsArr => {
                let fab = document.createElement('div');
                fab.classList.add('fab-container');

                let ul = document.createElement('ul');
                ul.classList.add('fab-options');

                optionsArr.forEach(options => {
                    ul.appendChild(_buildItem(options));
                });

                fab.appendChild(_buildIconHolder());
                fab.appendChild(ul);

                document.body.appendChild(fab);
            };

        return {
            build: _buildFabAndAddToPage,
        };
    }();

    Kakashi.modules.FAB = _FAB;

})(window.Kakashi);

// https://www.w3schools.com/howto/howto_css_modals.asp

(function(Kakashi) {

    'use strict';

    const _Modal = function() {

        const
            MODAL_SELECTOR = '#kakashi-modal',
            MODAL = '<div class="micromodal micromodal-slide" id="kakashi-modal" aria-hidden="true"><div class="modal__overlay" tabindex="-1" data-micromodal-close><div class="modal__container" role="dialog" aria-modal="true" aria-labelledby="kakashi-modal-title"><header class="modal__header"><h2 class="modal__title" id="kakashi-modal-title"></h2><button class="modal__close" aria-label="Close modal" data-micromodal-close></button></header><main class="modal__content" id="kakashi-modal-content"></main><footer class="modal__footer"><button class="modal__btn modal__btn-primary">Continue</button> <button class="modal__btn" data-micromodal-close aria-label="Close this dialog window">Close</button></footer></div></div></div>';

        const
            _asyncReflow = function(...taskArr) {
                taskArr.map(task => setTimeout(task, 25));
            },
            _addModalToPage = () => {
                let container = document.createElement('div');
                container.innerHTML = MODAL;
                document.body.appendChild(container.firstChild);
            },
            _addScriptToPage = () => {
                let script = document.createElement('script');
                /**
                 * https://micromodal.vercel.app/
                 * https://github.com/Ghosh/micromodal
                 */
                script.src = 'https://cdn.jsdelivr.net/npm/micromodal/dist/micromodal.min.js';
                document.body.appendChild(script);
            },
            _open = options => {
                let modal = document.querySelector(MODAL_SELECTOR);
                modal.querySelector('.modal__title').textContent = options.title;
                modal.querySelector('.modal__content').innerHTML = '';
                modal.querySelector('.modal__content').appendChild(options.content);
                modal.querySelector('.modal__btn-primary').onclick = options.mainAction;

                window.MicroModal.show(MODAL_SELECTOR.substring(1));
            },
            _init = () => {
                _asyncReflow(
                    _addModalToPage,
                    _addScriptToPage,
                );
            };

        return {
            init: _init,
            open: _open,
        };
    }();

    /* Module Definition */

    Kakashi.modules.Modal = _Modal;

})(window.Kakashi);

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

(function(Kakashi) {

    'use strict';

    const {
        Style,
        Snackbar,
        FAB,

    } = Kakashi.modules;

    const _Avenue = function() {

        const
            HOST_REGEX = /pit\.avenue\.us/,

            REPORTS_STATEMENT_US_PAGE_REGEX = /reports\/statement-us/;

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
                            } else {
                                const desc = tdList[2].textContent;
                                const type = _defineType(desc);
                                return {
                                    date: '',
                                    asset: desc.match(/\.\s(\w+)\s/)[1],
                                    type,
                                    value: tdList[3].textContent.match(/\d+,\d+/)[0],
                                };
                            }
                        } catch (e) {
                            return;
                        }
                    })
                    .filter(item => !!item)
                    .map((item, idx, arr) => {
                        if (item.date.length === 0) {
                            item.date = arr[idx - 1].date;
                        }
                        return item;
                    })
                    .filter(item => !!item.asset)
                    .map(item => {
                        return [item.date, item.asset, item.type, item.value].join('\t');
                    })
                    .reduce((acc, item) => acc.concat(`${acc.length ? '\n' : ''}${item}`));

                navigator.clipboard.writeText(_items)
                    .then(() => {
                        Snackbar.fire('Copiado!');
                    });
            },
            _match = function(location) {
                return HOST_REGEX.test(location.host);
            },
            _init = function() {
                if (REPORTS_STATEMENT_US_PAGE_REGEX.test(location.pathname)) {
                    Style.inject();
                    FAB.build([{
                        textLabel: 'Copiar Proventos/Taxes',
                        iconClass: 'lar la-copy',
                        click: __copyEarnings_reportStatementUs_onclick,
                    }]);
                }
            };

        return {
            match: _match,
            init: _init,
        };
    }();

    Kakashi.modules.Avenue = _Avenue;

})(window.Kakashi);

(function(Kakashi) {
	
	'use strict';

	const {
		StatusInvest,
		Avenue,
	
	} = Kakashi.modules;

	if (StatusInvest.match(window.location))
		StatusInvest.init();
	
	if (Avenue.match(window.location))
		Avenue.init();

})(window.Kakashi);
