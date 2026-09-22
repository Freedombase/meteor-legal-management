import './server/agreement-server'
import './server/legal-server'

export {
  LegalAgreement,
  LegalAgreementCollection,
  LegalCollection,
  LegalDocument,
} from './common'
export {
  type AgreementActor,
  afterAgreedHook,
  afterRevokedHook,
  agreeTo,
  beforeAgreedHook,
  beforeRevokedHook,
  revokeFrom,
} from './server/agreement-server'
export { canAddLegalHook } from './server/legal-server'
