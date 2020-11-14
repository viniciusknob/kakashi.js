(function(window) {

	'use strict';

	const _Kakashi = function() {

		return {
			modules: {},
		};
	}();

	window.Kakashi = _Kakashi;

})(window);

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

(function(window, Notification, Kakashi) {
	
	'use strict';

	const _Notification = function() {

		const 
			_fired = [],

			_isGranted = function() {
				return Notification && Notification.permission === 'granted';
			},

			_requestPermission = function() {
				if (Notification) {
					Notification.requestPermission().then(permission => {
						if (permission === 'granted') {
							window.addEventListener('unload', () => {
								_fired.forEach(function(notification) {
									notification.close();
								});
							});
						}
					});
				}
			},

			_init = function() {
				if (_isGranted() === false) {
					_requestPermission();
				}
			},

			_fire = function(message) {
				if (_isGranted()) {
					_fired.push(new Notification('Kakashi says:', {
						body: message,
					}));
				}
				else {
					window.alert(message);
				}
			};

		return {
			init: _init,
			fire: _fire,
		};
	}();

	Kakashi.modules.Notification = _Notification;

})(window, window.Notification, window.Kakashi);

(function(Kakashi) {

    'use strict';

    const {
		IndexedDB,
		Notification,
    
    } = Kakashi.modules;
	
    Notification.init();
    
    const _StatusInvest = function() {

        const 
            LOCATION = `https://${['s','t','a','t','u','s','i','n','v','e','s','t','.','c','o','m','.','b','r','/','a','c','o','e','s','/'].join('')}`,
            STORAGE_KEY = 'kakashi.tickers';

        const
            $ = document.querySelector.bind(document),
            _toLineSheet = function(stock) {
                return `${stock.ticker}\t${stock.company.name}\t${stock.company.doc}\t${stock.company.sector}\t${stock.company.subsector}\t${stock.company.segment}`;
            },
            _buildStock = function() {
                const stock = {
                    ticker: '',
                    company: {
                        name: '',
                        doc: '',
                        sector: '',
                        subsector: '',
                        segment: '',
                    },
                };
                
                stock.ticker = $('.company-pages').children[0].firstElementChild.textContent;
                console.log(`=> build stock object for ${stock.ticker}`);
                
                stock.company.name = $('.company-description h4 span').textContent;
                stock.company.doc = $('.company-description h4 small').textContent;
        
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
                
                return stock;
            },
            _goToNext = function(kakashiTickers) {
                const ticker = kakashiTickers.shift();
                console.log(`next ticker... ${ticker}`);
                
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(kakashiTickers));
                console.log(`set ${STORAGE_KEY}, update!`);
                
                window.location.href = `${LOCATION}${ticker}`;
            },
            _saveToDB = function(stock) {
                return IndexedDB.getOrCreateDB()
                    .then(db => IndexedDB.addItemToDB(db, stock))
                    .catch(err => {
                        console.log(`saveToDB => getOrCreateDB => catch: ${err}`);
                        console.dir(arguments);
                    });
            },
            _execWebScraping = function() {
                let kakashiTickers = window.localStorage.getItem(STORAGE_KEY);
                console.log(`get ${STORAGE_KEY}`);
                console.log(`1. kakashiTickers: ${kakashiTickers}`);
                
                if (!kakashiTickers) {
                    const tickers = $('#kakashiTickers').value;
                    
                    if (tickers) {
                        kakashiTickers = tickers.split(','); 
                        console.log(`2. kakashiTickers: ${kakashiTickers}. First time!`);
                        
                        if (kakashiTickers.length) {
                            return _goToNext(kakashiTickers);
                        }
                    }
                }
                
                if (kakashiTickers) {
                    if (typeof kakashiTickers === 'string') {
                        kakashiTickers = JSON.parse(kakashiTickers);
                        console.log(`3. kakashiTickers: ${kakashiTickers}`);
                    }
                    
                    _saveToDB(_buildStock())
                        .then(() => {
                            console.log(`stock saved in DB`);
                            
                            if (kakashiTickers.length) {
                                _goToNext(kakashiTickers);
                                
                            } else {
                                window.localStorage.removeItem(STORAGE_KEY);
                                console.log(`${STORAGE_KEY} removed!`);
                                
                                IndexedDB.getOrCreateDB()
                                    .then(db => IndexedDB.toArray(db))
                                    .then(stocks => {
                                        stocks = stocks.map(_toLineSheet);
                                        
                                        navigator.clipboard.writeText(stocks.join('\n'))
                                            .then(() => {
                                                console.log('COPIED to navigator.clipboard');
                                                Notification.fire(`Done! ${stocks.length} assets were copied to the navigator.clipboard`);

                                                /**
                                                 * CRIANDO....
                                                 */
                                                IndexedDB.getOrCreateDB()
                                                    .then(db => IndexedDB.cleanTheHouse(db))
                                                    .then(() => console.log('cleanTheHouse end!'));
                                            });
                                    })
                                    .catch(() => {
                                        console.log(`saveToDB => getOrCreateDB => catch`);
                                        console.dir(arguments);
                                    });
                                
                            }
                        })
                        .catch(() => {
                            console.log('saveToDB something wrong!');
                        });
                        
                } else {
                    console.log('execWebScraping: nothing to do!');
                }
            },
            _match = function(location) {
                return location.href.startsWith(LOCATION);
            },
            _init = function() {
                const menu = $('.company-pages');
                const templateElement = menu.querySelector('li[data-target="#company-section"]');
                
                
                // Menu Item: Copy
                const copyItem = templateElement.cloneNode(true);
                copyItem.removeAttribute('data-target');
                copyItem.querySelector('a').removeAttribute('title');
                copyItem.querySelector('.material-icons').textContent = 'content_copy';
                copyItem.querySelector('span').textContent = 'COPY';
                menu.appendChild(copyItem);
                
                copyItem.onclick = () => {
                
                    const stock = _buildStock();
            
                    navigator.clipboard.writeText(_toLineSheet(stock))
                        .then(() => {
                            copyItem.querySelector('span').textContent = 'COPIED!';
                            setTimeout(() => {
                                copyItem.querySelector('span').textContent = 'COPY';
                            }, 2000);
                            Notification.fire('Copied!')
                        });
                        
                    //window.open().document.write(`${_toLineSheet(stock)}`);
                };
                
                // TODO
                // Cria opção na home do site: Coleta Avançada
                // deve abrir um textarea para receber a lista de ações
                
                // Menu Item: Copy All (from the list)
                const copyAllItem = templateElement.cloneNode(true);
                copyAllItem.removeAttribute('data-target');
                copyAllItem.querySelector('a').removeAttribute('title');
                copyAllItem.querySelector('.material-icons').textContent = 'content_copy';
                copyAllItem.querySelector('span').textContent = 'COPY ALL';
                menu.appendChild(copyAllItem);
                
                copyAllItem.onclick = () => {
                    _execWebScraping(); // start a sequence
                };
                
                
                // TextArea for tickers
                const referenceNode = $('.tab-nav-resume');
                const parentElement = document.querySelector('.container').cloneNode();
                const textarea = document.createElement('textarea');
                textarea.id = 'kakashiTickers';
                parentElement.appendChild(textarea);
                referenceNode.parentNode.insertBefore(parentElement, referenceNode.nextSibling);

                _execWebScraping();
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
		StatusInvest,
	
	} = Kakashi.modules;

	if (StatusInvest.match(window.location))
		StatusInvest.init();
	
})(window.Kakashi);
