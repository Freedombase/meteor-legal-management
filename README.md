# freedombase:legal-management 📄

Management of legal documents like Terms of Service made easy.

This package adds the basic functionality to manage your legal documents and makes them easily accessible for users. This package provides server side publications and methods.

Made by [@StorytellerCZ](https://www.github.com/StorytellerCZ).

## Install

Run the following command in your app:

```sh
meteor add freedombase:legal-management
```

## API

### Methods

#### `freedombase:legal.addNewVersion`
Create a new version of the defined document.
   * @param `documentAbbr` {String} Document abbreviation.
   * @param `version` {String} Version of the document.
   * @param `language` {String} Language code.
   * @param `title` {String} Title of the document.
   * @param `text` {String||Object} Text of the document for display.
   * @param `changelog` {String||Object} Changelog from the previous version.
   * @param `from` {Date} OPTIONAL From what date is the document effective. If no option provided, it will be effective immediately.
   * @return {string} ID of the inserted document.

#### `freedombase:legal.addNewVersionAll`
Add new version with i18n object.
   * @param `documentAbbr` {String} Document abbreviation.
   * @param `version` {String} Version of the document.
   * @param `language` {String} Language code of the main document.
   * @param `title` {String} Title of the document.
   * @param `text` {String||Object} Text of the document for display.
   * @param `changelog` {String||Object} Changelog from the previous version.
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
