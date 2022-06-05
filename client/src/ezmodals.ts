import {useModalStack} from '@/stores/ModalStack'
import YesNoModalComponent from '@/components/Modals/YesNoModal.vue'
import type { ID } from './database';
import LinkModalVue from './components/Modals/LinkModal.vue';
import DeletePromptModalVue from './components/Modals/DeletePromptModal.vue';

export function EZModalYesNo (title?: string, contents?: string) : Promise<boolean> {
    const modalStack = useModalStack();
    return new Promise(resolve => {
        // @ts-expect-error
        modalStack.push(YesNoModalComponent, {title, contents}, true, (canceled, [result]) => {
            if (canceled) {
                resolve(false)
            } else {
                // @ts-expect-error
                resolve(result)
            }
        })
    })
}

export function EZModalLink (from: ID) {
    const modalStack = useModalStack();
    modalStack.push(LinkModalVue as any, {from}, true, (canceled, result) => {})
}

export function EZModalDelete (deleting: ID) {
    const modalStack = useModalStack();
    modalStack.push(DeletePromptModalVue, {deleting}, true, (canceled, result) => {})
}