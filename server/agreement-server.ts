import { Hook } from 'meteor/callback-hook'
import { check, Match } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import { LegalAgreementCollection } from '../common/agreement'
import { LegalCollection } from '../common/legal'

// Indexes
LegalAgreementCollection.createIndexAsync({ ownerId: 1 })

/**
 * Gets agreements/consent to legal documents.
 * @param ownerId {String}
 * @returns {Mongo.Cursor}
 */
Meteor.publish('freedombase:legal.agreements.for', (ownerId = 'user') => {
  check(ownerId, String)
  const userId = Meteor.userId()

  return LegalAgreementCollection.find(
    { ownerId: ownerId === 'user' ? userId : ownerId },
    {
      fields: {
        ownerId: 1,
        agreements: 1,
        updatedAt: 1,
      },
      limit: 1,
      sort: { ownerId: 1 },
    },
  )
})

/**
 * Get history of consent changes.
 * @param ownerId {String}
 * @returns {Mongo.Cursor}
 */
Meteor.publish('freedombase:legal.agreements.history', (ownerId = 'user') => {
  check(ownerId, String)
  const userId = Meteor.userId()

  return LegalAgreementCollection.find(
    { ownerId: ownerId === 'user' ? userId : ownerId },
    {
      fields: {
        ownerId: 1,
        history: 1,
        updatedAt: 1,
      },
      limit: 1,
      sort: { ownerId: 1 },
    },
  )
})

/**
 * Get all the data
 * @param ownerId {String}
 * @returns {Mongo.Cursor}
 */
Meteor.publish('freedombase:legal.agreements.full', (ownerId = 'user') => {
  check(ownerId, String)
  const userId = Meteor.userId()

  return LegalAgreementCollection.find(
    { ownerId: ownerId === 'user' ? userId : ownerId },
    { limit: 1, sort: { userId: -1 } },
  )
})

export const beforeAgreedHook = new Hook()
export const afterAgreedHook = new Hook()
export const beforeRevokedHook = new Hook()
export const afterRevokedHook = new Hook()

export type AgreementActor = {
  /** Who the agreement belongs to. */
  ownerId: string
  /** 'user' (default) or the kind of thing a user acts for, like 'organization'. */
  ownerType?: string
  /** The user acting; recorded on the agreement and its history. */
  agreedBy?: string
}

function listOf(what: string | string[]): string[] {
  return Array.isArray(what) ? what : [what]
}

async function currentDocument(legalDoc: string) {
  const doc = await LegalCollection.findOneAsync(
    {
      $or: [{ _id: legalDoc }, { documentAbbr: legalDoc }],
      effectiveAt: { $lte: new Date() },
    },
    { fields: { _id: 1, documentAbbr: 1 }, sort: { effectiveAt: -1 } },
  )
  if (!doc) throw new Meteor.Error(`Legal document ${legalDoc} not found.`)
  return doc
}

/**
 * Record agreement to the given documents for an owner. Server code calls this
 * directly when a user agrees on behalf of something else, such as an
 * organization; the `agreeBy` method calls it for the logged-in user.
 * @param actor Owner of the agreement and the user acting for it.
 * @param what Ids or abbreviations of the legal documents.
 * @return Results of the update functions.
 */
export async function agreeTo(
  actor: AgreementActor,
  what: string | string[],
): Promise<(number | { numberAffected?: number; insertedId?: string })[]> {
  const { ownerId, ownerType = 'user', agreedBy = ownerId } = actor
  let cont = true
  beforeAgreedHook.forEachAsync((hook) => {
    const result = hook(what, ownerId, { ownerType, agreedBy })
    if (cont) cont = result // once cont is false it will stay false
  })
  if (!cont) return []
  const result = []
  for (const legalDoc of listOf(what)) {
    const doc = await currentDocument(legalDoc)
    const history = {
      createdAt: new Date(),
      agreement: legalDoc,
      action: 'agreed',
      agreedBy,
    }
    const elemMatch = {
      $elemMatch: { documentId: doc._id, documentAbbr: doc.documentAbbr },
    }
    const agr = await LegalAgreementCollection.findOneAsync(
      { ownerId, agreements: elemMatch },
      { fields: { agreements: 1 } },
    )
    if (agr) {
      result.push(
        await LegalAgreementCollection.updateAsync(
          { ownerId, agreements: elemMatch },
          {
            $set: {
              ownerType,
              'agreements.$.documentAbbr': doc.documentAbbr,
              'agreements.$.documentId': doc._id,
              'agreements.$.agreed': true,
              'agreements.$.agreedBy': agreedBy,
            },
            $addToSet: { history },
          },
        ),
      )
    } else {
      result.push(
        await LegalAgreementCollection.upsertAsync(
          { ownerId },
          {
            $set: { ownerType },
            $addToSet: {
              agreements: {
                documentAbbr: doc.documentAbbr,
                documentId: doc._id,
                agreed: true,
                agreedBy,
              },
              history,
            },
          },
        ),
      )
    }
  }
  afterAgreedHook.forEachAsync((hook) => {
    hook(what, ownerId, result, { ownerType, agreedBy })
  })
  return result
}

/**
 * Revoke agreement to the given documents for an owner.
 * @param actor Owner of the agreement and the user acting for it.
 * @param what Ids or abbreviations of the legal documents.
 * @return Results of the update functions.
 */
export async function revokeFrom(
  actor: AgreementActor,
  what: string | string[],
): Promise<number[]> {
  const { ownerId, ownerType = 'user', agreedBy = ownerId } = actor
  beforeRevokedHook.forEachAsync((hook) => {
    hook(what, ownerId, { ownerType, agreedBy })
  })
  const result = []
  for (const legalDoc of listOf(what)) {
    result.push(
      await LegalAgreementCollection.updateAsync(
        {
          ownerId,
          agreements: {
            $elemMatch: {
              $or: [{ documentId: legalDoc }, { documentAbbr: legalDoc }],
            },
          },
        },
        {
          $set: { 'agreements.$.agreed': false },
          $addToSet: {
            history: {
              createdAt: new Date(),
              agreement: legalDoc,
              action: 'revoked',
              agreedBy,
            },
          },
        },
      ),
    )
  }
  afterRevokedHook.forEachAsync((hook) => {
    hook(what, ownerId, result, { ownerType, agreedBy })
  })
  return result
}

Meteor.methods({
  /**
   * Give agreement to the given document.
   * @param what {String|Array} Ids or abbreviations of the legal document
   * @param userId {String} Optionally send userId in cases when user is logging in or creating account. Logged in user will take precedent before this param.
   * @return {Array} Array of results of update functions
   */
  'freedombase:legal.agreements.agreeBy': async function (
    what: string | string[],
    userId: string = null,
  ) {
    check(what, Match.OneOf(String, [String]))
    check(userId, Match.Maybe(String))
    const ownerId = this.userId || Meteor.userId() || userId
    if (!ownerId) {
      throw new Meteor.Error('User needs to be logged in to agree.')
    }
    return agreeTo({ ownerId }, what)
  },
  /**
   * Revoke agreement to the given document.
   * @param what {String|Array} Ids or abbreviations of the legal document
   * @returns {Array} Array of results of update functions
   */
  'freedombase:legal.agreements.revokeBy': async function (what) {
    check(what, Match.OneOf(String, [String]))
    const ownerId = this.userId || Meteor.userId()
    if (!ownerId) {
      throw new Meteor.Error('User needs to be logged in to revoke agreement.')
    }
    return revokeFrom({ ownerId }, what)
  },
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
