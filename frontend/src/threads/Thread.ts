class Thread {
    constructor() {
        onmessage = (e: MessageEvent) => {
            this.on(e).then((data) => {
                this.post(e, data);
            });
        };
    }

    public on: (e: any) => Promise<any>;

    public post(e: any, data: any): void {
        data.shelves_message_id = e.data.shelves_message_id;
        (<any>postMessage)(data);
    }
}

export = Thread;
