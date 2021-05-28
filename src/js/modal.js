// https://www.w3schools.com/howto/howto_css_modals.asp

(function(Kakashi) {

    'use strict';

    const _Modal = function() {

        const
            MODAL_SELECTOR = '#kakashi-modal',
            MODAL = '__modal__';

        const
            _asyncReflow = function(...taskArr) {
                taskArr.map(task => setTimeout(task, 25));
            },
            _addModalToPage = () => {
                let container = document.createElement('div');
                container.innerHTML = MODAL;
                document.body.appendChild(container.firstChild);
            },
            _addScriptToPage = () => {
                let script = document.createElement('script');
                /**
                 * https://micromodal.vercel.app/
                 * https://github.com/Ghosh/micromodal
                 */
                script.src = 'https://cdn.jsdelivr.net/npm/micromodal/dist/micromodal.min.js';
                document.body.appendChild(script);
            },
            _open = options => {
                let modal = document.querySelector(MODAL_SELECTOR);
                modal.querySelector('.modal__title').textContent = options.title;
                modal.querySelector('.modal__content').innerHTML = '';
                modal.querySelector('.modal__content').appendChild(options.content);
                modal.querySelector('.modal__btn-primary').onclick = options.mainAction;

                window.MicroModal.show(MODAL_SELECTOR.substring(1));
            },
            _init = () => {
                _asyncReflow(
                    _addModalToPage,
                    _addScriptToPage,
                );
            };

        return {
            init: _init,
            open: _open,
        };
    }();

    /* Module Definition */

    Kakashi.modules.Modal = _Modal;

})(window.Kakashi);
