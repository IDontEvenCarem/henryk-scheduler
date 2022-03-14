import { defineStore } from "pinia";
import { jwtVerify, decodeJwt, importSPKI } from 'jose'

const baseUrl = import.meta.env.DEV ? 'http://localhost:2999' : 'https://dev-henryk.idecm.win/api';

export const useUserStore = defineStore({
    id: "user-store",
    state: () => {
        return {
            token: '',
            initialized: false
        }
    },
    getters: {
        username (state) {
            return decodeJwt(state.token).username
        },
        loggedIn (state) {
            return state.token != ''
        }
    },
    actions: {
        async login (username: string, password: string) {
            return fetch(
                    new URL('/login', baseUrl).toString(), 
                {
                method: "POST",
                body: JSON.stringify({username, password}),
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
                this.token = text;
                localStorage.setItem('loginToken', text)
            })
        },
        async register(username: string, password: string) {
            return fetch(new URL('/register', baseUrl).toString(), {
                method: 'POST',
                body: JSON.stringify({username, password}),
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
        logOut () {
            this.token = ''
            localStorage.removeItem('loginToken')
        },
        maybeInitialize() {
            if (this.initialized) return;
            this.initialized = true;
            const savedToken = localStorage.getItem('loginToken')
            if (savedToken) {
                fetch(new URL("/jwtpublickey", baseUrl).toString())
                .then(res => res.text())
                .then(text => importSPKI(text, 'PS256'))
                .then(pubkey => jwtVerify(savedToken, pubkey)
                    .catch(err => alert("You were logged out, as the authorization server has been updated"))
                )
                .then(res => {
                    this.token = savedToken
                    console.log(res)
                })
            }
        }
    }
})