# CHANGELOG

## v1.4.2 - 2020-04-28
### Fix
  - Add missing `aldeed:schema-index` and `aldeed:schema-deny` packages to dependencies

### Updates
  - Updated dev dependencies
  - Remove all contributors script from pre-commit hook as it failed to run


## v1.4.1 - 2020-02-29
### Fix
  - When legal document is not found while calling `freedombase:legal.agreements.agreeBy`, it will throw an error instead of failing.

### Updates
  - Bumped minimum Meteor version to `v1.9`
  - Updated `aldeed:collection2` to `v3.0.6`
  - Updated dev dependencies

## v1.4.0 - 2019-11-20
### Updates
  - Bumped minimum Meteor version to `v1.8.1`
  - Updated `aldeed:collection2` to `v3.0.3`
  - Added GitHub templates and other related stuff

### New
  - Code re-formatted according to Standard.js rules
  - Added [All Contributors](https://allcontributors.org/)

## v1.3.2 - 2019-10-20
### Changes/Updates
  - Updated `aldeed:collection2` to `v3.0.2`.
  - Made error messages more clear.
  - Bumped minimum Meteor version to `v1.4.2.7` which the minimal feature version and latest patch version (of that feature version) to actually support this package.

## v1.3.1 - 2019-08-08
### Fixes/Changed
  - In case a document is not available in the requested language, default to the primary language of the document. Fixes a bug where document would return empty on subscription if it did not exists in the requested language.

## v1.3.0 - 2019-03-27
### Changed
  - Make `createdAt` optional parameters so that they can be auto created.
  - Added optional parameter `userId` to `freedombase:legal.agreements.agreeBy` method to allow usage in `Meteor.users.after.insert` hook when user might be still logging in and the `userId` is not yet set. `Meteor.userId()` will take precedent before this variable.

## v1.2.0 - 2019-01-01
### Added
  - Methods `freedombase:legal.agreements.agreeBy` and `freedombase:legal.agreements.revokeBy` now also accept array input.

## v1.1.0 - 2018-05-30
### Added
  - Limiting and sorting for better Oplog support and performance.
### Fix
  - An issue in agreement where user would be undefined, resulting in an innconsitency between MiniMongo and Mongo.

## v1.0.0 - 2018-05-30
- Initial release :tada:
