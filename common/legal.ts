import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'

export const LegalCollection = new Mongo.Collection('freedombase:legal')

export type LegalDocument = {
  _id: string,
  documentAbbr: string,
  version: string,
  effectiveAt: Date,
  title: string,
  text: string | object,
  changelog?: string | object,
  language: string,
  i18n?: object,
  createdAt: Date,
  updatedAt?: Date
}

const schema = new SimpleSchema({
  documentAbbr: {
    type: String,
    index: true
  },
  version: {
    type: String,
    index: true
  },
  effectiveAt: {
    type: Date,
    index: true
  },
  title: {
    type: String
  },
  text: {
    type: SimpleSchema.oneOf(String, Object),
    blackbox: true
  },
  changelog: {
    type: SimpleSchema.oneOf(String, Object),
    optional: true,
    blackbox: true
  },
  language: {
    type: String
  },
  i18n: {
    type: Object,
    blackbox: true,
    optional: true
  },
  /*
  'i18n.$.$': {
    type: Object
  },
  'i18n.$.$.title': {
    type: String
  },
  'i18n.$.$.text': {
    type: SimpleSchema.oneOf(Object, String),
    blackbox: true
  },
  'i18n.$.$.changelog': {
    type: SimpleSchema.oneOf(Object, String),
    optional: true,
    blackbox: true
  },
  */
  createdAt: {
    type: Date,
    optional: true,
    autoValue () {
      if (this.isInsert || !this.isFromTrustedCode) return new Date()
    },
    denyUpdate: true
  },
  updatedAt: {
    type: Date,
    optional: true,
    autoValue () {
      if (this.isUpdate) return new Date()
    }
  }
})

LegalCollection.attachSchema(schema)
// allow/deny
LegalCollection.allow({
  insert () {
    return false
  },
  update () {
    return false
  },
  remove () {
    return false
  }
})
