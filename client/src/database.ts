import Dexie from 'dexie'
import type {Table} from 'dexie'

export interface Todo {
    id?: number,
    text: string,
    done: boolean
}

export class TypedDexie extends Dexie {
    todos!: Table<Todo>;

    constructor() {
        super('testdexie')
        this.version(1).stores({
            todos: '++id, done'
        })
    }
}


export const database = new TypedDexie()