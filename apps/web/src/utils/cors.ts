import type { NextApiHandler } from 'next'

type Method = 'GET' | 'POST' | 'HEAD'

export const withCors = (allowedMethods: Method[]) => {
  return (handler: NextApiHandler): NextApiHandler => {
    return async (req, res) => {
      const allowedMethodsWithOptions: string[] = [...allowedMethods, 'OPTIONS']
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', allowedMethodsWithOptions.join(', '))
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

      if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
      }

      if (!req.method || !allowedMethodsWithOptions.includes(req.method)) {
        res.status(405).end()
        return
      }

      return handler(req, res)
    }
  }
}
