const { equal, deepEqual } = require('assert');
const sinon = require('sinon');

const {
  toCardNode,
  toCheckListItemNode,
  toCheckListNode,
  sourceNodes,
} = require('../src/sourceNodes');
const fetch = require('../src/fetch');

describe('Graphql', function() {
  const checkItem1 = {
    id: "59ae06dc4c215c8cf94cd47a",
    idChecklist: "59ae06d39f754ff22ca604ee",
    name: "Water Melon",
  };
  const checkItem2 = {
    id: "59ae06e0bce19711997f7354",
    idChecklist: "59ae06d39f754ff22ca604ee",
    name: "Cantaloupe",
  };
  const checklist = {
    checkItems: [
      checkItem1,
      checkItem2,
    ],
    id: "59ae06d39f754ff22ca604ee",
    name: "Fruits Grown in Quebec",
  };
  const mockCards = [
    {
      list_index: 2,
      list_id: 'list-123',
      list_slug: 'slugified-list-name',
      list_name: 'regular list name',
      labels: [],
      index: 34,
      id: 'card-333',
      slug: 'slugified-card-name',
      name: 'Card Name',
      content: 'This is a card from a Trello Board',
      medias: null,
      due: '2020-04-29T01:55:00.000Z',
      url: 'https://trello.com/c/LMEy1myI/47-fruits',
      checklists: [checklist],
    }
  ];

  let createContentDigest;

  beforeEach(() => {
    createContentDigest = sinon.stub().returns({});
  });

  afterEach(() => {
    sinon.restore();
  });

  it('creates nodes and sets the hierarchy', async () => {
    sinon.stub(fetch, 'getTrelloCards').resolves(mockCards);
    const logStub = sinon.spy(console, 'log');
    const createNode = sinon.stub();
    const createParentChildLink = sinon.stub();

    const sourceNodesParams = {
      actions: { createNode, createParentChildLink },
      store: {},
      cache: {},
      createContentDigest,
    };

    await sourceNodes(sourceNodesParams);

    equal(logStub.callCount, 2, 'should not have an error message');
    const createNodeCalls = createNode.getCalls();
    const expectedCardNode = toCardNode(mockCards[0], createContentDigest);
    const expectedChecklistNode = toCheckListNode(checklist, createContentDigest);
    const expectedChecklistItemNode1 = toCheckListItemNode(
      checkItem1,
      createContentDigest
    );
    const expectedChecklistItemNode2 = toCheckListItemNode(
      checkItem2,
      createContentDigest
    );
    deepEqual(createNodeCalls[0].firstArg, expectedCardNode);
    deepEqual(createNodeCalls[1].firstArg, expectedChecklistNode);
    deepEqual(createNodeCalls[2].firstArg, expectedChecklistItemNode1);
    deepEqual(createNodeCalls[3].firstArg, expectedChecklistItemNode2);
    equal(createNodeCalls.length, 4);
    deepEqual(
      createParentChildLink.getCalls()[0].firstArg,
      { parent: expectedCardNode, child: expectedChecklistNode }
    );
    deepEqual(
      createParentChildLink.getCalls()[1].firstArg,
      { parent: expectedChecklistNode, child: expectedChecklistItemNode1 }
    );
    deepEqual(
      createParentChildLink.getCalls()[2].firstArg,
      { parent: expectedChecklistNode, child: expectedChecklistItemNode2 }
    );
    equal(createParentChildLink.getCalls().length, 3)
  });

  describe('trelloCard node properties', function() {
    it('includes properties', function() {
      const cardNode = toCardNode(mockCards[0], () => {});

      deepEqual(cardNode.due, new Date(mockCards[0].due));
    });
    it('handles null date', function() {
      const cardNode = toCardNode({ ...mockCards[0], due: null }, () => {});

      equal(cardNode.due, null);
    });
  });

  describe('checklist', function() {
    it('includes properties', () => {
      const checklistNode = toCheckListNode(checklist, createContentDigest)

      equal(checklistNode.id, checklist.id)
      equal(checklistNode.name, checklist.name)
    });

    it('is type TrelloChecklist', () => {
      const checklistNode = toCheckListNode(checklist, createContentDigest)

      equal(checklistNode.internal.type, 'TrelloBoardChecklist')
    });

    it('uses fetched object as digest', () => {
      createContentDigest.returns('hash12323');

      const checklistNode = toCheckListNode(checklist, createContentDigest);

      deepEqual(createContentDigest.lastCall.firstArg, checklist);
      equal(checklistNode.internal.contentDigest, 'hash12323');
    });
  });

  describe('checklistItems', function() {
    it('includes properties', () => {
      checklistItemNode = toCheckListItemNode(checkItem2, createContentDigest);

      equal(checklistItemNode.id, checkItem2.id);
      equal(checklistItemNode.name, checkItem2.name);
    });

    it('is type TrelloBoardChecklistItem', () => {
      checklistItemNode = toCheckListItemNode(checkItem2, createContentDigest);

      equal(checklistItemNode.internal.type, 'TrelloBoardChecklistItem');
    });

    it('uses fetched object as digest', () => {
      createContentDigest.returns('test123');
      checklistItemNode = toCheckListItemNode(checkItem2, createContentDigest);

      deepEqual(createContentDigest.lastCall.firstArg, checkItem2);
      equal(checklistItemNode.internal.contentDigest, 'test123');
    });

  });
});
