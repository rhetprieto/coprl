import {VBaseContainer} from "./base-container";
import {hookupComponents} from "./base-component";
import {eventHandlerMixin} from './mixins/event-handler';

export function initContent(e) {
    console.log('\tContent');
    hookupComponents(e, '.v-content', VContent, null);
}

export class VContent extends eventHandlerMixin(VBaseContainer) {
    constructor(element, mdcComponent) {
        super(element, mdcComponent);
        element.setAttribute('data-is-container', '');
    }
}
