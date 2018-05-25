# freedombase:legal-management 📄

Management of legal documents like Terms of Service and user consent made easy.

This package adds the basic functionality to manage your legal documents and makes them easily accessible for users together with managing user's consent. This package provides server side publications and methods.

Made by [@StorytellerCZ](https://www.github.com/StorytellerCZ).

## Install

Run the following command in your app:

```sh
meteor add freedombase:legal-management
```

## Overview

This package has two parts. First is the management of legal documents. Second is the management of user (or other entities) consent to these documents.

### Integration into your app

#### Migration

If you have an existing app you will want to do a database migration for your existing users. This should looks something like this:

```js
import { Meteor } from 'meteor/meteor';
import { LegalAgreementCollection } from 'meteor/freedombase:legal-management';

const users = Meteor.users.find({}, { fields: { _id: 1 } }).fetch();

users.forEach(user => {
  LegalAgreementCollection.insert({ ownerId: user._id, agreements: [], history: [] });
});
```
If the users have already agreed to legal documents fill `agreements` array with the appropriate values.

#### Collection hooks

```js
import { Meteor } from 'meteor/meteor';
import { LegalAgreementCollection } from 'meteor/freedombase:legal-management';

Meteor.users.after.insert((userId, document) => {
  LegalAgreementCollection.insert({ ownerId: document._id, agreements: [], history: [] }, (err, id) => {
      if (id) {
        // the user had to agree to be able to access the registration page
        // TODO adjust to your needs
        Meteor.call('freedombase:legal.agreements.agreeBy', 'tos');
        Meteor.call('freedombase:legal.agreements.agreeBy', 'privacy');
        Meteor.call('freedombase:legal.agreements.agreeBy', 'copyright');
      }
    });
});
```

## API - Agreements

### Methods

#### `freedombase:legal.addNewVersion`
Create a new version of the defined document.
   * @param `documentAbbr` {String} Document abbreviation.
   * @param `version` {String} Version of the document.
   * @param `language` {String} Language code.
   * @param `title` {String} Title of the document.
   * @param `text` {Object} Text of the document for display.
   * @param `changelog` {Object} Changelog from the previous version.
   * @param `from` {Date} OPTIONAL From what date is the document effective. If no option provided, it will be effective immediately.
   * @return {string} ID of the inserted document.

#### `freedombase:legal.addNewVersionAll`
Add new version with i18n object.
   * @param `documentAbbr` {String} Document abbreviation.
   * @param `version` {String} Version of the document.
   * @param `language` {String} Language code of the main document.
   * @param `title` {String} Title of the document.
   * @param `text` {Object} Text of the document for display.
   * @param `changelog` {Object} Changelog from the previous version.
   * @param `i18n` {Object} Object with the translations. e.g. { cs: { title: "...", text: "..." }, es: { title: "...", text: "..." }, ...}
   * @param `from` {Date} OPTIONAL From what date is the document effective. If no option provided, it will be effective immediately.
   * @return {string} ID of the inserted document.

#### `freedombase:legal.addTranslation`
Adds translation to already existing document.
   * @param `documentAbbr` {String} Document abbreviation.
   * @param `version` {String} Version of the document.
   * @param `title` {String} Title of the document.
   * @param `text` {Object} Text of the document for display.
   * @param `language` {String} Language code of the translation.
   * @param `changelog` {Object} Changelog from the previous version.
   * @return {number} Number of affected documents. Should be 1, or else the update failed.

#### `freedombase:legal.updateChangelog`
Update changelog for the given language.
   * @param `id` {String} ID (`_id`) of the document.
   * @param `language` {String} Language code of the translation.
   * @param `changelog` {Object} New version of the changelog.
   * @return {number}

### Publications

#### `freedombase:legal.getLatest`
Gets the latest version of the given document in the given language.
 * @param `documentAbbr` {String}
 * @param `language` {String}
 * @return {MongoDB Pointer}
 
#### `freedombase:legal.getAll`
Get full version of all documents in the given language.
 * @param `documentAbbr` {String}
 * @param `language` {String}
 * @return {MongoDB Pointer}

#### `freedombase:legal.get`
Get full version of the given documents of the given version in the given language.
   * @param `documentAbbr` {String}
   * @param `version` {String}
   * @param `language` {String}
   * @return {MongoDB Pointer}

#### `freedombase:legal.getVersions`
Gets version list for the given document abbreviation.
 * @param `documentAbbr` {String}
 * @return {MongoDB Pointer}

## API - Consent

### Methods

#### `freedombase:legal.agreements.agreeBy`
Give agreement to the given document by the currently logged in user.
   * @param `what` {String} Id or abbreviation of the legal document
   * @return {Boolean}

#### `freedombase:legal.agreements.revokeBy`
Revoke agreement to the given document by the currently logged in user.
   * @param what {String} Id or abbreviation of the legal document
   * @returns {Boolean}

### Publications

#### `freedombase:legal.agreements.for`
Gets agreements/consent to legal documents.
 * @param `ownerId` {String} OPTIONAL, will default to the current user.
 * @returns {MongoDB pointer}

 #### `freedombase:legal.agreements.history`
 Get history of consent changes.
 * @param `ownerId` {String} OPTIONAL, will default to the current user.
 * @returns {MongoDB pointer}

 #### `freedombase:legal.agreements.full`
 Get all the data
 * @param ownerId {String} OPTIONAL, will default to the current user.
 * @returns {MongoDB pointer}
