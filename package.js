/* global Package */
Package.describe({
  name: 'freedombase:legal-management',
  version: '1.8.2',
  summary: 'Manage your legal documents and user consent.',
  git: 'https://github.com/freedombase/meteor-legal-management',
  documentation: 'README.md'
})

Package.onUse(function (api) {
  api.versionsFrom(['2.3', '3.0-beta.0'])
  api.use([
    'meteor',
    'ecmascript',
    'check',
    'mongo',
    'typescript',
    'callback-hook',
    'zodern:types@1.0.11'
  ])
  api.use([
    'aldeed:collection2@3.5.0',
    'aldeed:schema-index@3.0.0',
    'aldeed:schema-deny@3.0.0'
  ])
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
