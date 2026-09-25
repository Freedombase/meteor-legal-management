import { beforeEach, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  publications: {} as Record<
    string,
    (
      this: { userId: string | null; ready: () => void },
      ownerId?: string,
    ) => unknown
  >,
  rules: {} as Record<string, (...args: unknown[]) => boolean>,
  find: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  upsert: vi.fn(),
}))
vi.mock('meteor/meteor', () => ({
  Meteor: {
    publish: (name: string, handler: (typeof mocks.publications)[string]) => {
      mocks.publications[name] = handler
    },
    methods: vi.fn(),
    Error: class extends Error {},
  },
}))
vi.mock('meteor/check', () => ({
  check: vi.fn(),
  Match: { Optional: vi.fn(), OneOf: vi.fn() },
}))
vi.mock('meteor/callback-hook', () => ({
  Hook: class {
    forEachAsync() {}
  },
}))
vi.mock('meteor/aldeed:simple-schema', () => ({
  default: class {
    static RegEx = { Id: String }
  },
}))
vi.mock('meteor/aldeed:collection2/dynamic', () => ({}))
vi.mock('meteor/mongo', () => ({
  Mongo: {
    Collection: class {
      attachSchema() {}
      allow(rules: typeof mocks.rules) {
        mocks.rules = rules
      }
      createIndexAsync() {
        return Promise.resolve()
      }
      find = mocks.find
      findOneAsync = mocks.findOne
      updateAsync = mocks.update
      upsertAsync = mocks.upsert
    },
  },
}))
vi.mock('./common/legal', () => ({
  LegalCollection: {
    findOneAsync: async () => ({
      _id: 'terms1',
      documentAbbr: 'organizationTerms',
    }),
  },
}))

vi.stubGlobal('Collection2', { load: vi.fn() })
const { agreeTo } = await import('./server/agreement-server')
beforeEach(() => {
  mocks.find.mockClear()
  mocks.findOne.mockReset()
  mocks.upsert.mockReset()
})
for (const suffix of ['for', 'history', 'full']) {
  it(`${suffix} only publishes the logged-in user's own agreements`, () => {
    const publish = mocks.publications[`freedombase:legal.agreements.${suffix}`]
    const ready = vi.fn()
    publish.call({ userId: null, ready }, 'victim')
    publish.call({ userId: 'attacker', ready }, 'victim')
    publish.call({ userId: 'attacker', ready }, 'organization-id')
    expect(mocks.find).not.toHaveBeenCalled()
    expect(ready).toHaveBeenCalledTimes(3)
    publish.call({ userId: 'owner', ready }, 'user')
    publish.call({ userId: 'owner', ready }, 'owner')
    expect(mocks.find).toHaveBeenCalledTimes(2)
    expect(
      mocks.find.mock.calls.every(([query]) => query.ownerId === 'owner'),
    ).toBe(true)
  })
}
it('denies direct client writes, including forged organization consent', () => {
  expect(
    mocks.rules.insert('attacker', {
      ownerId: 'org1',
      ownerType: 'organization',
    }),
  ).toBe(false)
  expect(mocks.rules.update('owner', { ownerId: 'owner' })).toBe(false)
  expect(mocks.rules.remove('owner')).toBe(false)
})
it('preserves a persisted acceptance time when server setup recovery writes consent', async () => {
  const acceptedAt = new Date('2026-01-01')
  await agreeTo(
    {
      ownerId: 'org1',
      ownerType: 'organization',
      agreedBy: 'owner',
      acceptedAt,
    },
    ['terms1'],
  )
  expect(mocks.upsert).toHaveBeenCalledWith(
    { ownerId: 'org1' },
    expect.objectContaining({
      $addToSet: expect.objectContaining({
        history: {
          createdAt: acceptedAt,
          agreement: 'terms1',
          action: 'agreed',
          agreedBy: 'owner',
        },
      }),
    }),
  )
})
