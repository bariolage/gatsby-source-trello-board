const { createRemoteFileNode } = require('gatsby-source-filesystem');

exports.normalize = async ({
  createNode,
  touchNode,
  store,
  cache,
  media,
  createNodeId
}) => {
  let fileNodeID;

  if (media.internal && media.internal.type === `CardMedia`) {
    const remoteDataCacheKey = `card-media-${media.id}`;
    const cacheRemoteData = await cache.get(remoteDataCacheKey);

    if (cacheRemoteData) {
      fileNodeID = cacheRemoteData.fileNodeID;
      touchNode({ nodeId: cacheRemoteData.fileNodeID });
      //console.log(`${media.name}'s file all ready exist`)
    }

    if (!fileNodeID) {
      try {
        const fileExt = media.url.split(".").pop();
        const fileNode = await createRemoteFileNode({
          url: media.url,
          cache,
          store,
          createNode,
          createNodeId,
          ext: `.${fileExt}`,
          name: media.name
        });
        if (fileNode) {
          fileNodeID = fileNode.id;
          await cache.set(remoteDataCacheKey, { fileNodeID });
        }
      } catch (error) {
        console.log(`ERROR while creating remote file : ${error}`);
      }
    }
    if (fileNodeID) {
      media.localFile___NODE = fileNodeID;
    }
    return media;
  }
};
