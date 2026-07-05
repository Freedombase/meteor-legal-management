import './server/agreement-server'
import './server/legal-server'

export {
  LegalAgreement,
  LegalAgreementCollection,
  LegalCollection,
  LegalDocument,
} from './common'
export {
  afterAgreedHook,
  afterRevokedHook,
  beforeAgreedHook,
  beforeRevokedHook,
} from './server/agreement-server'
export { canAddLegalHook } from './server/legal-server'
