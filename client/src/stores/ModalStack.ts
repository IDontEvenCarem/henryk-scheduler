import { defineStore } from "pinia";
import type {Component, Ref} from 'vue'

interface Modal {
    component: Component,
    callback: (result: any[]) => void,
    props: object,
    idx: number
}

export const useModalStack = defineStore({
    id: "modal-stack-store",
    state: () => {
        return {
            modals: [] as Modal[],
            index: 0
        }
    },
    actions: {
        pushModal(component: Component, props: object, callback: (result: any[]) => void) {
            this.modals.push({component, callback, props, idx: this.index++})
        },
        pop(result: any[]) {
            this.modals.pop()?.callback(result)
        }
    }
})