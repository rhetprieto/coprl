import {expandParams} from './action_parameter';
import {expandParam} from './action_parameter';
import {VBase} from './base';
import {initialize} from '../initialize';
import {uninitialize} from '../uninitialize';

const MOUSE_DELAY_AMOUNT = 0; // ms
const KEYBOARD_DELAY_AMOUNT = 500; // ms

// Create a NodeList from raw HTML.
// Whitespace is trimmed to avoid creating superfluous text nodes.
function htmlToNodes(html, root = document) {
    const template = root.createElement('template');

    template.innerHTML = html.trim();

    return template.content.children;
}

function assertXHRSupport() {
    if (typeof window.XMLHttpRequest !== 'function') {
        throw new Error('Support for XMLHttpRequest is required');
    }
}

function delayAmount(event) {
    if (typeof window['InputEvent'] === 'function') {
        return event instanceof InputEvent ?
            KEYBOARD_DELAY_AMOUNT :
            MOUSE_DELAY_AMOUNT;
    }

    return event instanceof MouseEvent ?
        MOUSE_DELAY_AMOUNT :
        KEYBOARD_DELAY_AMOUNT;
}

// Replaces a given element with the contents of the call to the url.
// parameters are appended.
export class VReplaces extends VBase {
    constructor(options, url, params, event, root) {
        super(options, root);

        assertXHRSupport();

        this.element_id = options.target;
        this.url = url;
        this.params = params;
        this.event = event;
    }

    call(results, eventParams = []) {
        this.clearErrors();

        const httpRequest = new XMLHttpRequest();
        const root = this.root;
        const elementId = this.element_id;
        const insert = this.options.insert;
        const verb = this.options.verb.toUpperCase();
        let body = this.options.body;
        const encode_body = this.options.encode_body;
        const nodeToReplace = root.getElementById(elementId);
        const expandedParams = expandParams(results, this.params);
        if (body) {
            body = expandParam(results, body);
        }

        const url = this.buildURL(this.url, expandedParams, this.inputValues(),
            eventParams,
            [['grid_nesting', this.options.grid_nesting]]);
        const delayAmt = delayAmount(this.event);

        return new Promise(function(resolve, reject) {
            if (!nodeToReplace) {
                let msg = 'Unable to located node: \'' + elementId + '\'' +
                    ' This usually the result of issuing a replaces action ' +
                    'and specifying a element id that does not currently ' +
                    'exist on the page.';
                console.error(msg);
                results.push({
                    action: 'replaces',
                    statusCode: 500,
                    contentType: 'v/errors',
                    content: {exception: msg},
                });
                reject(results);
            }
            else {
                clearTimeout(nodeToReplace.vTimeout);
                nodeToReplace.vTimeout = setTimeout(function() {
                    httpRequest.onreadystatechange = function() {
                        if (httpRequest.readyState === XMLHttpRequest.DONE) {
                            console.debug(httpRequest.status + ':' +
                                this.getResponseHeader('content-type'));
                            if (httpRequest.status === 200) {
                                // NodeList.childNodes is "live", meaning DOM
                                // changes to its entries will mutate the list
                                // itself.
                                // (see: https://developer.mozilla.org/en-US/docs/Web/API/NodeList)
                                // Array.from clones the entries, creating a
                                // "dead" list.
                                const newNodes = Array.from(htmlToNodes(
                                    httpRequest.responseText,
                                    root,
                                ));

                                // Insert the node inside the target
                                if (insert) {
                                    while (nodeToReplace.firstChild) {
                                        uninitialize(nodeToReplace);
                                        nodeToReplace.removeChild(
                                            nodeToReplace.firstChild);
                                    }
                                    nodeToReplace.append(...newNodes);
                                }
                                // Replace the target
                                else {
                                    uninitialize(nodeToReplace);
                                    nodeToReplace.replaceWith(...newNodes);
                                }
                                for (const node of newNodes) {
                                    initialize(node);
                                }

                                results.push({
                                    action: 'replaces',
                                    statusCode: httpRequest.status,
                                    contentType: this.getResponseHeader(
                                        'content-type'),
                                    content: httpRequest.responseText,
                                });
                                resolve(results);
                            }
                            else {
                                results.push({
                                    action: 'replaces',
                                    statusCode: httpRequest.status,
                                    contentType: this.getResponseHeader(
                                        'content-type'),
                                    content: httpRequest.responseText,
                                });
                                reject(results);
                            }
                        }
                    };
                    console.debug(verb + ':' + url);
                    httpRequest.open(verb, url, true);
                    httpRequest.setRequestHeader('X-NO-LAYOUT', true);
                    if (encode_body === 'json') {
                        body = JSON.stringify(body);
                    }
                    body ? httpRequest.send(body) : httpRequest.send();
                }, delayAmt);
            }
        });
    }
}
