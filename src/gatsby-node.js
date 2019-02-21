const { getTrelloCards } = require('./fetch');
const { normalize } = require('./normalize');
/**
 * FETCH ALL CARDS
 * ON NODE FOR EACH
 */
exports.sourceNodes = async (
  {
    actions: { createNode, touchNode, createParentChildLink },
    store,
    cache,
    createContentDigest,
    createNodeId
  },
  pluginOptions
) => {
  const data = await getTrelloCards(pluginOptions);
  try {
    await Promise.all(
      data.map(async card => {
        /**
         * CARDNODE INIT
         */
        const cardNode = {
          ...card,
          parent: `__SOURCE__`,
          children: [],
          internal: {
            type: `TrelloCard`,
            content: card.content,
            mediaType: `text/markdown`
          }
        };
        cardNode.internal.contentDigest = createContentDigest(cardNode);
        createNode(cardNode);
        /**
         * DOWNLOAD MEDIAS & MEDIANODE INIT
         */
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
                  pos: m.pos,
                  url: m.url,
                  id: m.id,
                  name: m.name,
                  parent: `__SOURCE__`,
                  children: [],
                  internal: {
                    type: `CardMedia`,
                    contentDigest: createContentDigest(m)
                  }
                }
              });
              createParentChildLink({
                parent: cardNode,
                child: mediaNode
              });
              createNode(mediaNode);
            })
          );
        }
        return;
      })
    );
  } catch (error) {
    console.log(`ERROR while creating nodes : ${error}`);
  }
};
