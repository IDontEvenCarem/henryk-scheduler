import { defineStore } from "pinia";
import type {Component, ComponentOptions, ObjectEmitsOptions} from 'vue'

interface Modal {
    component: Component,
    cancellable: boolean,
    callback: (canceled: boolean, result: any) => void,
    props: any,
    idx: number
}

type PropsOf<T> = T extends ComponentOptions<infer P> ? P : never
type EventOptionsOf<T> = T extends ComponentOptions<any, any, any, any, any, any, any, infer E> ? (E extends (Record<string, ((...args: any[]) => void) | null>) ? E : never) : never
type EventPayloadTypesByName<T extends Record<string, ((...args: any[]) => void) | null>> = {[P in keyof T]: T[P] extends (...args: infer P)=>void ? P : never}
type EventPayloadsOf<T extends ObjectEmitsOptions> = EventPayloadTypesByName<EventOptionsOf<T>>[keyof EventPayloadTypesByName<EventOptionsOf<T>>]

export const useModalStack = defineStore({
    id: "modal-stack-store",
    state: () => {
        return {
            modals: [] as Modal[],
            index: 0
        }
    },
    actions: {
        push<T extends ComponentOptions>(
            component: T, props: PropsOf<T>, cancellable: boolean, callback: (canceled: boolean, result: EventPayloadsOf<T>) => void) {
            this.modals.push({component, callback, cancellable, props, idx: this.index++})
        },
        pop(result: any[]) {
            this.modals.pop()?.callback(false, result)
        },
        cancel() {
            if (this.modals[this.modals.length - 1].cancellable) {
                this.modals.pop()?.callback(true, [])
            }
        }
    }
})