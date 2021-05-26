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