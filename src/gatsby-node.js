const { getTrelloCards } = require("./fetch");

const { normalize } = require("./normalize");
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
};
