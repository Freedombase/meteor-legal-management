import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { Hook } from 'meteor/callback-hook'
import { LegalAgreementCollection } from '../common/agreement'
import { LegalCollection, LegalDocument } from '../common/legal'

/**
 * Gets agreements/consent to legal documents.
 * @param ownerId {String}
 * @returns {Mongo.Cursor}
 */
Meteor.publish('freedombase:legal.agreements.for', (ownerId:string = 'user') => {
  check(ownerId, String)

  if (ownerId === 'user') {
    ownerId = Meteor.userId()
  }

  return LegalAgreementCollection.find(
    { ownerId },
    {
      fields: {
        ownerId: 1,
        agreements: 1,
        updatedAt: 1
      },
      limit: 1,
      sort: { ownerId: 1 }
    }
  )
})

/**
 * Get history of consent changes.
 * @param ownerId {String}
 * @returns {Mongo.Cursor}
 */
Meteor.publish('freedombase:legal.agreements.history', (ownerId:string = 'user') => {
  check(ownerId, String)

  if (ownerId === 'user') {
    ownerId = Meteor.userId()
  }

  return LegalAgreementCollection.find(
    { ownerId },
    {
      fields: {
        ownerId: 1,
        history: 1,
        updatedAt: 1
      },
      limit: 1,
      sort: { ownerId: 1 }
    }
  )
})

/**
 * Get all the data
 * @param ownerId {String}
 * @returns {Mongo.Cursor}
 */
Meteor.publish('freedombase:legal.agreements.full', (ownerId:string = 'user') => {
  check(ownerId, String)

  if (ownerId === 'user') {
    ownerId = Meteor.userId()
  }

  return LegalAgreementCollection.find({ ownerId }, { limit: 1, sort: { userId: -1 } })
})

export const beforeAgreedHook = new Hook()
export const afterAgreedHook = new Hook()
export const beforeRevokedHook = new Hook()
export const afterRevokedHook = new Hook()

Meteor.methods({
  /**
   * Give agreement to the given document.
   * @param what {String|Array} Ids or abbreviations of the legal document
   * @param userId {String} Optionally send userId in cases when user is logging in or creating account. Logged in user will take precedent before this param.
   * @return {Array} Array of results of update functions
   */
  'freedombase:legal.agreements.agreeBy' (what:string | string[], userId:string = null) {
    check(what, Match.OneOf(String, [String]))
    check(userId, Match.Maybe(String))
    const ownerId = this.userId || Meteor.userId() || userId

    if (!ownerId) {
      throw new Meteor.Error('User needs to be logged in to agree.')
    }

    let cont:boolean = true
    beforeAgreedHook.forEach((hook) => {
      const result = hook(what, ownerId)
      if (cont) cont = result // once cont is false it will stay false
    })
    if (!cont) return

    let legalDocs:string[] = []
    if (!Array.isArray(what)) {
      legalDocs = [what]
    } else {
      legalDocs = what
    }

    const result = legalDocs.map(legalDoc => {
      // Get the legal document
      const doc:LegalDocument = LegalCollection.findOne(
        { $or: [{ _id: legalDoc }, { documentAbbr: legalDoc }], effectiveAt: { $lte: new Date() } },
        { fields: { _id: 1, documentAbbr: 1 }, sort: { effectiveAt: -1 } }
      )
      // Throw error when legal document is not found
      if (!doc) throw new Meteor.Error(`Legal document ${legalDoc} not found.`)

      // Prepare a matcher for agreements collection
      const elemMatch = { $elemMatch: { documentId: doc._id, documentAbbr: doc.documentAbbr } }

      // Check if we have existing agreements
      const agr = LegalAgreementCollection.findOne(
        { ownerId, agreements: elemMatch },
        { fields: { agreements: 1 } }
      )
      if (agr) {
        return LegalAgreementCollection.update(
          { ownerId, agreements: elemMatch },
          {
            $set: {
              'agreements.$.documentAbbr': doc.documentAbbr,
              'agreements.$.documentId': doc._id,
              'agreements.$.agreed': true
            },
            $addToSet: {
              history: { createdAt: new Date(), agreement: legalDoc, action: 'agreed' }
            }
          }
        )
      } else {
        // Create new agreement for user
        return LegalAgreementCollection.upsert(
          { ownerId },
          {
            $addToSet: {
              agreements: { documentAbbr: doc.documentAbbr, documentId: doc._id, agreed: true },
              history: { createdAt: new Date(), agreement: legalDoc, action: 'agreed' }
            }
          }
        )
      }
    })
    afterAgreedHook.forEach((hook) => {
      hook(what, ownerId, result)
    })
    return result
  },
  /**
   * Revoke agreement to the given document.
   * @param what {String|Array} Ids or abbreviations of the legal document
   * @returns {Array} Array of results of update functions
   */
  'freedombase:legal.agreements.revokeBy' (what) {
    check(what, Match.OneOf(String, [String]))
    const ownerId = this.userId || Meteor.userId()

    if (!ownerId) {
      throw new Meteor.Error('User needs to be logged in to revoke agreement.')
    }

    beforeRevokedHook.forEach((hook) => {
      hook(what, ownerId)
    })

    let legalDocs:string[] = []
    if (!Array.isArray(what)) {
      legalDocs = [what]
    } else {
      legalDocs = what
    }

    const result = legalDocs.map(legalDoc => {
      return LegalAgreementCollection.update(
        {
          ownerId,
          agreements: { $elemMatch: { $or: [{ documentId: legalDoc }, { documentAbbr: legalDoc }] } }
        },
        {
          $set: { 'agreements.$.agreed': false },
          $addToSet: {
            history: { createdAt: new Date(), agreement: legalDoc, action: 'revoked' }
          }
        }
      )
    })
    afterRevokedHook.forEach((hook) => {
      hook(what, ownerId, result)
    })
    return result
  }
  /**
   * Resets agreement for type of legal document when a new version is available.
   * @param oldId {String} Old document id
   * @param newId {String} New document id
   * @returns {Number} Number of affected documents (in this case all).
   */
  /*
  'freedombase:legal.agreements.newRevision'(oldId, newId) {
    check(oldId, String);
    check(newId, String);

    // TODO insert here role check

    return LegalAgreementCollection.update(
      {},
      {
        $pull: { agreements: { documentId: oldId } },
        $addToSet: {
          agreements: { documentId: newId, agreed: false },
          history: { createdAt: new Date(), agreement: oldId, action: 'revision' }
        }
      }
    );
  } */
})
