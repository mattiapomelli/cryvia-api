import express, { Express } from 'express'
import dotenv from 'dotenv'
import glob from 'glob'

import controllers from './utils/controllers'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 8000

app.use(express.json())

controllers.init(app)

const files = glob.sync('src/controllers/**/*.ts')

for (const filePath of files) {
  const path = '.' + filePath.replace('src', '').split('.')[0]
  import(path)
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
