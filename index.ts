import { Hono } from 'hono'
import { type RootResolver, graphqlServer } from '@hono/graphql-server'
import { buildSchema } from 'graphql'

const app = new Hono()

const schema = buildSchema(`
type Query {
  hello: String
}
`)

const rootResolver: RootResolver = (c) => {
  return {
    hello: () => 'Hello Hono!',
  }
}

app.use(
  '/graphql',
  graphqlServer({
    schema,
    rootResolver,
    graphiql: true, // if `true`, presents GraphiQL when the GraphQL endpoint is loaded in a browser.
  })
)

app.fire()

export default app;