const axios = require("axios");

const slugify = require("slugify");

exports.getTrelloCards = async ({
  key,
  token,
  board_id
}) => {
  const getData = params => axios.get(`https://api.trello.com/1/${params}&key=${key}&token=${token}`);

  const results = [];

  try {
    const {
      data: lists
    } = await getData(`boards/${board_id}/lists?lists=all&fields=id,name`);
    await Promise.all(lists.map(async (list, i) => {
      const {
        data: cards
      } = await getData(`list/${list.id}/cards?fields=id,name`);
      await Promise.all(cards.map(async (card, e) => {
        const {
          data
        } = await getData(
          `cards/${card.id}?fields=id,name,desc,due,url,labels&checklists=all&checklist_fields=name,id&attachments=true&attachment_fields=id,url,name,pos`
        );
        const medias = [];

        if (data.attachments.length) {
          data.attachments.forEach(a => {
            medias.push({
              id: a.id,
              name: a.name,
              url: a.url,
              pos: a.pos,
              slug: slugify(a.name.split(".").shift(), {
                replacement: "_",
                lower: true
              })
            });
          });
        }

        results.push({
          list_index: i,
          list_id: list.id,
          list_slug: slugify(list.name, {
            replacement: "_",
            lower: true
          }),
          list_name: list.name,
          index: e,
          id: data.id,
          slug: slugify(data.name, {
            replacement: "_",
            lower: true
          }),
          name: data.name,
          content: data.desc,
          medias: medias || null,
          due: data.due,
          url: data.url,
          labels: data.labels,
          checklists: data.checklists,
        });
      }));
    }));
    return results;
  } catch (error) {
    console.log(`ERROR while fetching cards : ${error}`);
  }
};
