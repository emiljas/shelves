'use strict';

const SERVER_URL = 'http://localhost:3000';

export default class Repository {
    protected getJson<T>(url: string): Promise<T> {
        return new Promise<T>(function(resolve, reject) {
            let req = new XMLHttpRequest();
            req.onload = function(e) {
                if (req.status === 200) {
                    resolve(JSON.parse(req.responseText));
                } else {
                    reject({
                        status: req.status,
                        message: req.responseText
                    });
                }
            };
            req.open('get', SERVER_URL + url, true);
            req.send();
        });
    }
}
