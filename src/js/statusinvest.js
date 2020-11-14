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
