Package.describe({
  name: 'freedombase:legal-management',
  version: '1.0.0-beta.1',
  summary: 'Manage your legal documents like TOS.',
  git: 'https://github.com/StorytellerCZ/meteor-legal-management',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.1');
  api.use(['meteor', 'ecmascript', 'check', 'mongo']);
  api.use(['aldeed:collection2@3.0.0']);

  api.mainModule('legal.js');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('freedombase:legal-management');
  api.mainModule('legal-tests.js');
});
