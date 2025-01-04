import { Hono } from 'hono'
import { config } from './graphql'
const app = new Hono()

export default {
    fetch: config
}
