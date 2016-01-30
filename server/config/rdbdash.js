import rethinkdbdash from 'rethinkdbdash'
import config from '../config/'

const r = rethinkdbdash({
	db: config.rethinkdb.db,
	servers: [{
		host: config.rethinkdb.host,
		port: config.rethinkdb.port
	}]
});

export default r
