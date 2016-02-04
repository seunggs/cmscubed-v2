import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()

const config = {
  host: '127.0.0.1',
  port: process.env.PORT || 8888,
  rethinkdb: {
		host: process.env.RDB_HOST,
		port: process.env.RDB_PORT,
    authkey: process.env.RDB_AUTHKEY,
		db: 'cmscubed',
    caCert: [fs.readFileSync(path.resolve(__dirname, 'cacert'))]
	}
}

export default config
