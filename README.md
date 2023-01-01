# gatsby-source-trello-board

Source plugin for pulling data into [Gatsby](https://www.gatsbyjs.org/) from a [Trello](https://trello.com) board.

## Install
```
 npm install --save gatsby-source-trello-board
```

## How to use

In your gatsby-config.js :

```graphql
{
  resolve: `gatsby-source-trello-board`,
  options: {
    key: `<your Trello key>`,
    token: `<your Trello token>`,
    board_id: `<your Trello Board id>`,
  }
}
```

Dont forget to use [Environment Variables](https://www.gatsbyjs.org/docs/environment-variables/) if you want to keep your key and token private.

## How to query

**Gatsby-source-trello-board** will fetch information of each card of the board :

- **due**: due date that is set on card
- **id**: id of the list
- **index**: card position in the board
- **labels**: array of labels on the card
- **list_id**: id of the list
- **list_index**: list position in the board
- **list_name**: name of the list
- **list_slug**: name of the list slugified
- **name**: name of the card
- **slug**: name of the card slugified
- **url**: url of the card

```graphql
{
  allTrelloCard(
    filter: { list_name: { eq: "Name of the list" } }
    sort: { fields: [index], order: ASC }
  ) {
    edges {
      node {
        content
        id
        index
        labels
        list_id
        list_index
        list_name
        list_slug
        name
        slug
      }
    }
  }
}
```

You also can write markdown in _Description_, it supports [gatsby-transformer-remark](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/).

```graphql
{
  trelloCard(name: { eq: "Name of the card" }) {
    childMarkdownRemark {
      excerpt
      frontmatter {
        title
      }
      html
    }
  }
}
```

Card’s attachments are downloaded so [gatsby-image](https://www.gatsbyjs.org/packages/gatsby-image/) can be used.

- **childrenCardMedia**: Array of card’s attachments

```graphql
{
  trelloCard(name: { eq: "Name of the card" }) {
    childrenCardMedia {
      id
      name
      localFile {
        childImageSharp {
          fluid
        }
      }
    }
  }
}
```
