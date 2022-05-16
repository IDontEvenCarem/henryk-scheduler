import { database } from "./database";

let token: string | undefined = undefined;

export default {
    IsLoggedIn() {
        return token !== undefined;
    },

    Login(username: string, password: string) {
        if (this.IsLoggedIn()) {
            return;
        }
        return fetch('/api/login',
            {
                method: "POST",
                body: JSON.stringify({ username, password }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => {
                if (res.ok) {
                    return res.text();
                } else {
                    return Promise.reject("Wrong credentials")
                }
            })
            .then(text => {
                token = text;
            })
    },

    Register(username: string, password: string) {
        return fetch('/api/register', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.ok) {
                return res.text()
            } else {
                return Promise.reject("Could not register")
            }
        }).then(text => {
            return text == "user created"
        })
    },

    Change(added: any[], deleted: any[], modified: any[]) {
        return fetch('/api/change', {
            method: 'POST',
            body: JSON.stringify({ added, deleted, modified }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.ok) {
                return res.text()
            } else {
                return Promise.reject("Could not apply the changes")
            }
        }).then(text => {
            return text == "Changes approved"
        })
    },

    Upsync() {
        return fetch('/api/upsync', {
            method: 'POST',
            body: JSON.stringify({}),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.ok) {
                return res.text()
            } else {
                return Promise.reject("Could not make an upsync")
            }
        }).then(text => {
            return text == "Upsync done"
        })
    },

    Downsync() {
        return fetch('/api/downsync', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.ok) {
                return res.json()
            } else {
                return Promise.reject("Could not make an downsync")
            }
        }).then(text => {
            return text == "downsync"
        })
    },
    History() {
        return fetch('/api/history', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(res => {
            if (res.ok) {
                return res.json()
            } else {
                return Promise.reject("Could not make an downsync")
            }
        }).then(text => {
            return text == "history"
        })
    }
}
