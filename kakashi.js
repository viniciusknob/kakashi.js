(function() {
	'use strict';
	
	/*
		Notifications
	*/
	
	const _firedNotifications = [];
	
	if (('Notification' in window) && Notification.permission !== 'granted') {
		Notification.requestPermission(function (permission) {
			if (permission === 'granted') {
				_firedNotifications.push(new Notification("Hi! I'm Kakashi Hatake =)"));
				
				window.addEventListener('unload', () => {
					_firedNotifications.forEach(function(notification) {
						notification.close();
					});
				});
			}
		});
	}
		
	/*
		end Notifications
	*/
	
	const DB_NAME = 'KakashiDB';
	const STORE_NAME = 'stocks';
	const STORAGE_KEY = 'kakashi.tickers';

	let $ = document.querySelector.bind(document);
	
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
	
		const stock = buildStock();

		navigator.clipboard.writeText(toLineSheet(stock))
			.then(() => {
				copyItem.querySelector('span').textContent = 'COPIED!';
				setTimeout(() => {
					copyItem.querySelector('span').textContent = 'COPY';
				}, 2000);
				_firedNotifications.push(new Notification("Copied!"));
			});
			
		//window.open().document.write(`${toLineSheet(stock)}`);
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
		execWebScraping(); // start a sequence
	};
	
	
	// TextArea for tickers
	const referenceNode = $('.tab-nav-resume');
	const parentElement = document.querySelector('.container').cloneNode();
	const textarea = document.createElement('textarea');
	textarea.id = 'kakashiTickers';
	parentElement.appendChild(textarea);
	referenceNode.parentNode.insertBefore(parentElement, referenceNode.nextSibling);
	
	const goToNext = function(kakashiTickers) {
		const ticker = kakashiTickers.shift();
		console.log(`next ticker... ${ticker}`);
		
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(kakashiTickers));
		console.log(`set ${STORAGE_KEY}, update!`);
		
		window.location.href = `https://${['s','t','a','t','u','s','i','n','v','e','s','t','.','c','o','m','.','b','r','/','a','c','o','e','s','/'].join('')}${ticker}`;
	};
	
	// Sharingan!
	const execWebScraping = function() {
		
		let kakashiTickers = window.localStorage.getItem(STORAGE_KEY);
		console.log(`get ${STORAGE_KEY}`);
		console.log(`1. kakashiTickers: ${kakashiTickers}`);
		
		if (!kakashiTickers) {
			const tickers = $('#kakashiTickers').value;
			
			if (tickers) {			
				kakashiTickers = tickers.split(','); 
				console.log(`2. kakashiTickers: ${kakashiTickers}. First time!`);
				
				if (kakashiTickers.length) {
					return goToNext(kakashiTickers);
				}
				
			}
		}
		
		if (kakashiTickers) {
			if (typeof kakashiTickers === 'string') {
				kakashiTickers = JSON.parse(kakashiTickers);
				console.log(`3. kakashiTickers: ${kakashiTickers}`);
			}
			
			saveToDB(buildStock())
				.then(() => {					
					console.log(`stock saved in DB`);
					
					if (kakashiTickers.length) {
						goToNext(kakashiTickers);
						
					} else {
						window.localStorage.removeItem(STORAGE_KEY);
						console.log(`${STORAGE_KEY} removed!`);
						
						getOrCreateDB()
							.then(db => {
								const stocks = [];
								
								const objectStore = db.transaction([STORE_NAME], "readonly").objectStore(STORE_NAME);
								objectStore.openCursor().onsuccess = function(event) {
									var cursor = event.target.result;
									if (cursor) {
										console.log(`Cursor => key ${cursor.key} : value ${cursor.value}`);
										stocks.push(toLineSheet(cursor.value));
										cursor.continue();
									}
									else {
										console.log("Não existe mais registros!");
										navigator.clipboard.writeText(stocks.join('\n'))
											.then(() => {
												console.log('COPIED to navigator.clipboard');
												_firedNotifications.push(new Notification(`Done! ${stocks.length} assets were copied to the navigator.clipboard`));
											});
									}
								};
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
	};
	
	const buildStock = function() {
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

		let companySector, companySubsector, companySegment;
		if ($parentElement) {
			const info = $parentElement.querySelectorAll('strong');
			stock.company.sector = info[0].textContent.toUpperCase();
			stock.company.subsector = info[1].textContent.toUpperCase();
			stock.company.segment = info[2].textContent.toUpperCase();
		}
		
		return stock;
	};
	
	const toLineSheet = function(stock) {
		return `${stock.ticker}\t${stock.company.name}\t${stock.company.doc}\t${stock.company.sector}\t${stock.company.subsector}\t${stock.company.segment}`;
	};
	
	const getOrCreateDB = function() {
		
		return new Promise(function(resolve, reject) {
		
			//check for support
			if (!('indexedDB' in window)) {
				console.log('This browser doesn\'t support IndexedDB');
				reject();
			}
			
			const idb = window.indexedDB.open(DB_NAME);
			
			idb.onerror = function(event) {
				console.log('idb.onerror');
				console.dir(event);
				reject();
			};
			
			idb.onsuccess = function(event) {
				console.log('idb.onsuccess');
				
				const db = event.target.result;
				
				db.onerror = function(event) {
					console.log('Error', event.target.error.name);
				};
				
				resolve(db);
			};
			
			idb.onupgradeneeded = function(event) {
				console.log('idb.onupgradeneeded');
				
				const db = event.target.result;
				
				if (db.objectStoreNames.contains('STORE_NAME') === false) {
					db.createObjectStore(STORE_NAME, { keyPath: "ticker" });
					console.log('db.createObjectStore');
				}
			};
		});
	};
	
	const saveToDB = function(stock) {

		const addItemToDB = (db) => {
			return new Promise(function(resolve, reject) {
				console.log('addItemToDB');
				
				const transaction = db.transaction([STORE_NAME], "readwrite");
				
				transaction.oncomplete = function(event) {
					console.log('transaction.oncomplete');
					resolve();
				};

				transaction.onerror = function(event) {
					console.log('Error', event.target.error.name);
					reject();
				};

				const objectStore = transaction.objectStore(STORE_NAME);
				
				const singleKeyRange = IDBKeyRange.only(stock.ticker);
				const _cursor = objectStore.openCursor(singleKeyRange);
				
				_cursor.onsuccess = function(event) {
					console.log('_cursor.onsuccess');
					
					var cursor = event.target.result;
					let request = cursor ? objectStore.put(stock) : objectStore.add(stock);
					
					request.onsuccess = function(event) {
						console.log('Woot! Did it');
					};
					
					request.onerror = function(event) {
						console.log('Error', event.target.error.name);
						reject();
					};
				};
				
				_cursor.onerror = function(event) {
					console.log('Error', event.target.error.name);
					reject();
				};
			});
		};
	
		return getOrCreateDB()
			.then(db => addItemToDB(db))
			.catch(err => {
				console.log(`saveToDB => getOrCreateDB => catch: ${err}`);
				console.dir(arguments);
			});
	};
	
	// Sharingan!
	execWebScraping(); // following the sequence...
	
}());