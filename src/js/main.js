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
