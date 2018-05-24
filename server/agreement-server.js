import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { LegalAgreementCollection } from '../common/agreement';
import { LegalCollection } from '../common/legal';

/**
 * Gets agreements
 * @param ownerId {String}
 */
Meteor.publish('freedombase:legal.agreements.for', ownerId => {
  check(ownerId, String);
  return LegalAgreementCollection.find(
    { ownerId },
    {
      limit: 1,
      fields: {
        ownerId: 1,
        current: 1,
        updatedAt: 1
      }
    }
  );
});

Meteor.publish('freedombase:legal.agreements.history', ownerId => {
  check(ownerId, String);
  return LegalAgreementCollection.find(
    { ownerId },
    {
      limit: 1,
      fields: {
        ownerId: 1,
        history: 1,
        updatedAt: 1
      }
    }
  );
});

Meteor.publish('freedombase:legal.agreements.full', ownerId => {
  check(ownerId, String);
  return LegalAgreementCollection.find({ ownerId }, { limit: 1 });
});

Meteor.methods({
  /**
   * Give agreement to the given document.
   * @param who {String}
   * @param what {String}
   * @return {Boolean}
   */
  'freedombase:legal.agreements.agreeById'(who, what) {
    check(who, String);
    check(what, String);
    const doc = LegalCollection.findOne({ $or: [{ _id: what }, { documentAbbr: what }] }, {fields: { documentAbbr: 1 }});
    return LegalAgreementCollection.update(
      { ownerId: who },
      {
        $addToSet: {
          agreements: { documentAbbr: doc.documentAbbr , documentId: doc._id, agreed: true },
          history: { createdAt: new Date(), agreement: what, action: 'agreed' }
        }
      },
      { limit: 1 }
    );
  },
  /**
   * Revoke agreement to the given document.
   * @param who {String} Owner id
   * @param what {String} Id of the legal document
   * @returns {Boolean}
   */
  'freedombase:legal.agreements.revokeById'(who, what) {
    check(who, String);
    check(what, String);
    return LegalAgreementCollection.update(
      { ownerId: who, $elemMatch: { agreements: { $or: [{ documentId: what }, {documentAbbr: what} ] } } },
      {
        $set: { 'agreements.$.agreed': false },
        $addToSet: {
          history: { createdAt: new Date(), agreement: what, action: 'revoked' }
        }
      },
      { limit: 1 }
    );
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
  }*/
});
