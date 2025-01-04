import { createPubSub, createSchema } from 'graphql-yoga'
import { randomUUID } from 'node:crypto';
import { setTimeout as setTimeout$ } from 'node:timers/promises'

const pubSub = createPubSub()
const ROOMS = new Map();

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    enum Level {
      EASY
      MEDIUM
      HARD
    }

    type Player {
      id: ID!
      username: String!
    }

    scalar DateTime

    type Room {
      id: ID!
      name: String!
      createdAt: DateTime
      updatedAt: DateTime
    }

    type Query {
      rooms: [Room!]!
      room(id: ID!): Room
      quizz(level: Level): String!
    }

    type Mutation {
      joinRoom(roomId: ID!, player: String!): String!
      createPlayer(username: String!): Player!
      createRoom(name: String!): Room!
    }

    type Subscription {
      countdown(from: Int!): Int!
      userJoined(roomId: ID!): String!
    }
  `,
  resolvers: {
    Query: {
      rooms: () => Array.from(ROOMS.values()),
      room: (_, { id }) => ROOMS.get(id),
      quizz: (_, { level }) => `Level: ${level}`
    },
    Mutation: {
        createRoom: (_, { name }) => {
            const id = randomUUID();
            const room = {
                id,
                name,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            ROOMS.set(id, room);
            return room;
        },
        joinRoom: (_, { roomId, player }) => {
            if (!ROOMS.has(roomId)) throw new Error(`Room ${roomId} not found`);
            pubSub.publish('USER_JOINED', `${player} joined the room (${roomId})`);
            return `Welcome ${player}!`;
        },
        createPlayer: (_, { username }) => {
            return {
                id: randomUUID(),
                username
            }
        }
    },
    Subscription: {
        countdown: {
            subscribe: async function* (_, { from }) {
                for (let i = from; i >= 0; i--) {
                    await setTimeout$(1000)
                    yield { countdown: i }
                }
            }
        },
        userJoined: {
            subscribe: (_, { roomId }) => {
                if (!ROOMS.has(roomId)) throw new Error(`Room ${roomId} not found`);
                return pubSub.subscribe('USER_JOINED')
            },
            resolve: payload => payload
        }
    }
  }
})
