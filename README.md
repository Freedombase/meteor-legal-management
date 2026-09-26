# freedombase:legal-management 📄

[![Project Status: Active – The project has reached a stable, usable state and is being actively developed.](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)
![GitHub](https://img.shields.io/github/license/Meteor-Community-Packages/template-package)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/Freedombase/meteor-legal-management.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Freedombase/meteor-legal-management/context:javascript) <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![](https://img.shields.io/badge/semver-2.0.0-success)](http://semver.org/spec/v2.0.0.html)
![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/freedombase/meteor-legal-management?label=latest&sort=semver)

Management of legal documents like Terms of Service and user consent made easy.

This package adds the basic functionality to manage your legal documents and makes them easily accessible for users together with managing user's consent. This package provides server side publications and methods.

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

const users = await Meteor.users.find({}, { fields: { _id: 1 } }).fetchAsync();

for (const user of users) {
  LegalAgreementCollection.insertAsync({ ownerId: user._id, agreements: [], history: [] });
}
```
If the users have already agreed to legal documents fill `agreements` array with the appropriate values.

#### Collection hooks

```js
import { Meteor } from 'meteor/meteor';
import { agreeTo, LegalAgreementCollection } from 'meteor/freedombase:legal-management';

Meteor.users.after.insert((userId, document) => {
  LegalAgreementCollection.insert({ ownerId: document._id, agreements: [], history: [] }, (err, id) => {
      if (id) {
        // the user had to agree to be able to access the registration page
        // TODO adjust to your needs
        agreeTo({ ownerId: document._id }, 'tos');
        // or
        // agreeTo({ ownerId: document._id }, ['tos', 'privacy', 'copyright']);
      }
    });
});
```

## Contributors ✨

Made by [@StorytellerCZ](https://www.github.com/StorytellerCZ).

Thanks goes to these wonderful contributors ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/StorytellerCZ"><img src="https://avatars2.githubusercontent.com/u/1715235?v=4" width="100px;" alt=""/><br /><sub><b>Jan Dvorak</b></sub></a><br /><a href="https://github.com/Jan Dvorak/Meteor Legal Management/commits?author=StorytellerCZ" title="Code">💻</a> <a href="https://github.com/Jan Dvorak/Meteor Legal Management/commits?author=StorytellerCZ" title="Documentation">📖</a> <a href="#maintenance-StorytellerCZ" title="Maintenance">🚧</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

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

### Authorization hook
The above methods all share a hook to check if a user is allowed to add a legal document.

#### `canAddLegalHook`
Import: `import { canAddLegalHook } from 'meteor/freedombase:legal-management`
You can create a new hook by registering it: `canAddLegalHook.register((documentAbbr, language, userId) => {/* Your authorization logic, return true to allow or false to stop. */})`

### Publications

#### `freedombase:legal.getLatest`
Gets the latest version of the given document in the given language.
 * @param `documentAbbr` {String}
 * @param `language` {String}
 * @return {Mongo.Cursor}
 
#### `freedombase:legal.getAll`
Get full version of all documents in the given language.
 * @param `documentAbbr` {String}
 * @param `language` {String}
 * @return {Mongo.Cursor}

#### `freedombase:legal.get`
Get full version of the given documents of the given version in the given language.
   * @param `documentAbbr` {String}
   * @param `version` {String}
   * @param `language` {String}
   * @return {Mongo.Cursor}

#### `freedombase:legal.getVersions`
Gets version list for the given document abbreviation.
 * @param `documentAbbr` {String}
 * @return {Mongo.Cursor}

#### `freedombase:legal.getDocument`
Gets a document by its id.
* @param `documentId` {String}
* @return {Mongo.Cursor}

## API - Consent

### Methods

#### `freedombase:legal.agreements.agreeBy`
Give agreement to the given document by the currently logged in user.
   * @param `what` {String|Array} Ids or abbreviations of the legal document
   * @param `userId` {String} Honoured only for server calls without a client connection. Server code running inside a client method (e.g. account creation hooks) inherits its connection, so call `agreeTo` there instead. Logged in user will take precedent before this param.
   * @returns {Array} Array of results of update functions

#### `freedombase:legal.agreements.revokeBy`
Revoke agreement to the given document by the currently logged in user.
   * @param `what` {String|Array} Ids or abbreviations of the legal document
   * @returns {Array} Array of results of update functions

### Server functions

Agreements normally belong to the user who gives them. When a user agrees on behalf of something else, such as an organization they administer, call these from server code instead of the methods. The record is stored with `ownerId` set to that owner, `ownerType` naming what it is, and `agreedBy` recording the acting user on each agreement and history entry.

#### `agreeTo(actor, what)`
Import: `import { agreeTo } from 'meteor/freedombase:legal-management'`
   * @param `actor` {Object} `{ ownerId, ownerType = 'user', agreedBy = ownerId }`
   * @param `what` {String|Array} Ids or abbreviations of the legal document
   * @returns {Array} Array of results of update functions

```js
await agreeTo(
  { ownerId: organization._id, ownerType: 'organization', agreedBy: this.userId },
  ['organizationTerms', 'organizationPublishingAgreement'],
)
```

#### `revokeFrom(actor, what)`
Import: `import { revokeFrom } from 'meteor/freedombase:legal-management'`
Same arguments as `agreeTo`.

Client collection writes are denied; consent is recorded through authenticated methods or server-side `agreeTo`. The built-in publications expose only the signed-in user’s own record. Read organization-owned records through an authorized application service or publication.

### Hooks
Both of the above methods have hook on before and after action. They are:

#### `beforeAgreedHook`
Import: `import { beforeAgreedHook } from 'meteor/freedombase:legal-management`
Part of the `freedombase:legal.agreements.agreeBy` method and triggers before any DB action takes place. If false is returned, then the DB action will not execute, so you need to return `true` if you want the execution of the method to continue.
You can create a new hook by registering it: `beforeAgreedHook.register((whichAgreement, ownerId, { ownerType, agreedBy }) => {})`
This hook will receive in the first argument which agreement is the subject of the call, in second the owner id (the user id for user-owned agreements) and in third the owner type and the acting user.

#### `afterAgreedHook`
Import: `import { afterAgreedHook } from 'meteor/freedombase:legal-management`
Part of the `freedombase:legal.agreements.agreeBy` method and triggers after DB actions take place.
You can create a new hook by registering it: `afterAgreedHook.register((whichAgreement, ownerId, dbResults, { ownerType, agreedBy }) => {})`
This hook will receive in the first argument which agreement is the subject of the call, in second the owner id, in third the result of the DB action and in fourth the owner type and the acting user.

#### `beforeRevokedHook`
Import: `import { beforeRevokedHook } from 'meteor/freedombase:legal-management`
Part of the `freedombase:legal.agreements.revokeBy` method and triggers before any DB action takes place.
You can create a new hook by registering it: `beforeRevokedHook.register((whichAgreement, ownerId, { ownerType, agreedBy }) => {})`
This hook will receive in the first argument which agreement is the subject of the call, in second the owner id and in third the owner type and the acting user.

#### `afterRevokedHook`
Import: `import { afterRevokedHook } from 'meteor/freedombase:legal-management`
Part of the `freedombase:legal.agreements.revokeBy` method and triggers after DB actions take place.
You can create a new hook by registering it: `afterRevokedHook.register((whichAgreement, ownerId, dbResults, { ownerType, agreedBy }) => {})`
This hook will receive in the first argument which agreement is the subject of the call and in second the user id, the final one will be the result of the DB action.

### Publications

#### `freedombase:legal.agreements.for`
Gets agreements/consent to legal documents.
 * @param `ownerId` {String} OPTIONAL, will default to the current user.
 * @returns {Mongo.Cursor}

 #### `freedombase:legal.agreements.history`
 Get history of consent changes.
 * @param `ownerId` {String} OPTIONAL, will default to the current user.
 * @returns {Mongo.Cursor}

 #### `freedombase:legal.agreements.full`
 Get all the data
 * @param ownerId {String} OPTIONAL, will default to the current user.
 * @returns {Mongo.Cursor}
