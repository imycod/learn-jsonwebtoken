module.exports = {
    development: {
        databases: {
            database: 'spider_search_proxy',
            username: 'root',
            password: 'mWXS19971222',
            host: '127.0.0.1',
            port: 3306,
            dialect: 'mysql',
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            timezone: '+8:00',
            dialectOptions: {
                useUTC: false
            }
        }
    },
}
