(function(Kakashi) {
	
	'use strict';

	const {
		StatusInvest,
	
	} = Kakashi.modules;

	if (StatusInvest.match(window.location))
		StatusInvest.init();
	
})(window.Kakashi);
