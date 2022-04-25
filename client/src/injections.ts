import type { InjectionKey, Ref, Component } from "vue";

export const InsertAfterThisKey : InjectionKey<Ref<((state: object & {
    idx: bigint;
}, focus?: boolean | undefined) => void) | undefined>> = Symbol("InjectAfterThis")

export const AddComponentAfterFocusedKey : InjectionKey<(component: Component, extras?: object) => bigint | undefined> = Symbol("AddComponentAfterFocused")