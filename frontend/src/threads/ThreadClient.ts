// warning: T_IN and T_OUT cannot be primitives
class ThreadClient<T_IN, T_OUT> {
  private worker: Worker;
  private messageId = 0;

  constructor(WorkerConstructor: any) {
    this.worker = new WorkerConstructor();
  }

  public post(data: T_IN): Promise<T_OUT> {
    let messageId = this.getMessageId();

    (<any>data).shelves_message_id = messageId;

    return new Promise<T_OUT>((resolve) => {
      this.worker.addEventListener('message', (e) => {
        if ((<any>e.data).shelves_message_id === messageId) {
          resolve(e.data);
        }
      });

      this.worker.addEventListener('error', (e) => {
        console.error(e.message);
      });

      this.worker.postMessage(data);
    });
  }

  private getMessageId(): number {
    if (this.messageId++ === Infinity) {
      this.messageId = 0;
    }
    return this.messageId;
  }
}

export = ThreadClient;
