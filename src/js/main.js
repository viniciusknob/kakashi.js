(function(Kakashi) {
	
	'use strict';

	const {
		StatusInvest,
		Avenue,
		Clear,
	
	} = Kakashi.modules;

	[
		StatusInvest,
		Avenue,
		Clear,
	]
	.map(mod => mod.match(window.location) && mod.init());

})(window.Kakashi);
