import {useModalStack} from '@/stores/ModalStack'
import YesNoModalComponent from '@/components/Modals/YesNoModal.vue'

export function EZModalYesNo (title?: string, contents?: string) : Promise<boolean> {
    const modalStack = useModalStack();
    return new Promise(res => {
        modalStack.pushModal(YesNoModalComponent, {title, contents}, value => {
            res(value[0])
        })
    })
}