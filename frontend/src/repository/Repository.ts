'use strict';

const SERVER_URL = 'http://localhost:3000';
// const SERVER_URL = 'http://192.168.1.104:3000';
// const SERVER_URL = 'http://www.api.devrossmann.pl';

class Repository {
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

export = Repository;
