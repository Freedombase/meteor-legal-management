# CHANGELOG

## v2.0.2 - 2024-08-10

- Fix use of `observeChanges` to `observeChangesAsync`
- Updated `zodern:types` to v1.0.13

## v2.0.1 - 2024-07-16

- Added option to depend on the latest v2 of `aldeed:simple-schema` as well as v1.13.1

## v2.0.0 - 2024-07-16

- Minimum Meteor version is now `2.8.1`, compatible with `v3.0`
- All collection calls have been migrated to async
- Removed `aldeed:schema-index` as its functionality has been replaced by Meteor default `createIndexAsync` method.
- Added `aldeed:simple-schema`
- Upgraded `aldeed:collection2` to `v4.0.3`
- Upgraded `aldeed:schema-deny` to `v4.0.1`
- Replace eslint with Biome

## v1.8.2 - 2023-12-30

- Update `zodern:types` to v1.0.11
- Added Meteor `3.0-beta.0` as a supported target to make it easy to perform the initial upgrade, functionality wise it
  is not yet supported.

## v1.8.1 - 2023-05-24

- Make `createdAt` optional in type for proper insert type

## v1.8.0 - 2023-05-13

- Added `zodern:types`
- Exported types into `legal.d.ts`
- Updated dev dependencies

## v1.7.1 - 2022-01-13

### Changes

- Updated `@types/meteor` to v2.0.2

### Fixes

- Ensure that when calling `freedombase:legal.agreements.agreeBy` that user agrees to the current legal document

## v1.7.0 - 2021-12-11

### Fixes

- Fix a bug in method `freedombase:legal.addTranslation`

### New feature

- New publication `freedombase:legal.getDocument`

## v1.6.1 - 2021-12-10

### Fixes

- Fix bug where hooks were not exposed

## v1.6.0 - 2021-11-15

### Fixes

- Fix schema for agreements

### Changes

- Bumped minimum Meteor version to 2.3

### New features

- Added hooks to agreements methods
- Added `canAddLegalHook` to check if a user is allowed to add a legal document

## v1.5.0 - 2021-10-27

### Fixes

- Fixed schema where it would only accept object when in documentation it could accept both object and string.

### Changes

- Rewrote code into Typescript

### Updates

- Updated dev dependencies to the latest versions
- Updated `aldeed:collection2` to v3.5.0

## v1.4.3 - 2021-05-12

### Fix

- Add additional check for i18n checking so that it doesn't throw errors when a language is missing.

### Updates

- Updated `aldeed:collection2` to v3.3.0

## v1.4.2 - 2020-04-28

### Fix

- Add missing `aldeed:schema-index` and `aldeed:schema-deny` packages to dependencies

### Updates

- Updated dev dependencies
- Remove all contributors script from pre-commit hook as it failed to run

## v1.4.1 - 2020-02-29

### Fix

- When legal document is not found while calling `freedombase:legal.agreements.agreeBy`, it will throw an error instead
  of failing.

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
- Bumped minimum Meteor version to `v1.4.2.7` which the minimal feature version and latest patch version (of that
  feature version) to actually support this package.

## v1.3.1 - 2019-08-08

### Fixes/Changed

- In case a document is not available in the requested language, default to the primary language of the document. Fixes
  a bug where document would return empty on subscription if it did not exists in the requested language.

## v1.3.0 - 2019-03-27

### Changed

- Make `createdAt` optional parameters so that they can be auto created.
- Added optional parameter `userId` to `freedombase:legal.agreements.agreeBy` method to allow usage
  in `Meteor.users.after.insert` hook when user might be still logging in and the `userId` is not yet
  set. `Meteor.userId()` will take precedent before this variable.

## v1.2.0 - 2019-01-01

### Added

- Methods `freedombase:legal.agreements.agreeBy` and `freedombase:legal.agreements.revokeBy` now also accept array
  input.

## v1.1.0 - 2018-05-30

### Added

- Limiting and sorting for better Oplog support and performance.

### Fix

- An issue in agreement where user would be undefined, resulting in an innconsitency between MiniMongo and Mongo.

## v1.0.0 - 2018-05-30

- Initial release :tada:
