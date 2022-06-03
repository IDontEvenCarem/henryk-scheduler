import { defineStore } from "pinia";
import type {Component, ConcreteComponent, ComponentOptions, FunctionalComponent, ObjectEmitsOptions, VNodeProps} from 'vue'
import type LinkFromTodoModalVue from '@/components/Modals/LinkFromTodoModal.vue'
import type YesNoModal from '@/components/Modals/YesNoModal.vue'

interface Modal {
    component: Component,
    cancellable: boolean,
    callback: (canceled: boolean, result: any) => void,
    props: any,
    idx: number
}

type PropsOf<T> = T extends new (...args: any[]) => any ? Omit<InstanceType<T>['$props'], keyof VNodeProps | 'class' | 'style'> : any;
type EmitsOf<T> = T extends new (...args: any[]) => any ? InstanceType<T>['$emit'] : any;
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