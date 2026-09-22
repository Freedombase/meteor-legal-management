import SimpleSchema from 'meteor/aldeed:simple-schema'
import { Mongo } from 'meteor/mongo'
import type { LegalAgreement } from '../legal'
// import { BaseModel } from 'meteor/socialize:base-model';
import 'meteor/aldeed:collection2/dynamic'

Collection2.load()

export const LegalAgreementCollection = new Mongo.Collection<LegalAgreement>(
  'freedombase:legalAgreement',
)

const schema = new SimpleSchema({
  ownerId: {
    type: SimpleSchema.RegEx.Id,
  },
  /** What `ownerId` points at: a user (default) or something a user acts for, like an organization. */
  ownerType: {
    type: String,
    optional: true,
  },
  agreements: {
    type: Array,
    optional: true,
  },
  'agreements.$': {
    type: Object,
    optional: true,
  },
  'agreements.$.documentAbbr': {
    type: String,
    optional: true,
  },
  'agreements.$.documentId': {
    type: SimpleSchema.RegEx.Id,
  },
  'agreements.$.agreed': {
    type: Boolean,
    defaultValue: false,
  },
  /** The user who agreed on the owner's behalf; same as `ownerId` for user-owned records. */
  'agreements.$.agreedBy': {
    type: SimpleSchema.RegEx.Id,
    optional: true,
  },
  history: {
    type: Array,
    optional: true,
  },
  'history.$': {
    type: Object,
    optional: true,
  },
  'history.$.createdAt': {
    type: Date,
  },
  'history.$.agreement': {
    type: SimpleSchema.RegEx.Id,
  },
  'history.$.action': {
    type: String,
    allowedValues: ['revoked', 'agreed', 'revision'],
  },
  'history.$.agreedBy': {
    type: SimpleSchema.RegEx.Id,
    optional: true,
  },
  createdAt: {
    type: Date,
    optional: true, // Will be automatically created if not passed in
    autoValue() {
      if (this.isInsert) return new Date()
    },
    denyUpdate: true,
  },
  updatedAt: {
    type: Date,
    optional: true,
    autoValue() {
      if (this.isInsert || this.isUpdate) return new Date()
    },
  },
})

LegalAgreementCollection.attachSchema(schema)

LegalAgreementCollection.allow({
  insert(userId) {
    return !!userId
  },
  update(userId, document: LegalAgreement) {
    // Records owned by something other than a user change only through server code.
    return (
      userId === document.ownerId &&
      (!document.ownerType || document.ownerType === 'user')
    )
  },
  remove() {
    return false
  },
})
