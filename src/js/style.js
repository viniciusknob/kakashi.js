(function(Kakashi) {

    'use strict';

    const _Style = function() {

        const CSS = '__css__';

        const
            _addMaterialIconsToPage = () => {
                let link = document.createElement('link');
                link.rel = 'stylesheet';
                /**
                 * https://icons8.com/line-awesome
                 * https://github.com/icons8/line-awesome
                 */
                link.href = 'https://maxst.icons8.com/vue-static/landings/line-awesome/line-awesome/1.3.0/css/line-awesome.min.css';
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
