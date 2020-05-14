const { equal, deepEqual } = require('assert');
const sinon = require('sinon');

const { toCardNode, sourceNodes } = require('../src/sourceNodes');
const fetch = require('../src/fetch');

describe('Graphql', function() {
  const mockCards = [
    {
      list_index: 2,
      list_id: 'list-123',
      list_slug: 'slugified-list-name',
      list_name: 'regular list name',
      index: 34,
      id: 'card-333',
      slug: 'slugified-card-name',
      name: 'Card Name',
      content: 'This is a card from a Trello Board',
      medias: null,
      due: '2020-04-29T01:55:00.000Z',
      url: 'https://trello.com/c/LMEy1myI/47-fruits',
    }
  ];

  beforeEach(() => {
    sinon.stub(fetch, 'getTrelloCards').resolves(mockCards);
  });

  afterEach(() => {
    sinon.restore();
  })

  it('works', async () => {
    const logStub = sinon.spy(console, 'log');

    await sourceNodes({
      actions: {
        createNode: sinon.stub(),
        createParentChildLink: sinon.stub(),
      },
      store: {},
      cache: {},
      createContentDigest: sinon.stub().returns({}),
    });

    equal(logStub.callCount, 2, 'should not have an error message');
  });

  describe('trelloCard node properties', function() {
    it('includes properties', function() {
      const cardNode = toCardNode(mockCards[0]);

      deepEqual(cardNode.due, new Date(mockCards[0].due));
    });
    it('handles null date', function() {
      const cardNode = toCardNode({ ...mockCards[0], due: null });

      equal(cardNode.due, null);
    });
  });
});
