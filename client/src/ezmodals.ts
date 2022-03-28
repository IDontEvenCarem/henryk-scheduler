import {useModalStack} from '@/stores/ModalStack'
import YesNoModalComponent from '@/components/Modals/YesNoModal.vue'

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