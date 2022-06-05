import type { InjectionKey, Ref, Component } from "vue";

export const InsertAfterThisKey : InjectionKey<Ref<((state: object & {
    idx: bigint;
}, focus?: boolean | undefined) => void) | undefined>> = Symbol("InjectAfterThis")


export const CloseFocusedWindowKey : InjectionKey<() => void> = Symbol("CloseFocusedWindow")

export const AddComponentAfterFocusedKey : InjectionKey<(component: Component, extras?: object) => bigint | undefined> = Symbol("AddComponentAfterFocused")

export const RecOpenQueueKey : InjectionKey<Ref<[string, object][]>> = Symbol("RecOpenQueue")