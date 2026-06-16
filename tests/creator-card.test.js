/* eslint-disable no-unused-expressions */
const { MockModelStubs } = require('@app/mock-models');
const createMockServer = require('@app-core/mock-server');
const { expect } = require('chai');

describe('CreatorCard API Tests', () => {
  let server;
  let creatorCardsDb = [];

  before(() => {
    // Create mock for CreatorCard.create
    MockModelStubs.CreatorCard.create.default = function (data) {
      const doc = { ...data };
      if (!doc._id) {
        doc._id = `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      creatorCardsDb.push(doc);
      return doc;
    };

    // Create mock for CreatorCard.findOne
    MockModelStubs.CreatorCard.findOne.default = function (configuration) {
      const { query } = configuration;
      const found = creatorCardsDb.find((card) =>
        Object.keys(query).every((key) => {
          if (query[key] === null) {
            return card[key] === null || card[key] === undefined;
          }
          return card[key] === query[key];
        })
      );

      if (found) {
        const result = { ...found };
        result.id = result._id;
        delete result._id;
        return result;
      }
      return null;
    };

    // Create mock for CreatorCard.updateOne
    MockModelStubs.CreatorCard.updateOne.default = function (configuration) {
      const { query, updateValues } = configuration;
      const idx = creatorCardsDb.findIndex((card) =>
        Object.keys(query).every((key) => card[key] === query[key])
      );

      if (idx !== -1) {
        Object.assign(creatorCardsDb[idx], updateValues);
        return { acknowledged: true, modifiedCount: 1 };
      }
      return { acknowledged: true, modifiedCount: 0 };
    };

    // Create mock for CreatorCard.deleteOne
    MockModelStubs.CreatorCard.deleteOne.default = function (configuration) {
      const { query } = configuration;
      const idx = creatorCardsDb.findIndex((card) =>
        Object.keys(query).every((key) => card[key] === query[key])
      );

      if (idx !== -1) {
        creatorCardsDb.splice(idx, 1);
        return { deletedCount: 1 };
      }
      return { deletedCount: 0 };
    };

    server = createMockServer(['endpoints/creator-cards/']);
  });

  beforeEach(() => {
    creatorCardsDb = [];
  });

  // ==================== HELPER FUNCTIONS ====================
  const createCard = (overrides = {}) => {
    const defaultCard = {
      _id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'Sample Creator Card',
      description: '',
      slug: 'sample-creator-card',
      creator_reference: 'crt_9x7k4m2p6q8w3z5n',
      links: [],
      service_rates: null,
      status: 'published',
      access_type: 'public',
      access_code: null,
      created: Date.now(),
      updated: Date.now(),
      deleted: null,
    };
    return { ...defaultCard, ...overrides };
  };

  const expectError = (response, expectedCode, expectedStatus = 400) => {
    expect(response.statusCode).to.equal(expectedStatus);
    expect(response.data.status).to.equal('error');
    expect(response.data.code).to.equal(expectedCode);
  };

  const expectSuccess = (response, expectedStatus = 200) => {
    expect(response.statusCode).to.equal(expectedStatus);
    expect(response.data.status).to.equal('success');
    expect(response.data.data).to.exist;
  };

  // ==================== TEST SUITES ====================
  describe('POST /creator-cards - Create', () => {
    it('should create a public published creator card with all fields', async () => {
      const payload = {
        title: 'TechTalks Podcast',
        description: 'Weekly tech discussions and interviews',
        slug: 'techtalks-podcast',
        creator_reference: 'crt_3f8k9m2x4p7w6q5z',
        links: [
          { title: 'Spotify', url: 'https://spotify.com/techtalks' },
          { title: 'Apple Podcasts', url: 'https://apple.com/podcast/techtalks' },
        ],
        service_rates: {
          currency: 'USD',
          rates: [
            {
              name: 'Sponsorship Mention',
              description: '30-second sponsor read during episode',
              amount: 250000,
            },
            {
              name: 'Full Episode Sponsorship',
              description: 'Entire episode sponsored by your brand',
              amount: 750000,
            },
          ],
        },
        status: 'published',
      };

      const response = await server.post('/creator-cards', { body: payload });

      expectSuccess(response);
      expect(response.data.data.title).to.equal('TechTalks Podcast');
      expect(response.data.data.slug).to.equal('techtalks-podcast');
      expect(response.data.data.id).to.exist;
      expect(response.data.data._id).to.be.undefined;
      expect(response.data.data.access_type).to.equal('public');
      expect(response.data.data.access_code).to.be.null;
      expect(response.data.data.links).to.have.lengthOf(2);
      expect(response.data.data.service_rates.currency).to.equal('USD');
      expect(response.data.data.service_rates.rates).to.have.lengthOf(2);
    });

    it('should auto-generate slug when not provided', async () => {
      const payload = {
        title: 'The Morning Brew Newsletter',
        creator_reference: 'crt_b7k3m9x2p4w6q8z1',
        status: 'published',
      };

      const response = await server.post('/creator-cards', { body: payload });

      expectSuccess(response);
      expect(response.data.data.slug).to.equal('the-morning-brew-newsletter');
      expect(response.data.data.id).to.exist;
      expect(response.data.data._id).to.be.undefined;
    });

    it('should create a private card with access code', async () => {
      const payload = {
        title: 'Executive Briefing',
        description: 'Premium content for C-suite executives',
        creator_reference: 'crt_a9z8y7x6w5v4u3t2',
        status: 'published',
        access_type: 'private',
        access_code: 'X7Y9Z2',
      };

      const response = await server.post('/creator-cards', { body: payload });

      expectSuccess(response);
      expect(response.data.data.access_code).to.equal('X7Y9Z2');
      expect(response.data.data.access_type).to.equal('private');
      expect(response.data.data.title).to.equal('Executive Briefing');
      expect(response.data.data.id).to.exist;
      expect(response.data.data._id).to.be.undefined;
    });

    it('should create a draft card', async () => {
      const payload = {
        title: 'Work in Progress',
        creator_reference: 'crt_m2n5b8v3c6x9z4l7',
        status: 'draft',
      };

      const response = await server.post('/creator-cards', { body: payload });

      expectSuccess(response);
      expect(response.data.data.status).to.equal('draft');
      expect(response.data.data.id).to.exist;
      expect(response.data.data._id).to.be.undefined;
    });

    it('should return SL02 when slug is already taken', async () => {
      creatorCardsDb.push(
        createCard({
          slug: 'techtalks-podcast',
          title: 'TechTalks Podcast',
          creator_reference: 'crt_3f8k9m2x4p7w6q5z',
        })
      );

      const payload = {
        title: 'Another Tech Podcast',
        slug: 'techtalks-podcast',
        creator_reference: 'crt_m1n2b3v4c5x6z7l8',
        status: 'published',
      };

      const response = await server.post('/creator-cards', { body: payload });
      expectError(response, 'SL02', 400);
    });

    it('should return AC01 when access_code missing on private card', async () => {
      const payload = {
        title: 'Confidential Report',
        creator_reference: 'crt_q1w2e3r4t5y6u7i8',
        status: 'published',
        access_type: 'private',
      };

      const response = await server.post('/creator-cards', { body: payload });
      expectError(response, 'AC01', 400);
    });

    it('should return AC05 when access_code provided on public card', async () => {
      const payload = {
        title: 'Public Newsletter',
        creator_reference: 'crt_q1w2e3r4t5y6u7i8',
        status: 'published',
        access_type: 'public',
        access_code: 'P9Q3R7',
      };

      const response = await server.post('/creator-cards', { body: payload });
      expectError(response, 'AC05', 400);
    });

    it('should return SL03 for invalid slug format', async () => {
      const payload = {
        title: 'Invalid Slug Card',
        creator_reference: 'crt_q1w2e3r4t5y6u7i8',
        status: 'published',
        slug: 'invalid slug with spaces!',
      };

      const response = await server.post('/creator-cards', { body: payload });
      expect(response.statusCode).to.equal(400);
      expect(response.data.status).to.equal('error');
    });

    it('should return validation error for invalid enum value', async () => {
      const payload = {
        title: 'Bad Status Card',
        creator_reference: 'crt_q1w2e3r4t5y6u7i8',
        status: 'pending', // Invalid enum
      };

      const response = await server.post('/creator-cards', { body: payload });
      expect(response.statusCode).to.equal(400);
      expect(response.data.status).to.equal('error');
    });
  });

  describe('GET /creator-cards/:slug - Retrieve', () => {
    beforeEach(() => {
      creatorCardsDb = [
        createCard({
          _id: '01ABCDEFGHIJKLMNOPQRSTUVWX',
          title: 'Design Weekly',
          slug: 'design-weekly',
          creator_reference: 'crt_8f2k1m9x4p7w3q5z',
          description: 'Weekly design inspiration and resources',
          links: [
            { title: 'Portfolio', url: 'https://designweekly.com' },
            { title: 'Twitter', url: 'https://twitter.com/designweekly' },
          ],
          service_rates: {
            currency: 'GBP',
            rates: [
              {
                name: 'Newsletter Ad',
                description: 'Single newsletter ad placement',
                amount: 1500,
              },
              {
                name: 'Featured Article',
                description: 'Featured article with backlink',
                amount: 3500,
              },
            ],
          },
        }),
        createCard({
          _id: '02JKLMNOPQRSTUVWXYZ123456',
          title: 'Private Content Hub',
          slug: 'private-hub',
          creator_reference: 'crt_x9y8z7w6v5u4t3s2',
          access_type: 'private',
          access_code: 'M4N8P2',
          description: 'Exclusive content for premium subscribers',
        }),
        createCard({
          _id: '03QRSTUVWXYZ789012345678',
          title: 'Draft Article',
          slug: 'draft-article',
          creator_reference: 'crt_8f2k1m9x4p7w3q5z',
          status: 'draft',
          description: 'This article is still being worked on',
        }),
        createCard({
          _id: '04UVWXYZ1234567890ABCDEF',
          title: 'Deleted Card',
          slug: 'deleted-card',
          creator_reference: 'crt_8f2k1m9x4p7w3q5z',
          deleted: 1699999999999,
        }),
      ];
    });

    it('should retrieve a public published card', async () => {
      const response = await server.get('/creator-cards/design-weekly');

      expectSuccess(response);
      expect(response.data.data.title).to.equal('Design Weekly');
      expect(response.data.data.id).to.equal('01ABCDEFGHIJKLMNOPQRSTUVWX');
      expect(response.data.data._id).to.be.undefined;
      expect(response.data.data.access_code).to.be.undefined;
      expect(response.data.data.links).to.have.lengthOf(2);
      expect(response.data.data.service_rates.currency).to.equal('GBP');
    });

    it('should retrieve a private card with correct access code', async () => {
      const response = await server.get('/creator-cards/private-hub?access_code=M4N8P2');

      expectSuccess(response);
      expect(response.data.data.title).to.equal('Private Content Hub');
      expect(response.data.data.id).to.equal('02JKLMNOPQRSTUVWXYZ123456');
      expect(response.data.data._id).to.be.undefined;
      expect(response.data.data.access_code).to.be.undefined;
    });

    it('should return NF01 for non-existent card', async () => {
      const response = await server.get('/creator-cards/non-existent-slug-xyz');
      expectError(response, 'NF01', 404);
    });

    it('should return NF01 for deleted card', async () => {
      const response = await server.get('/creator-cards/deleted-card');
      expectError(response, 'NF01', 404);
    });

    it('should return NF02 for draft card', async () => {
      const response = await server.get('/creator-cards/draft-article');
      expectError(response, 'NF02', 404);
    });

    it('should return AC03 for private card without access code', async () => {
      const response = await server.get('/creator-cards/private-hub');
      expectError(response, 'AC03', 403);
    });

    it('should return AC04 for private card with wrong access code', async () => {
      const response = await server.get('/creator-cards/private-hub?access_code=WRONG1');
      expectError(response, 'AC04', 403);
    });
  });

  describe('DELETE /creator-cards/:slug - Delete', () => {
    beforeEach(() => {
      creatorCardsDb.push(
        createCard({
          _id: '01EFGHIJKLMNOPQRSTUVWXYZ',
          title: 'Tech Startup Blog',
          slug: 'tech-startup-blog',
          creator_reference: 'crt_a1b2c3d4e5f6g7h8',
          description: 'Insights from the tech startup world',
        })
      );

      creatorCardsDb.push(
        createCard({
          _id: '02EFGHIJKLMNOPQRSTUVWXYZ',
          title: 'Another Blog',
          slug: 'another-blog',
          creator_reference: 'crt_z9y8x7w6v5u4t3s2',
          description: "Different creator's blog",
        })
      );
    });

    it('should soft delete a card and set deleted timestamp', async () => {
      const payload = {
        creator_reference: 'crt_a1b2c3d4e5f6g7h8',
      };

      const response = await server.delete('/creator-cards/tech-startup-blog', { body: payload });

      expectSuccess(response);
      expect(response.data.data.deleted).to.exist;
      expect(response.data.data.deleted).to.not.be.null;
      expect(response.data.data.title).to.equal('Tech Startup Blog');
      expect(response.data.data.id).to.equal('01EFGHIJKLMNOPQRSTUVWXYZ');
      expect(response.data.data._id).to.be.undefined;

      // Verify card is no longer retrievable
      const getResponse = await server.get('/creator-cards/tech-startup-blog');
      expectError(getResponse, 'NF01', 404);
    });

    it('should return NF01 when deleting non-existent card', async () => {
      const payload = {
        creator_reference: 'crt_q1w2e3r4t5y6u7i8',
      };

      const response = await server.delete('/creator-cards/does-not-exist-123', { body: payload });
      expectError(response, 'NF01', 404);
    });

    it('should return permission error when creator_reference mismatch', async () => {
      const payload = {
        creator_reference: 'crt_wrong_reference_123',
      };

      const response = await server.delete('/creator-cards/tech-startup-blog', { body: payload });
      expectError(response, 'PERMERR', 403);
    });

    it('should allow deleting a card with correct creator_reference', async () => {
      const payload = {
        creator_reference: 'crt_z9y8x7w6v5u4t3s2',
      };

      const response = await server.delete('/creator-cards/another-blog', { body: payload });

      expectSuccess(response);
      expect(response.data.data.title).to.equal('Another Blog');
      expect(response.data.data.deleted).to.exist;
      expect(response.data.data.deleted).to.not.be.null;
    });
  });
});
