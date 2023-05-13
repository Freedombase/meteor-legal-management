export declare type LegalRichText = {
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

export declare type Agreements = {
  documentAbbr?: string,
  documentId: string,
  agreed: boolean
}

export declare type History = {
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
