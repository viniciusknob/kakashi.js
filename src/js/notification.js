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
