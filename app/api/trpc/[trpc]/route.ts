import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { env } from '~/lib/config/env'
import { appRouter } from '~/server/api/root'
import { createTRPCContextAppRouter } from '~/server/api/trpc'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: async () => await createTRPCContextAppRouter({ headers: req.headers }),
    onError:
      env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
            )
          }
        : undefined,
  })

export { handler as GET, handler as POST }
