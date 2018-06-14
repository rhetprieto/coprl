import {MDCMenu} from '@material/menu';
import {Corner} from '@material/menu';


function createMenuHandler(menu, element) {
    return function () {
        let offset = parseInt(element.dataset.rightOffset);
        let placement = element.dataset.placement === 'contextual' ? Corner.TOP_LEFT : Corner.BOTTOM_LEFT
        menu.setAnchorMargin({left: offset});
        menu.setAnchorCorner(placement);
        menu.open = !menu.open;
    };
}

export function initMenus() {
    console.log('\tMenus');

    var components = document.querySelectorAll('.v-menu');
    if (components) {
        for (var i = 0; i < components.length; i++) {
            var component = components[i];
            if (!component.mdcComponent) {
                component.mdcComponent = new MDCMenu(component);
                var anchor = component.closest('.mdc-menu-anchor');
                if (anchor) {
                    var menulink = anchor.querySelector('.v-menu-click');
                    menulink.addEventListener('click', createMenuHandler(component.mdcComponent, component));
                }

            }
        }
    }
}
