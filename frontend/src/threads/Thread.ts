interface ThreadMessage<T> {
    id: number;
    data: T;
}

declare let onMessageCallback: any;
function startWorker() {
    'use strict';
    onmessage = function(e) {
        let postMessageCallback = function (data: any) {
            postMessage({
                id: e.data.id,
                data: data
            }, undefined);
        };
        onMessageCallback(e, postMessageCallback);
    };
}

class Thread<T_IN, T_OUT> {
    private worker: Worker;
    private lastMessageId = 0;

    constructor(f: (self: any, e: any, postMessage: (result: T_OUT) => void) => void) {
        let sourceCode = 'var onMessageCallback = ' + f.toString() + ';' +
            'var startWorker = ' + startWorker.toString() + ';' +
            'startWorker()';
            console.log(sourceCode);
        let blob = new Blob([sourceCode], { type: 'text/javascript' });
        this.worker = new Worker(window.URL.createObjectURL(blob));
    }

    public postMessage(data: T_IN): Promise<T_OUT> {
        return new Promise<any>((resolve) => {
            let messageId = this.getNextMessageId();
            let message: ThreadMessage<T_IN> = {
                id: messageId,
                data: data
            };
            this.worker.postMessage(message);
            this.worker.addEventListener('message', function(e) {
                let receivedData = <ThreadMessage<T_OUT>>e.data;
                if (receivedData.id === messageId) {
                    resolve(receivedData.data);
                }
            });
        });
    }

    private getNextMessageId(): number {
        this.lastMessageId++;
        if (this.lastMessageId === Infinity) {
            this.lastMessageId = 0;
        }
        return this.lastMessageId;
    }
}

export = Thread;
