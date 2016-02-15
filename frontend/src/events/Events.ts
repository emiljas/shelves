import EventArgs = require('./EventArgs')

class Events {
    private eventArgsList = new Array<EventArgs>();

    public addEventListener(element: Element | Document, type: string, listener: (e: Event) => any) {
        this.eventArgsList.push({ element, type, listener });
        element.addEventListener(type, listener, false);
    }

    public removeAllEventListeners() {
        for (let eventArgs of this.eventArgsList) {
            let element = eventArgs.element;
            let type = eventArgs.type;
            let listener = eventArgs.listener;
            element.removeEventListener(type, listener, false);
        }
    }
}

export = Events;
