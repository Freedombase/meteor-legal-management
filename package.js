/* global Package */
Package.describe({
  name: 'freedombase:legal-management',
  version: '1.5.0',
  summary: 'Manage your legal documents and user consent.',
  git: 'https://github.com/freedombase/meteor-legal-management',
  documentation: 'README.md'
})

Package.onUse(function (api) {
  api.versionsFrom('2.3')
  api.use(['meteor', 'ecmascript', 'check', 'mongo', 'typescript', 'callback-hook'])
  api.use(['aldeed:collection2@3.5.0', 'aldeed:schema-index@3.0.0', 'aldeed:schema-deny@3.0.0'])
  // 'socialize:base-model@1.1.2'

  api.mainModule('common.ts', 'client')
  api.mainModule('server.ts', 'server')
})

Package.onTest(function (api) {
  api.use('ecmascript')
  api.use('tinytest')
  api.use('typescript')
  api.use('freedombase:legal-management')
  api.mainModule('legal-tests.ts', ['client', 'server'])
})
