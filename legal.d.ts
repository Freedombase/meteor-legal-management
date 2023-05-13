import { Mongo } from 'meteor/mongo'

type LegalRichText = {
  content?: object,
  html?: string
}

export declare type LegalDocument = {
  _id: string,
  documentAbbr: string,
  version: string,
  effectiveAt: Date,
  title: string,
  text: string | LegalRichText,
  changelog?: string | LegalRichText,
  language: string,
  i18n?: object,
  createdAt: Date,
  updatedAt?: Date
}

declare type Agreements = {
  documentAbbr?: string,
  documentId: string,
  agreed: boolean
}

declare type History = {
  createdAt: Date,
  agreement: string,
  action: 'revoked' | 'agreed' | 'revision'
}

export declare type LegalAgreement = {
  _id: string,
  ownerId: string,
  agreements: Agreements[],
  history: History[],
  createdAt: Date,
  updatedAt?: Date
}

export var LegalCollection: Mongo.Collection<LegalDocument>
export var LegalAgreementCollection: Mongo.Collection<LegalAgreement>

interface CanAddLegalHook {
  register: (documentAbbr: string, language: string, userId: string) => boolean
}

export var canAddLegalHook: CanAddLegalHook

interface BeforeAgreedHook {
  register: (whichAgreement: string, userId: string) => boolean
}

export var beforeAgreedHook: BeforeAgreedHook

interface AfterAgreedHook {
  register: (whichAgreement: string, userId: string, dbResults: number | string) => void
}

export var afterAgreedHook: AfterAgreedHook

interface BeforeRevokedHook {
  register: (whichAgreement: string, userId: string) => void
}

export var beforeRevokedHook: BeforeRevokedHook

interface AfterRevokedHook {
  register: (whichAgreement: string, userId: string, dbResults: number | string) => void
}

export var afterRevokedHook: AfterRevokedHook
