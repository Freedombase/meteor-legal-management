Package.describe({
  name: 'freedombase:legal-management',
  version: '1.0.0-rc.0',
  summary: 'Manage your legal documents and user consent.',
  git: 'https://github.com/freedombase/meteor-legal-management',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.1');
  api.use(['meteor', 'ecmascript', 'check', 'mongo']);
  api.use(['aldeed:collection2@3.0.0']);
  // 'socialize:base-model@1.1.2'

  api.mainModule('common.js');
  api.mainModule('server.js', 'server');
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('freedombase:legal-management');
  api.mainModule('legal-tests.js');
});
