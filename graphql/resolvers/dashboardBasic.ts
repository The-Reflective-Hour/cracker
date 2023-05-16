import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { type MyContext } from "@/pages/api/graphql"
import {
  PgBasicCount,
  PgQueryError,
  PgQueryResponse,
  PgBasicSentence,
  PgBasicWord,
} from "@/types"
import { pool } from "@/utils/postgres"
import { getServerSession } from "next-auth"
import { Arg, Ctx, Query, Resolver } from "type-graphql"
import redis from "@/utils/redis"
import { BasicDashboardResponse } from "../schemas/dashboard"

@Resolver(BasicDashboardResponse)
export class BasicDashboardReslover {
  @Query(() => BasicDashboardResponse)
  async dashboardBasic(
    @Arg("runningAvg", () => String!) runningAvg: string,
    @Ctx() { req, res }: MyContext
  ): Promise<BasicDashboardResponse> {
    const {
      user: { id: user },
    } = await getServerSession(req, res, authOptions)

    const cachedMetrics = await redis.get(`basic/${user}/${runningAvg}`)
    if (cachedMetrics)
      return {
        dashboard: JSON.parse(cachedMetrics),
      }

    const queryWords: PgBasicWord[] = []
    const queryCounts: PgBasicCount[] = []
    const querySentences: PgBasicSentence[] = []
    return await pool
      .connect()
      .then(async (client: any) => {
        client.query("BEGIN")
        return client
          .query(`CALL get_dashboard_basic($1, $2, null, null, null);`, [
            1,
            runningAvg,
          ])
          .then(async () => {
            return Promise.all([
              await client
                .query(`FETCH ALL FROM "<unnamed portal 1>";`)
                .then((r: PgQueryResponse<PgBasicWord>) =>
                  queryWords.push(...r.rows)
                ),
              await client
                .query(`FETCH ALL FROM "<unnamed portal 2>";`)
                .then((r: PgQueryResponse<PgBasicCount>) =>
                  queryCounts.push(...r.rows)
                ),
              await client
                .query(`FETCH ALL FROM "<unnamed portal 3>";`)
                .then((r: PgQueryResponse<PgBasicSentence>) =>
                  querySentences.push(...r.rows)
                ),
            ]).then(async () => {
              const sentences = querySentences.map(
                (
                  { sentence, rating, number_creative_hours, created_at, overview },
                  idx
                ) => {
                  return {
                    text: {
                      content: sentence,
                    },
                    id: idx.toString(),
                    rating,
                    numberCreativeHours: Number(number_creative_hours),
                    createdAt: created_at.toString(),
                    overview,
                  }
                }
              )

              const words = queryCounts.map(({ word, count }) => {
                return {
                  word: {
                    text: {
                      content: word,
                    },
                    mentions: queryWords
                      .filter(({ word: queryWord }) => word === queryWord)
                      .map(
                        ({
                          rating,
                          number_creative_hours,
                          overview,
                          created_at,
                          id,
                        }) => {
                          return {
                            id: id.toString(),
                            overview,
                            rating,
                            numberCreativeHours: Number(number_creative_hours),
                            createdAt: created_at.toString(),
                          }
                        }
                      ),
                  },
                  count: Number(count),
                  hide: false,
                }
              })

              const dashboard = { sentences, words }

              await redis.set(
                `basic/${user}/${runningAvg}`,
                JSON.stringify(dashboard)
              )

              return { dashboard }
            })
          })
      })
      .catch((e: PgQueryError) => {
        console.log(e)
        return {
          errors: [
            {
              field: "unknown",
              message: "unhandled error",
            },
          ],
        }
      })
  }
}
