import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import { LegalAgreement } from '../legal'
// import { BaseModel } from 'meteor/socialize:base-model';

export const LegalAgreementCollection = new Mongo.Collection<LegalAgreement>('freedombase:legalAgreement')

const schema = new SimpleSchema({
  ownerId: {
    type: SimpleSchema.RegEx.Id,
    index: true
  },
  agreements: {
    type: Array,
    optional: true
  },
  'agreements.$': {
    type: Object,
    optional: true
  },
  'agreements.$.documentAbbr': {
    type: String,
    optional: true
  },
  'agreements.$.documentId': {
    type: SimpleSchema.RegEx.Id
  },
  'agreements.$.agreed': {
    type: Boolean,
    defaultValue: false
  },
  history: {
    type: Array,
    optional: true
  },
  'history.$': {
    type: Object,
    optional: true
  },
  'history.$.createdAt': {
    type: Date
  },
  'history.$.agreement': {
    type: SimpleSchema.RegEx.Id
  },
  'history.$.action': {
    type: String,
    allowedValues: ['revoked', 'agreed', 'revision']
  },
  createdAt: {
    type: Date,
    optional: true, // Will be automatically created if not passed in
    autoValue () {
      if (this.isInsert) return new Date()
    },
    denyUpdate: true
  },
  updatedAt: {
    type: Date,
    optional: true,
    autoValue () {
      if (this.isInsert || this.isUpdate) return new Date()
    }
  }
})

LegalAgreementCollection.attachSchema(schema)

LegalAgreementCollection.allow({
  insert (userId) {
    return !!userId
  },
  update (userId, document: LegalAgreement) {
    return userId === document.ownerId
  },
  remove () {
    return false
  }
})
