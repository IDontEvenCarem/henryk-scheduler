import { defineStore } from "pinia";

export interface Todo {
    id?: number,
    done: boolean,
    text: string
}

export const useTodoStore = defineStore({
    id: "todos-store",
    state: () => {
        return {
            todos: [] as Todo[]
        }
    },
    actions: {
        async add_todo (text: string) {
            console.log("Pinia adding")
            this.todos = [...this.todos, {id: this.todos.length, text, done: true}]
        }
    }
})