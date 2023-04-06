import "reflect-metadata"
import { ApolloServer } from "@apollo/server"
import { startServerAndCreateNextHandler } from "@as-integrations/next"
import { buildSchema } from "type-graphql"
import {
  RegistrationResolver,
  MeReslover,
  TrackerResolver,
  DashboardReslover,
} from "@/graphql/resolvers"
import { NextApiRequest, NextApiResponse } from "next"
import { UpdateTrackerResolver } from "@/graphql/resolvers/updateTrack"

const schema = await buildSchema({
  resolvers: [
    RegistrationResolver,
    MeReslover,
    TrackerResolver,
    DashboardReslover,
    UpdateTrackerResolver,
  ],
  validate: false,
})

const server = new ApolloServer({ schema })

export type MyContext = {
  req: NextApiRequest
  res: NextApiResponse
}

export default startServerAndCreateNextHandler(server, {
  context: async (req, res): Promise<MyContext> => ({
    req,
    res,
  }),
})
