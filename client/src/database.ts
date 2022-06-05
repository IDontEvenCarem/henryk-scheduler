import Dexie from 'dexie'
import type {Table} from 'dexie'
import type { Change } from './common'
import _, { map } from 'lodash'

export type ThingName = "ScheduleEvent" | "OneshotEvent" | "Todo" | "Note";
export type AnyEvent = OneshotEvent | RepeatingEvent
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface ID {
    kind: ThingName,
    id: number
}

export interface Todo {
    id?: number,
    text: string,
    done: boolean,
    parent_id?: number
}

export interface OneshotEvent {
    id?: number,
    name: string,
    start: Date,
    end: Date,
    color: string,
    description: string
}

export interface RepeatingEvent {
    id?: number,
    name: string,
    color: string,
    weekday: Weekday,
    time_start: number,
    time_end: number,
    repeats_start?: Date,
    repeats_end?: Date,
    description: string
}
export interface Note {
    id?: number,
    title: string,
    content: string,
    createdAt: string,
    editedAt: string
}

export type AnyThing = Note | RepeatingEvent | OneshotEvent | Todo
export type ReplacedID<T> = Omit<T, 'id'> & {id: ID}

export interface Link {
    from: "ScheduleEvent" | "OneshotEvent" | "Todo" | "Note",
    from_id: number,
    to: "ScheduleEvent" | "OneshotEvent" | "Todo" | "Note",
    to_id: number
}

export class TypedDexie extends Dexie {
    todos!: Table<Todo>;
    oneshot_events!: Table<OneshotEvent>;
    repeating_events!: Table<RepeatingEvent>;
    notes!: Table<Note>;
    link!: Table<Link>

    constructor() {
        super('testdexie')
        this.version(21).stores({
            todos: '++id, parent_id',
            oneshot_events: '++id, start, end',
            repeating_events: '++id, weekday, repeats_start, repeats_end',
            notes: '++id, title',
            link: '++, [from+from_id], [to+to_id], from_id, to_id'
        })
    }
}




export const database = new TypedDexie()

export async function Insert<T>(table: Table<T>, value: T) {
    return table.add(value)
}

export async function AlterRepeatingEvent (change: Change<RepeatingEvent>) {
    if (change.kind == "none") return;
    if (change.kind == "created") {
        return database.repeating_events.add(change.value)
    }
    if (change.kind == "deleted") {
        if(change.value.id){
            return database.repeating_events.delete(change.value.id);
        }
        return Promise.resolve();    
    }
    if (change.kind == "updated") {
        if (change.value.id !== undefined) {
            return database.repeating_events.update(change.value.id, _.omit(change.value, 'id'))
        } 
        return Promise.resolve()
    }
}

export async function AlterOneshotEvent (change: Change<OneshotEvent>) {
    if (change.kind == "none") return;
    if (change.kind == "created") {
        return database.oneshot_events.add(change.value)
    }
    if (change.kind == "deleted") {
        if(change.value.id){
            return database.oneshot_events.delete(change.value.id);
        }
        return Promise.resolve();    
    }
    if (change.kind == "updated") {
        if (change.value.id !== undefined) {
            return database.oneshot_events.update(change.value.id, _.omit(change.value, 'id'))
        } 
        return Promise.resolve()
    }
}

export async function AddOneshotEvent (event: OneshotEvent) {
    return database.oneshot_events.add(event)
}

export async function AddRepeatingEvent (event: RepeatingEvent) {
    return database.repeating_events.add(event)
}

export async function AddTodo (text: string, parent_id: number | undefined = undefined) : Promise<ID> {
    const resp = await database.todos.add({text, done: false, parent_id})
    return {kind: 'Todo', id: parseInt(resp.toString())}
}

// export async function AddRepeatingEvent (name: string, color: string, weekday: Weekday, time_start: number, time_end: number) {
//     return database.repeating_events.add({name, color, weekday, time_end, time_start, room: "", teacher: ""})
// }

export async function UpdateRepeatingEvent(id: number, update: Partial<RepeatingEvent>) {
    return database.repeating_events.update(id, update)
}

export async function MarkTodoDone (id: number) {
    return await database.todos.update(id, {done: true})
}

export async function MarkTodoUndone (id: number) {
    return await database.todos.update(id, {done: false})
}

export async function ToggleTodo(id: number) {
    const todo = await database.todos.get(id)
    if (todo?.done) {
        MarkTodoUndone(id)
    } else {
        MarkTodoDone(id)
    }
}

/** @deprecated */
export async function DeleteTodo (id: number) {
    await database.todos.delete(id);
}

/** @deprecated */
export async function DeleteRepeatingEvent (id: number) {
    return database.repeating_events.delete(id)
}

export async function DeleteAllRepeatingEvents () {
    return database.repeating_events.clear()
}

export async function AddNote (title: string, content: string) {
    const now = (new Date()).toUTCString()
    return database.notes.add({title, content, createdAt: now, editedAt: now})
}

export async function Delete (id: ID) {
    if (id.kind === 'Todo') {
        await database.todos.delete(id.id)
    }
    else if (id.kind === 'Note') {
        await database.notes.delete(id.id)
    }
    else if (id.kind === 'OneshotEvent') {
        await database.oneshot_events.delete(id.id)
    }
    else if (id.kind === 'ScheduleEvent') {
        await database.repeating_events.delete(id.id)
    }
    else {
        throw new Error("Invalid deletion case - improper kind in id")
    }

    await database.link.filter(link => {
        return (link.from === id.kind && link.from_id === id.id) || (link.to === id.kind && link.to_id === id.id)
    }).delete()
}

export async function Get (id: ID) {
    if (id.kind === 'Todo') {
        return database.todos.get(id.id)
    }
    else if (id.kind === 'Note') {
        return database.notes.get(id.id)
    }
    else if (id.kind === 'OneshotEvent') {
        return database.oneshot_events.get(id.id)
    }
    else if (id.kind === 'ScheduleEvent') {
        return database.repeating_events.get(id.id)
    }
    else {
        throw new Error("Invalid get case - impoper kind in id")
    }
}

export async function Link (from: ID, to: ID) {
    return database.link.add({from: from.kind, from_id: from.id, to: to.kind, to_id: to.id})
}

export async function GetWithLinks (id: ID, exclusions: ID[] = []) {
    const direct = await Get(id)
    // links where this is the 'to' side
    const links_incomming = await database.link
        .where('[to+to_id]').equals([id.kind, id.id])
        .filter(link => !exclusions.some(excluded => excluded.kind === link.to && excluded.id === link.to_id))
        .toArray()
    // links where this is the 'from' side
    const links_outgoing = await database.link
        .where('[from+from_id]').equals([id.kind, id.id])
        .filter(link => !exclusions.some(excluded => excluded.kind === link.from && excluded.id === link.from_id))
        .toArray()

        // making this perform bulk ops would probably be better, but harder. maybe have a GetMany function?
    const entities_outgoing : ReplacedID<Todo | RepeatingEvent | Note | OneshotEvent>[] = await Promise.all(
        links_outgoing.map(link => 
            Get({id: link.to_id, kind: link.to})
                .then(value => ({...value, id: {id: link.to_id, kind: link.to}})))
    )
    const entities_incomming : ReplacedID<Todo | RepeatingEvent | Note | OneshotEvent>[] = await Promise.all(
        links_incomming.map(link => 
            Get({id: link.from_id, kind: link.from})
                .then((value) => ({...value, id: {id: link.from_id, kind: link.from}})))
    )

    return {
        value: direct,
        linked: [...entities_incomming, ...entities_outgoing]
    }
}

function IDtoString (id: ID) {
    return `${id.kind[0]}${id.id}`
}

function StringToID (str: string): ID {
    const kind_letter = str[0]
    const num_id = parseInt(str.substring(1))

    const kind : ThingName = {'N': 'Note', 'T': 'Todo', 'S': 'ScheduleEvent', 'O': 'OneshotEvent'}[kind_letter]! as ThingName

    return {kind, id: num_id}
}

export async function GetExportData () {
    const [oe, se, n, t, l] = await Promise.all([
        database.oneshot_events.toArray(),
        database.repeating_events.toArray(),
        database.notes.toArray(),
        database.todos.toArray(),
        database.link.toArray()
    ]);

    const start_id_oe = _.minBy(oe, v => v.id!)?.id!
    const start_id_se = _.minBy(se, v => v.id!)?.id!
    const start_id_n  = _.minBy(n, v => v.id!)?.id!
    const start_id_t  = _.minBy(t, v => v.id!)?.id!

    oe.forEach(v => v.id! -= start_id_oe)
    se.forEach(v => v.id! -= start_id_se)
    n.forEach(v => v.id! -= start_id_n)
    t.forEach(v => v.id! -= start_id_t)
    
    const subtable : Record<ThingName, number> = {'Note': start_id_n, 'OneshotEvent': start_id_oe, 'ScheduleEvent': start_id_se, 'Todo': start_id_t}
    l.forEach(l => {
        l.from_id -= subtable[l.from]
        l.to_id -= subtable[l.to]
    })

    return {oneshot_events: oe, schedule_events: se, notes: n, todos: t, links: l}
}

export async function PurgeDatabase () {
    if (prompt(`Are you sure? Type in "Yes" to purge the local database`) === 'Yes') {
        await database.link.clear()
        await database.notes.clear()
        await database.todos.clear()
        await database.repeating_events.clear()
        await database.oneshot_events.clear()
    } else {
        return Promise.reject("Action aborted")
    }
}

export async function ImportData (data: Awaited<ReturnType<typeof GetExportData>>) {
    const todo_max_id = (await database.todos.toArray()).map(todo => todo.id!).reduce<number>((m, curr) => Math.max(m, curr), 0)
    const notes_max_id = (await database.notes.toArray()).map(todo => todo.id!).reduce<number>((m, curr) => Math.max(m, curr), 0)
    const ose_max_id = (await database.oneshot_events.toArray()).map(todo => todo.id!).reduce<number>((m, curr) => Math.max(m, curr), 0)
    const re_max_id = (await database.repeating_events.toArray()).map(todo => todo.id!).reduce<number>((m, curr) => Math.max(m, curr), 0)

    const todo_id_map = new Map(data.todos.map((todo, i) => [todo.id!, todo_max_id+1+i]))
    const notes_id_map = new Map(data.notes.map((todo, i) => [todo.id!, notes_max_id+1+i]))
    const ose_id_map = new Map(data.oneshot_events.map((todo, i) => [todo.id!, ose_max_id+1+i]))
    const re_id_map = new Map(data.schedule_events.map((todo, i) => [todo.id!, re_max_id+1+i]))

    await database.todos.bulkAdd(data.todos.map(todo => ({...todo, id: todo_id_map.get(todo.id!)!})))
    await database.notes.bulkAdd(data.notes.map(note => ({...note, id: notes_id_map.get(note.id!)!})))
    await database.oneshot_events.bulkAdd(data.oneshot_events.map(ose => ({...ose, id: ose_id_map.get(ose.id!)!})))
    await database.repeating_events.bulkAdd(data.schedule_events.map(re => ({...re, id: re_id_map.get(re.id!)!})))

    function map_id (kind: ThingName, id: number) {
        const map = (()=>{
            if (kind === 'Note') {
                return notes_id_map
            } else if (kind === 'OneshotEvent') {
                return ose_id_map
            } else if (kind === 'ScheduleEvent') {
                return re_id_map
            } else if (kind === 'Todo') {
                return todo_id_map
            }
        })()
        return map!.get(id)!
    }

    await database.link.bulkAdd(data.links.map(link => {
        return {
            from: link.from,
            to: link.to,
            from_id: map_id(link.from, link.from_id),
            to_id: map_id(link.to, link.to_id)
        }
    }))
}