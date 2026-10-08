import {
  agreeTo,
  LegalAgreementCollection,
  LegalCollection,
  revokeFrom,
} from 'meteor/freedombase:legal-management'
import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { Tinytest } from 'meteor/tinytest'

if (Meteor.isServer) {
  Tinytest.addAsync(
    'legal-management - agreeTo records who agreed on behalf of another owner',
    async (test) => {
      const documentAbbr = `test-${Random.id()}`
      const documentId = await LegalCollection.insertAsync({
        documentAbbr,
        version: '1.0.0',
        title: 'Test',
        text: 'Test',
        language: 'en',
        effectiveAt: new Date(0),
      })
      const ownerId = Random.id()
      const agreedBy = Random.id()
      await agreeTo({ ownerId, ownerType: 'organization', agreedBy }, [
        documentAbbr,
      ])
      const record = await LegalAgreementCollection.findOneAsync({ ownerId })
      test.equal(record.ownerType, 'organization')
      test.equal(record.agreements[0].documentId, documentId)
      test.isTrue(record.agreements[0].agreed)
      test.equal(record.agreements[0].agreedBy, agreedBy)
      test.equal(record.history[0].agreedBy, agreedBy)
      await revokeFrom({ ownerId, ownerType: 'organization', agreedBy }, [
        documentAbbr,
      ])
      const revoked = await LegalAgreementCollection.findOneAsync({ ownerId })
      test.isFalse(revoked.agreements[0].agreed)
      test.equal(revoked.history[1].action, 'revoked')
      await LegalAgreementCollection.removeAsync({ ownerId })
      await LegalCollection.removeAsync({ _id: documentId })
    },
  )
}
