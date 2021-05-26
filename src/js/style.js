(function(Kakashi) {

    'use strict';

    const _Style = function() {

        const CSS = '__css__';

        const
            _addMaterialIconsToPage = () => {
                let link = document.createElement('link');
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/fontawesome.min.css';
                link.rel = 'stylesheet';

                document.head.appendChild(link);
            },
            _addCustomCSSToPage = () => {
                let style = document.createElement('style');
                style.innerHTML = CSS;

                document.head.appendChild(style);
            },
            _inject = () => {
                _addMaterialIconsToPage();
                _addCustomCSSToPage();
            };

        return {
            inject: _inject,
        };
    }();

    /* Module Definition */

    Kakashi.modules.Style = _Style;

})(window.Kakashi);