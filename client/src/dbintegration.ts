import { liveQuery, type Collection, type PromiseExtended, type Subscription } from 'dexie'
import type {Table} from 'dexie'
import { onUnmounted, ref, watch, type Ref, type UnwrapRef } from 'vue'
export * from '@/database'

type UnwrapedRefList<T> = { [P in keyof T]: UnwrapRef<T[P]> }

export function dynamicQuery<T, P extends readonly Ref[]>(
    table: Table<T>,
    params: [...P],
    query: (table: Table<T>, ...params: Readonly<UnwrapedRefList<P>>) => Collection<T> | PromiseExtended<T[]>
): Ref<T[]> {
    // escape hatching is needed, as there is no way to encode the change of types
    // caused by map'ing over a tuple into the type system
    let value: Ref<T[]> = ref([])
    let sub: Subscription | undefined = undefined
    function regen_sub(newvalues: Readonly<UnwrapedRefList<P>>) {
        sub?.unsubscribe();
        sub = liveQuery<T[]>(
            () => {
                const q = query(table, ...newvalues)
                if ('then' in q) {
                    return q
                } else {
                    return q.toArray()
                }
            }
        ).subscribe(newvalue => {
            value.value = newvalue
        })
    }
    onUnmounted(() => {
        sub?.unsubscribe();
    })
    watch(params, (new_values, _) => {
        regen_sub(new_values as any);
    })
    regen_sub(params.map(ref => ref.value) as any)
    return value;
}