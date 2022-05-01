import express, { Express } from 'express'
import dotenv from 'dotenv'

import routes from './routes'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 8000

for (const route of routes) {
  app.use(route.path, route.router)
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
