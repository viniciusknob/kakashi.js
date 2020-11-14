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
