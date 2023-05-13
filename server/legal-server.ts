import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'
import { LegalCollection } from '../common/legal'
import { Hook } from 'meteor/callback-hook'
import type { LegalDocument } from '../legal'

// add unique compound index for documentAbbr + version
LegalCollection.rawCollection().createIndex(
  { documentAbbr: 1, version: 1 },
  { unique: true }
)
/**
 * Gets the latest version of the given document in the given language.
 * @param documentAbbr {String}
 * @param language {String}
 * @return {Mongo.Cursor}
 */
Meteor.publish(
  'freedombase:legal.getLatest',
  function (documentAbbr, language) {
    check(documentAbbr, String)
    check(language, Match.Maybe(String))
    const sub = this
    const options = { limit: 1, sort: { effectiveAt: -1 } }

    const handle = LegalCollection.find(
      { documentAbbr, effectiveAt: { $lte: new Date() } },
      options
    ).observeChanges({
      added(id: string, doc: LegalDocument) {
        if (
          language &&
          doc.language !== language &&
          doc.i18n &&
          doc.i18n[language]
        ) {
          if (doc.i18n[language].title) doc.title = doc.i18n[language].title
          if (doc.i18n[language].text) doc.text = doc.i18n[language].text
          if (doc.i18n[language].changelog)
            doc.changelog = doc.i18n[language].changelog
          delete doc.i18n
        } else if (doc.i18n) {
          delete doc.i18n
        }
        sub.added('freedombase:legal', id, doc)
      },
      changed(id, fields) {
        sub.changed('freedombase:legal', id, fields)
      },
      removed(id) {
        sub.removed('freedombase:legal', id)
      }
    })
    this.ready()
    this.onStop(() => {
      handle.stop()
    })
  }
)

/**
 * Gets the minimum document info for the latest version of the document.
 * @params documentAbbr {String}
 * @return {Mongo.Cursor}
 */
Meteor.publish('freedombase:legal.getLatestTiny', (documentAbbr) => {
  check(documentAbbr, String)
  return LegalCollection.find(
    { documentAbbr, effectiveAt: { $lte: new Date() } },
    {
      limit: 1,
      sort: { effectiveAt: -1 },
      fields: {
        documentAbbr: 1,
        version: 1,
        effectiveAt: 1
      }
    }
  )
})

/**
 * Get full version of all documents in the given language.
 * @param documentAbbr {String}
 * @param language {String}
 * @return {Mongo.Cursor}
 */
Meteor.publish(
  'freedombase:legal.getAll',
  function (documentAbbr: string, language: string) {
    check(documentAbbr, String)
    check(language, Match.Maybe(String))
    const sub = this

    const handle = LegalCollection.find(
      { documentAbbr },
      { sort: { effectiveAt: -1 } }
    ).observeChanges({
      added(id: string, doc: LegalDocument) {
        if (language && doc.language !== language && doc.i18n) {
          if (doc.i18n[language].title) doc.title = doc.i18n[language].title
          if (doc.i18n[language].text) doc.text = doc.i18n[language].text
          if (doc.i18n[language].changelog)
            doc.changelog = doc.i18n[language].changelog
          delete doc.i18n
        } else if (doc.i18n) {
          delete doc.i18n
        }
        sub.added('freedombase:legal', id, doc)
      },
      changed(id, fields) {
        sub.changed('freedombase:legal', id, fields)
      },
      removed(id) {
        sub.removed('freedombase:legal', id)
      }
    })
    this.ready()
    this.onStop(() => {
      handle.stop()
    })
  }
)

/**
 * Get full version of the given documents of the given version in the given language.
 * @param documentAbbr {String}
 * @param version {String}
 * @param language {String}
 * @return {Mongo.Cursor}
 */
Meteor.publish(
  'freedombase:legal.get',
  function (documentAbbr: string, version: string, language: string) {
    check(documentAbbr, String)
    check(version, String)
    check(language, Match.Maybe(String))
    const sub = this

    const handle = LegalCollection.find(
      { documentAbbr, version },
      { limit: 1, sort: { effectiveAt: -1 } }
    ).observeChanges({
      added(id: string, doc: LegalDocument) {
        if (
          language &&
          doc.language !== language &&
          doc.i18n &&
          doc.i18n[language]
        ) {
          if (doc.i18n[language].title) doc.title = doc.i18n[language].title
          if (doc.i18n[language].text) doc.text = doc.i18n[language].text
          if (doc.i18n[language].changelog)
            doc.changelog = doc.i18n[language].changelog
          delete doc.i18n
        } else if (doc.i18n) {
          delete doc.i18n
        }
        sub.added('freedombase:legal', id, doc)
      },
      changed(id, fields) {
        sub.changed('freedombase:legal', id, fields)
      },
      removed(id) {
        sub.removed('freedombase:legal', id)
      }
    })
    this.ready()
    this.onStop(() => {
      handle.stop()
    })
  }
)

/**
 * Gets version list for the given document abbreviation.
 * @param documentAbbr {String}
 * @return {Mongo.Cursor}
 */
Meteor.publish('freedombase:legal.getVersions', (documentAbbr: string) => {
  check(documentAbbr, String)

  return LegalCollection.find(
    { documentAbbr },
    {
      fields: { documentAbbr: 1, version: 1, effectiveAt: 1 },
      sort: { effectiveAt: -1 }
    }
  )
})

/**
 * Gets document by id
 * @param documentId {String}
 * @return {Mongo.Cursor}
 */
Meteor.publish('freedombase:legal.getDocument', (documentId: string) => {
  check(documentId, String)

  return LegalCollection.find(documentId, { limit: 1 })
})

/**
 * Authorization hook
 */
export const canAddLegalHook = new Hook()

Meteor.methods({
  /**
   * Create a new version of the defined document.
   * @param documentAbbr {String} Document abbreviation.
   * @param version {String} Version of the document.
   * @param language {String} Language code.
   * @param title {String} Title of the document.
   * @param text {String||Object} Text of the document for display.
   * @param changelog {String||Object} Changelog from the previous version.
   * @param from {Date} From what date is the document effective.
   * @return {string} ID of the inserted document.
   */
  'freedombase:legal.addNewVersion'(
    documentAbbr: string,
    version: string,
    language: string,
    title: string,
    text: string | object,
    changelog: string | object,
    from: Date = new Date()
  ) {
    check(documentAbbr, String)
    check(version, String)
    check(language, String)
    check(title, String)
    check(text, Match.OneOf(String, Object))
    check(changelog, Match.Maybe(Match.OneOf(String, Object)))
    check(from, Date)
    let canAdd: boolean = true
    canAddLegalHook.forEach((hook) => {
      const result: boolean = hook(documentAbbr, language, this.userId)
      if (result === false) canAdd = result // once cont is false it will stay false
    })
    if (!canAdd) return null
    return LegalCollection.insert({
      documentAbbr,
      version,
      title,
      text,
      changelog,
      language,
      effectiveAt: from
    })
  },
  /**
   * Add new version with i18n object.
   * @param documentAbbr {String} Document abbreviation.
   * @param version {String} Version of the document.
   * @param language {String} Language code of the main document.
   * @param title {String} Title of the document.
   * @param text {String||Object} Text of the document for display.
   * @param changelog {String||Object} Changelog from the previous version.
   * @param i18n {Object} Object with the translations: { cs: { title: "...", text: "..." }, es: { title: "...", text: "..." }, ...}
   * @param from {Date} From what date is the document effective.
   * @return {string} ID of the inserted document.
   */
  'freedombase:legal.addNewVersionAll'(
    documentAbbr: string,
    version: string,
    language: string,
    title: string,
    text: string | object,
    changelog: string | object,
    i18n: object,
    from: Date = new Date()
  ) {
    check(documentAbbr, String)
    check(version, String)
    check(language, String)
    check(title, String)
    check(text, Match.OneOf(String, Object))
    check(changelog, Match.OneOf(String, Object))
    check(from, Date)
    check(i18n, Object)
    let canAdd: boolean = true
    canAddLegalHook.forEach((hook) => {
      const result: boolean = hook(documentAbbr, language, this.userId)
      if (result === false) canAdd = result // once cont is false it will stay false
    })
    if (!canAdd) return null
    return LegalCollection.insert({
      documentAbbr,
      version,
      text,
      changelog,
      i18n,
      effectiveAt: from
    })
  },
  /**
   * Adds translation to already existing document.
   * @param documentAbbr {String} Document abbreviation.
   * @param version {String} Version of the document.
   * @param title {String} Title of the document.
   * @param text {String||Object} Text of the document for display.
   * @param changelog {String||Object} Changelog from the previous version.
   * @param language {String} Language code of the translation.
   * @return {number} Number of affected documents. Should be 1, or else the update failed.
   */
  'freedombase:legal.addTranslation'(
    documentAbbr: string,
    version: string,
    title: string,
    text: string | object,
    language: string,
    changelog: string | object
  ) {
    check(documentAbbr, String)
    check(version, String)
    check(title, String)
    check(text, Match.OneOf(String, Object))
    check(changelog, Match.Maybe(Match.OneOf(String, Object)))
    check(language, String)

    const i18n = { [language]: {} }
    i18n[language].title = title
    i18n[language].text = text
    i18n[language].changelog = changelog
    let canAdd: boolean = true
    canAddLegalHook.forEach((hook) => {
      const result: boolean = hook(documentAbbr, language, this.userId)
      if (result === false) canAdd = result // once cont is false it will stay false
    })
    if (!canAdd) return null
    return LegalCollection.update({ documentAbbr, version }, { $set: { i18n } })
  },
  /**
   * Update changelog for the given language.
   * @param id {String} ID of the document.
   * @param language {String} Language code of the translation.
   * @param changelog {String||Object} New version of the changelog.
   * @return {number}
   */
  'freedombase:legal.updateChangelog'(
    id: string,
    language: string,
    changelog: string | object
  ) {
    check(id, String)
    check(language, String)
    check(changelog, Match.OneOf(String, Object))
    const doc: LegalDocument = LegalCollection.findOne(
      { _id: id },
      { fields: { language: 1, documentAbbr: 1 } }
    )
    if (doc) {
      let canAdd: boolean = true
      canAddLegalHook.forEach((hook) => {
        const result: boolean = hook(doc.documentAbbr, language, this.userId)
        if (result === false) canAdd = result // once cont is false it will stay false
      })
      if (!canAdd) return null
      let set
      if (doc.language === language) {
        set = { changelog }
      } else {
        const i18n = {}
        i18n[language].changelog = changelog
      }
      return LegalCollection.update({ _id: id }, { $set: set })
    }
    return 0
  }
})
