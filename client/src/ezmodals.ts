import {useModalStack} from '@/stores/ModalStack'
import YesNoModalComponent from '@/components/Modals/YesNoModal.vue'
import type { ID } from './database';
import LinkModalVue from './components/Modals/LinkModal.vue';

export function EZModalYesNo (title?: string, contents?: string) : Promise<boolean> {
    const modalStack = useModalStack();
    return new Promise(resolve => {
        modalStack.push(YesNoModalComponent, {title, contents}, true, (canceled, [result]) => {
            if (canceled) {
                resolve(false)
            } else {
                resolve(result)
            }
        })
    })
}

export function EZModalLink (from: ID) {
    const modalStack = useModalStack();
    modalStack.push(LinkModalVue as any, {from}, true, (canceled, result) => {})
}