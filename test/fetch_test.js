const { deepEqual, equal } = require('assert');
const faker = require('faker');
const nock = require('nock');

const { getTrelloCards } = require('../src/fetch');

const fakeParams = {key: 'key', token: 'token', board_id: '1234556'};
const fakeDueDate = faker.date.future().toISOString();
const fakeUrl = faker.internet.url();

describe('Data fetched from Trello', function() {
  this.beforeEach(function() {
    mockTrelloResponses();
  });

  it('includes all the cards from the board', async function() {
    const results = await getTrelloCards(fakeParams);

    equal(results.length, 4);
  });

  describe('Each Card', function() {
    it('includes properties', async function() {
      const results = await getTrelloCards(fakeParams);

      for (result of results) {
        deepEqual(result.due, fakeDueDate);
        equal(result.url, fakeUrl);
        equal(result.checklists.length, 1);
      }
    });
  });
});

function mockTrelloResponses() {
  const scope = nock('https://api.trello.com');

  scope.get(`/1/boards/${fakeParams.board_id}/lists`)
    .query(true)
    .reply(200, [
      {
          'id': '59a342987202eb8c13ee6cb2',
          'name': 'Main Course'
      },
      {
          'id': '5bbd6f16ec4e618a3dedd825',
          'name': 'Deserts'
      }
    ]);

  scope.get('/1/list/5bbd6f16ec4e618a3dedd825/cards')
    .query(true)
    .reply(200, [
      {
          'id': '586353f89d7be8c1d43c8340',
          'name': 'Vegan Pancakes / crèpes (crepes)'
      },
      {
          'id': '58d7067d1d60ebd072c43bc6',
          'name': 'Banana Bread'
      },
    ]);

  scope.get('/1/list/59a342987202eb8c13ee6cb2/cards')
    .query(true)
    .reply(200, [
      {
        'id': '5bd6336f4ba8c62e479ccca8',
        'name': 'Mushroom Risotto',
      },
      {
        'id': '5c8ecc20c4336c616b57410d',
        'name': 'Sloppy Joes',
      },
    ]);

  const pathWithIdCapturing = /\/1\/cards\/(\w+)/;
  scope.get(pathWithIdCapturing)
    .query(queryObject => {
      equal(queryObject.fields, 'id,name,desc,due,url');
      equal(queryObject.checklists, 'all');
      equal(queryObject.checklist_fields, 'name,id');
      return true;
    })
    .reply(200, (uri) => {
      const cardId = uri.match(pathWithIdCapturing)[1];
      return {
        'attachments': [],
        'desc': `Description of ${cardId}`,
        'id': cardId,
        'name': `Name of ${cardId}`,
        'due': fakeDueDate,
        'url': fakeUrl,
        'checklists': [{
          checkItems: [
            { id: "123123", name: "1 pound of dates"},
            { id: "646464", name: "4 large yams"},
          ],
          id: "59ae06d39f754ff22ca604ee",
          name: "Fruits Grown in Quebec",
        }],
      }
    })

  scope.persist();
  return scope;
}
