/* global Package */
Package.describe({
  name: 'freedombase:legal-management',
  version: '1.4.2',
  summary: 'Manage your legal documents and user consent.',
  git: 'https://github.com/freedombase/meteor-legal-management',
  documentation: 'README.md'
})

Package.onUse(function (api) {
  api.versionsFrom('1.9')
  api.use(['meteor', 'ecmascript', 'check', 'mongo'])
  api.use(['aldeed:collection2@3.0.6', 'aldeed:schema-index@3.0.0', 'aldeed:schema-deny@3.0.0'])
  // 'socialize:base-model@1.1.2'

  api.mainModule('common.js', 'client')
  api.mainModule('server.js', 'server')
})

Package.onTest(function (api) {
  api.use('ecmascript')
  api.use('tinytest')
  api.use('freedombase:legal-management')
  api.mainModule('legal-tests.js')
})
