import { AppBar, Box, Typography } from "@mui/material"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"
import AvatarMenu from "./avatarMenu"

export default function Navbar() {
  const router = useRouter()
  const session = useSession()
  const user = session.data?.user

  return (
    <AppBar position="static" sx={{ backgroundColor: "grey" }}>
      <Box component="nav">
        <Box
          component="ul"
          display="flex"
          m={0}
          p={0}
          overflow="hidden"
          sx={{ listStyleType: "none" }}
        >
          <Box
            component="li"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            px={2}
            borderRight="solid 1px #bbb"
            sx={{
              backgroundColor: router.pathname === "/" ? "primary.main" : "grey",
            }}
          >
            <Link href="/" style={{ textDecoration: "none" }}>
              <Typography variant="h5" m={0} color="#fff">
                creativity tracker
              </Typography>
            </Link>
          </Box>
          <Box ml="auto" display="flex">
            <Box
              component="li"
              p={2}
              borderLeft="solid 1px #bbb"
              sx={{
                backgroundColor:
                  router.pathname === "/track" ? "primary.main" : "grey",
              }}
            >
              <Link href="/track" style={{ textDecoration: "none" }}>
                <Typography color="#fff">track</Typography>
              </Link>
            </Box>
            {session.status === "authenticated" && user?.id && user?.token && (
              <Box
                component="li"
                p={1}
                borderLeft="solid 1px #bbb"
                sx={{
                  backgroundColor: "grey",
                }}
              >
                <AvatarMenu />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </AppBar>
  )
}
