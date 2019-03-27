# CHANGELOG
## v1.3.0 - unreleased
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
