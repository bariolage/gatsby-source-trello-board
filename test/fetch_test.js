const { equal } = require('assert');
const nock = require('nock');

const { getTrelloCards } = require('../src/fetch');

describe('Data fetched from Trello', function() {
  this.beforeEach(function() {
    mockTrelloResponses();
  });

  it('includes all the cards from the board', async function() {
    const results = await getTrelloCards('key', 'token', 'board_id');

    equal(results.length, 4);
  });
});

function mockTrelloResponses() {
  const TRELLO_API_URL = 'https://api.trello.com/1';

  nock(`${TRELLO_API_URL}`)
    .get(/\/boards\/\w+\/lists/)
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

  nock(`${TRELLO_API_URL}`)
    .get('/list/5bbd6f16ec4e618a3dedd825/cards')
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

  nock(`${TRELLO_API_URL}`)
    .get('/list/59a342987202eb8c13ee6cb2/cards')
    .query(true)
    .reply(200, [
      {
        'id': '5bd6336f4ba8c62e479ccca8',
        'name': 'Mushroom Risotto'
      },
      {
        'id': '5c8ecc20c4336c616b57410d',
        'name': 'Sloppy Joes'
      },
    ]);

  const pathWithIdCapturing = /\/cards\/(\w+)/;
  nock(`${TRELLO_API_URL}`)
    .get(pathWithIdCapturing)
    .reply(200, (uri) => {
      const cardId = uri.match(pathWithIdCapturing)[1];
      return {
        'attachments': [],
        'desc': `Description of ${cardId}`,
        'id': cardId,
        'name': `Name of ${cardId}`
      }
    })
    .persist();
}
