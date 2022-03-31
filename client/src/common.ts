
const symbolNone = Symbol('None')
const symbolDeleted = Symbol('Deleted')

export type None = {kind: 'none'}
export type Deleted<T> = {kind: 'deleted', value: Partial<T>}
export type Updated<T> = {kind: 'updated', value: Partial<T>}
export type Created<T> = {kind: 'created', value: T}
export type Change<T> = Created<T> | Updated<T> | Deleted<T> | None

export function MakeNone<T> () : None {
    return {
        kind: "none"
    }
}
export function MakeDeleted<T> (value: Partial<T>) : Deleted<T> {
    return {
        kind: "deleted",
        value
    }
}
export function MakeUpdated<T> (value: Partial<T>) : Updated<T> {
    return {
        kind: "updated",
        value
    }
}
export function MakeCreated<T> (value: T) : Created<T> {
    return {
        kind: "created",
        value
    }
}
