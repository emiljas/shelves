import ThreadEvent = require('./ThreadEvent');

class Thread<T_IN, T_OUT> {
    constructor() {
        onmessage = (e: MessageEvent) => {
            this.on(e).then((data) => {
                this.post(e, data);
            });
        };
    }

    public on: (e: ThreadEvent<T_IN>) => Promise<T_OUT>;

    public post(e: any, data: any): void {
        data.shelves_message_id = e.data.shelves_message_id;
        (<any>postMessage)(data);
    }
}

export = Thread;
