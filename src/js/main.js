(function(Kakashi) {
	
	'use strict';

	const {
		StatusInvest,
		Avenue,
		Clear,
		TesouroDireto,
	
	} = Kakashi.modules;

	[
		StatusInvest,
		Avenue,
		Clear,
		TesouroDireto,
	]
	.map(mod => mod.match(window.location) && mod.init());

})(window.Kakashi);
