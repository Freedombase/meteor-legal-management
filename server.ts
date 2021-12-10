import './server/agreement-server'
import './server/legal-server'

export { LegalAgreementCollection, LegalCollection, LegalAgreement, LegalDocument } from './common'
export { canAddLegalHook } from './server/legal-server'
export { beforeAgreedHook, beforeRevokedHook, afterAgreedHook, afterRevokedHook } from './server/agreement-server'
