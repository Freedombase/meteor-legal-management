import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const LegalCollection = new Mongo.Collection('freedombase:legal');

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
    type: Object,
    blackbox: true
  },
  changelog: {
    type: Object,
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
    autoValue() {
      if (this.isInsert || !this.isFromTrustedCode) return new Date();
    },
    denyUpdate: true
  },
  updatedAt: {
    type: Date,
    optional: true,
    autoValue() {
      if (this.isUpdate) return new Date();
    }
  }
});

LegalCollection.attachSchema(schema);
// allow/deny
LegalCollection.allow({
  insert() {
    return false;
  },
  update() {
    return false;
  },
  remove() {
    return false;
  }
});

if (Meteor.isServer) {
  // add unique compound index for documentAbbr + version
  LegalCollection.rawCollection().createIndex({documentAbbr: 1, version: 1}, {unique: true});
  /**
   * Gets the latest version of the given document in the given language.
   * @param documentAbbr {String}
   * @param language {String}
   * @return {MongoDB Pointer}
   */
  Meteor.publish('freedombase:legal.getLatest', function(documentAbbr, language) {
    check(documentAbbr, String);
    check(language, Match.Maybe(String));

    const handle = LegalCollection.find({ documentAbbr, effectiveAt: { $lte: new Date() } }, { limit: 1 }).observeChanges({
      added(id, doc) {
        if (language && doc.language !== language && doc.i18n) {
          doc.title = doc.i18n[language].title;
          doc.text = doc.i18n[language].text;
          doc.changelog = doc.i18n[language].changelog;
          delete doc.i18n;
        } else if (doc.i18n) {
          delete doc.i18n;
        }
        this.added('freedombase:legal', id, doc);
      },
      changed(id, fields) {
        this.changed('freedombase:legal', id, fields);
      },
      removed(id) {
        this.removed('freedombase:legal', id);
      }
    });
    this.ready();
    this.onStop(() => {
      handle.stop();
    });
  });

  /**
   * Get full version of all documents in the given language.
   * @param documentAbbr {String}
   * @param language {String}
   * @return {MongoDB Pointer}
   */
  Meteor.publish('freedombase:legal.getAll', function(documentAbbr, language) {
    check(documentAbbr, String);
    check(language, Match.Maybe(String));

    const handle = LegalCollection.find({ documentAbbr }, { sort: { effectiveAt: -1 } }).observeChanges({
      added(id, doc) {
        if (language && doc.language !== language && doc.i18n) {
          doc.title = doc.i18n[language].title;
          doc.text = doc.i18n[language].text;
          doc.changelog = doc.i18n[language].changelog;
          delete doc.i18n;
        } else if (doc.i18n) {
          delete doc.i18n;
        }
        this.added('freedombase:legal', id, doc);
      },
      changed(id, fields) {
        this.changed('freedombase:legal', id, fields);
      },
      removed(id) {
        this.removed('freedombase:legal', id);
      }
    });
    this.ready();
    this.onStop(() => {
      handle.stop();
    });
  });

  /**
   * Get full version of the given documents of the given version in the given language.
   * @param documentAbbr {String}
   * @param version {String}
   * @param language {String}
   * @return {MongoDB Pointer}
   */
  Meteor.publish('freedombase:legal.get', function(documentAbbr, version, language) {
    check(documentAbbr, String);
    check(version, String);
    check(language, Match.Maybe(String));

    const handle = LegalCollection.find({ documentAbbr, version }, { sort: { effectiveAt: -1 } }).observeChanges({
      added(id, doc) {
        if (language && doc.language !== language && doc.i18n) {
          doc.title = doc.i18n[language].title;
          doc.text = doc.i18n[language].text;
          doc.changelog = doc.i18n[language].changelog;
          delete doc.i18n;
        } else if (doc.i18n) {
          delete doc.i18n;
        }
        this.added('freedombase:legal', id, doc);
      },
      changed(id, fields) {
        this.changed('freedombase:legal', id, fields);
      },
      removed(id) {
        this.removed('freedombase:legal', id);
      }
    });
    this.ready();
    this.onStop(() => {
      handle.stop();
    });
  });

  /**
   * Gets version list for the given document abbreviation.
   * @param documentAbbr {String}
   * @return {MongoDB Pointer}
   */
  Meteor.publish('freedombase:legal.getVersions', (documentAbbr) => {
    check(documentAbbr, String);

    return LegalCollection.find(
      { documentAbbr },
      {
        fields: { documentAbbr: 1, version: 1, effectiveAt: 1 },
        sort: { effectiveAt: -1 }
      }
    );
  });

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
    'freedombase:legal.addNewVersion'(documentAbbr, version, language, title, text, changelog, from = new Date()) {
      check(documentAbbr, String);
      check(version, String);
      check(language, String);
      check(title, String);
      check(text, Match.OneOf(String, Object));
      check(changelog, Match.Maybe(Match.OneOf(String, Object)));
      check(from, Date);
      return LegalCollection.insert(
        { documentAbbr, version, title, text, changelog, language, i18n: {}, effectiveAt: from }
      );
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
    'freedombase:legal.addNewVersionAll'(documentAbbr, version, language, title, text, changelog, i18n, from = new Date()) {
      check(documentAbbr, String);
      check(version, String);
      check(language, String);
      check(title, String);
      check(text, Match.OneOf(String, Object));
      check(changelog, Match.OneOf(String, Object));
      check(from, Date);
      check(i18n, Object);

      return LegalCollection.insert({ documentAbbr, version, text, changelog, i18n, effectiveAt: from });
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
    'freedombase:legal.addTranslation'(documentAbbr, version, title, text, language, changelog) {
      check(documentAbbr, String);
      check(version, String);
      check(title, String);
      check(text, Match.OneOf(String, Object));
      check(changelog, Match.Maybe(Match.OneOf(String, Object)));
      check(language, String);

      let i18n = {};
      i18n[language].title = title;
      i18n[language].text = text;
      i18n[language].changelog = changelog;

      return LegalCollection.update({ documentAbbr, version }, { $set: { i18n } });
    },
    /**
     * Update changelog for the given language.
     * @param id {String} ID of the document.
     * @param language {String} Language code of the translation.
     * @param changelog {String||Object} New version of the changelog.
     * @return {number}
     */
    'freedombase:legal.updateChangelog'(id, language, changelog) {
      check(id, String);
      check(language, String);
      check(changelog, Match.OneOf(String, Object));

      const doc = LegalCollection.findOne({ _id: id }, { fields: { language: 1 } });
      if (doc) {
        let set;
        if (doc.language === language) {
          set = { changelog };
        } else {
          let i18n = {};
          i18n[language].changelog = changelog;
        }
        return LegalCollection.update({ _id: id }, { $set: set });
      }
      return 0;
    }
  });
}
