const fetch = require("./fetch");

const { normalize } = require("./normalize");

// FETCH ALL CARDS
// ONE NODE FOR EACH

async function sourceNodes(
  {
    actions: { createNode, touchNode, createParentChildLink },
    store,
    cache,
    createContentDigest,
    createNodeId
  },
  configOptions
) {
  const data = await fetch.getTrelloCards(configOptions);
  console.log(`Fetching from Trello...`);
  let cardCount = 0;
  try {
    await Promise.all(
      data.map(async card => {
        // CARDNODE INIT
        const cardNode = toCardNode(card, createContentDigest);
        createNode(cardNode);
        cardCount++;

        // Create checklist nodes
        card.checklists.forEach((checklist) => {
          const checklistNode = toCheckListNode(checklist, createContentDigest);
          createNode(checklistNode);
          createParentChildLink({ parent: cardNode, child: checklistNode });
          checklist.checkItems.forEach(checklistItem => {
            const checklistItemNode = toCheckListItemNode(
              checklistItem,
              createContentDigest
            );
            createNode(checklistItemNode);
            createParentChildLink({
              parent: checklistNode,
              child: checklistItemNode,
            });
          })
        });

        // DOWNLOAD MEDIAS & MEDIANODE INIT
        if (cardNode.medias) {
          await Promise.all(
            cardNode.medias.map(async m => {
              const mediaNode = await normalize({
                createNode,
                createNodeId,
                touchNode,
                store,
                cache,
                media: {
                  list_name: cardNode.list_name,
                  list_slug: cardNode.list_slug,
                  card_slug: cardNode.slug,
                  card_name: cardNode.name,
                  slug: m.slug,
                  url: m.url,
                  id: m.id,
                  name: m.name,
                  parent: cardNode.id,
                  children: [],
                  internal: {
                    type: `CardMedia`,
                    contentDigest: createContentDigest(m)
                  }
                }
              });

              createNode(mediaNode);
              createParentChildLink({
                parent: cardNode,
                child: mediaNode
              });
            })
          );
        }

        return;
      })
    );
  } catch (error) {
    console.log(`ERROR while creating nodes : ${error}`);
  }
  console.log(`....................... ${cardCount} cards.`);
};

function toCardNode(card, createContentDigest) {
  const node = {
    ...card,
    due: !card.due ? null : new Date(card.due),
    parent: '__SOURCE__',
    children: [],
    internal: {
      type: 'TrelloCard',
      content: card.content,
      mediaType: 'text/markdown'
    },
  };
  node.internal.contentDigest = createContentDigest(node);
  return node;
}

function toCheckListNode(checklist, createContentDigest) {
  return {
    id: checklist.id,
    name: checklist.name,
    internal: {
      type: 'TrelloBoardChecklist',
      contentDigest: createContentDigest(checklist),
    },
  };
}

function toCheckListItemNode(checklistItem, createContentDigest) {
  return {
    id: checklistItem.id,
    name: checklistItem.name,
    internal: {
      type: 'TrelloBoardChecklistItem',
      contentDigest: createContentDigest(checklistItem),
    }
  };
}

module.exports = {
  sourceNodes,
  toCardNode,
  toCheckListItemNode,
  toCheckListNode,
};
