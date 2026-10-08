import type { Mongo } from 'meteor/mongo'

type LegalRichText = {
  content?: object
  html?: string
}

export declare type LegalDocument = {
  _id: string
  documentAbbr: string
  version: string
  effectiveAt: Date
  title: string
  text: string | LegalRichText
  changelog?: string | LegalRichText
  language: string
  i18n?: object
  createdAt?: Date
  updatedAt?: Date
}

declare type Agreements = {
  documentAbbr?: string
  documentId: string
  agreed: boolean
  /** The user who agreed on the owner's behalf; same as `ownerId` for user-owned records. */
  agreedBy?: string
}

declare type History = {
  createdAt: Date
  agreement: string
  action: 'revoked' | 'agreed' | 'revision'
  agreedBy?: string
}

export declare type LegalAgreement = {
  _id: string
  ownerId: string
  /** 'user' (default) or the kind of thing a user acts for, like 'organization'. */
  ownerType?: string
  agreements: Agreements[]
  history: History[]
  createdAt?: Date
  updatedAt?: Date
}

export let LegalCollection: Mongo.Collection<LegalDocument>
export let LegalAgreementCollection: Mongo.Collection<LegalAgreement>

interface CanAddLegalHook {
  register: (documentAbbr: string, language: string, userId: string) => boolean
}

export let canAddLegalHook: CanAddLegalHook

export declare type AgreementActor = {
  /** Original acceptance time when replaying a server-owned consent record. */
  acceptedAt?: Date
  /** Who the agreement belongs to. */
  ownerId: string
  /** 'user' (default) or the kind of thing a user acts for, like 'organization'. */
  ownerType?: string
  /** The user acting; recorded on the agreement and its history. Defaults to `ownerId`. */
  agreedBy?: string
}

declare type AgreementContext = { ownerType: string; agreedBy: string }

/** Server only. Record agreement to documents for an owner, on a user's behalf when `ownerType` is not 'user'. */
export declare function agreeTo(
  actor: AgreementActor,
  what: string | string[],
): Promise<(number | { numberAffected?: number; insertedId?: string })[]>

/** Server only. Revoke agreement to documents for an owner. */
export declare function revokeFrom(
  actor: AgreementActor,
  what: string | string[],
): Promise<number[]>

interface BeforeAgreedHook {
  register: (
    whichAgreement: string | string[],
    ownerId: string,
    context: AgreementContext,
  ) => boolean
}

export let beforeAgreedHook: BeforeAgreedHook

interface AfterAgreedHook {
  register: (
    whichAgreement: string | string[],
    ownerId: string,
    dbResults: unknown[],
    context: AgreementContext,
  ) => void
}

export let afterAgreedHook: AfterAgreedHook

interface BeforeRevokedHook {
  register: (
    whichAgreement: string | string[],
    ownerId: string,
    context: AgreementContext,
  ) => void
}

export let beforeRevokedHook: BeforeRevokedHook

interface AfterRevokedHook {
  register: (
    whichAgreement: string | string[],
    ownerId: string,
    dbResults: number[],
    context: AgreementContext,
  ) => void
}

export let afterRevokedHook: AfterRevokedHook
