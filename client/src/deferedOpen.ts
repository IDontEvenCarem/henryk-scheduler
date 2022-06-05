export function RemIatTodoViewWindow (iat: Function, args: object) {
    import("./components/Windows/TodoViewWindow.vue").then(i => iat(i, args))
}