import { createYoga } from 'graphql-yoga'
import { useGraphQLSSE } from '@graphql-yoga/plugin-graphql-sse'
import { schema } from './schema'

export const config = createYoga({
    schema,
    plugins: [useGraphQLSSE()],
})
