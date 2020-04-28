const fetch = require("./fetch");

const { normalize } = require("./normalize");

// FETCH ALL CARDS
// ON NODE FOR EACH

exports.sourceNodes = async (
  {
    actions: { createNode, touchNode, createParentChildLink },
    store,
    cache,
    createContentDigest,
    createNodeId
  },
  configOptions
) => {
  const data = await fetch.getTrelloCards(configOptions);
  console.log(`Fetching from Trello...`);
  let cardCount = 0;
  try {
    await Promise.all(
      data.map(async card => {
        // CARDNODE INIT
        const cardNode = toCardNode(card);
        cardNode.internal.contentDigest = createContentDigest(cardNode);
        createNode(cardNode);
        cardCount++;
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

function toCardNode(card) {
  return {
    ...card,
    due: !card.due ? null : new Date(card.due),
    parent: '__SOURCE__',
    children: [],
    internal: {
      type: 'TrelloCard',
      content: card.content,
      mediaType: 'text/markdown'
    }
  }
}

exports.toCardNode = toCardNode;
