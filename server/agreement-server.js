import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { LegalAgreementCollection } from '../common/agreement';
import { LegalCollection } from '../common/legal';

/**
 * Gets agreements/consent to legal documents.
 * @param ownerId {String}
 * @returns {MongoDB pointer}
 */
Meteor.publish('freedombase:legal.agreements.for', (ownerId = 'user') => {
  check(ownerId, String);

  if (ownerId === 'user') {
    ownerId = this.userId;
  }

  return LegalAgreementCollection.find(
    { ownerId },
    {
      limit: 1,
      fields: {
        ownerId: 1,
        agreements: 1,
        updatedAt: 1
      }
    }
  );
});

/**
 * Get history of consent changes.
 * @param ownerId {String}
 * @returns {MongoDB pointer}
 */
Meteor.publish('freedombase:legal.agreements.history', (ownerId = 'user') => {
  check(ownerId, String);

  if (ownerId === 'user') {
    ownerId = this.userId;
  }

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

/**
 * Get all the data
 * @param ownerId {String}
 * @returns {MongoDB pointer}
 */
Meteor.publish('freedombase:legal.agreements.full', (ownerId = 'user') => {
  check(ownerId, String);

  if (ownerId === 'user') {
    ownerId = this.userId;
  }

  return LegalAgreementCollection.find({ ownerId }, { limit: 1 });
});

Meteor.methods({
  /**
   * Give agreement to the given document.
   * @param what {String} Id or abbreviation of the legal document
   * @return {Boolean}
   */
  'freedombase:legal.agreements.agreeBy'(what) {
    check(what, String);

    const doc = LegalCollection.findOne(
      { $or: [{ _id: what }, { documentAbbr: what }] },
      { fields: { documentAbbr: 1 } }
    );
    const elemMatch = { $elemMatch: { documentId: doc._id, documentAbbr: doc.documentAbbr } };
    const agr = LegalAgreementCollection.findOne(
      { ownerId: this.userId, agreements: elemMatch },
      { fields: { agreements: 1 } }
    );
    if (agr) {
      return LegalAgreementCollection.update(
        { ownerId: this.userId, agreements: elemMatch },
        {
          $set: {
            'agreements.$.documentAbbr': doc.documentAbbr,
            'agreements.$.documentId': doc._id,
            'agreements.$.agreed': true
          },
          $addToSet: {
            history: { createdAt: new Date(), agreement: what, action: 'agreed' }
          }
        }
      );
    } else {
      return LegalAgreementCollection.update(
        { ownerId: this.userId },
        {
          $addToSet: {
            agreements: { documentAbbr: doc.documentAbbr, documentId: doc._id, agreed: true },
            history: { createdAt: new Date(), agreement: what, action: 'agreed' }
          }
        }
      );
    }
  },
  /**
   * Revoke agreement to the given document.
   * @param what {String} Id or abbreviation of the legal document
   * @returns {Boolean}
   */
  'freedombase:legal.agreements.revokeBy'(what) {
    check(what, String);

    return LegalAgreementCollection.update(
      { ownerId: this.userId, agreements: { $elemMatch: { $or: [{ documentId: what }, { documentAbbr: what }] } } },
      {
        $set: { 'agreements.$.agreed': false },
        $addToSet: {
          history: { createdAt: new Date(), agreement: what, action: 'revoked' }
        }
      }
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
