import React from "react"
import Head from "next/head"
import { useSession } from "next-auth/react"
import { Box } from "@mui/material"
import Dashboard from "@/components/dashboard"
import { Unauthenticated } from "@/components/forms"
import redis from "@/utils/redis"
import { RunningAverage } from "@/types"
import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./api/auth/[...nextauth]"
import { DashboardFilterContextProvider } from "@/components/dashboard/context"

export async function getServerSideProps({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse
}) {
  const session = await getServerSession(req, res, authOptions)
  let dashboardFilters: Record<string, string | null> = {
    runningAvg: null,
    analyzeEntities: null,
    tokenTags: null,
    minTokenCount: null,
    minEntityCount: null,
    sentenceTerms: null,
    hiddenTokens: null,
    hiddenEntities: null,
  }

  if (session?.status === "authenticated")
    dashboardFilters = await redis.hgetall(`dashboardFilters/${session.user.id}`)
  return { props: dashboardFilters }
}

export default function Home(dashboardFilters: {
  runningAvg: RunningAverage | null
  analyzeEntities: string | null
  tokenTags: string | null
  minTokenCount: string | null
  minEntityCount: string | null
  sentenceTerms: string | null
  hiddenTokens: string | null
  hiddenEntities: string | null
}) {
  const session = useSession()

  return (
    <>
      <Head>
        <title>creativity tracker</title>
      </Head>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        m="auto"
      >
        {session.status === "authenticated" ? (
          <DashboardFilterContextProvider {...dashboardFilters}>
            <Dashboard />
          </DashboardFilterContextProvider>
        ) : (
          <Unauthenticated />
        )}
      </Box>
    </>
  )
}
