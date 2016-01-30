const config = {
  host: '127.0.0.1',
  port: process.env.PORT || 8888,
  rethinkdb: {
		host: process.env.RDB_HOST,
		port: process.env.RDB_PORT,
		db: 'cmscubed'
	}
}

export default config
