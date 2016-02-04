import rethinkdbdash from 'rethinkdbdash'
import config from '../../server-config'

const rdb = rethinkdbdash({
	host: config.rethinkdb.host,
	port: config.rethinkdb.port,
	db: config.rethinkdb.db,
	authKey: config.rethinkdb.authkey,
	ssl: {
		ca: config.rethinkdb.caCert
	},
})

export default rdb
