const Config = module.exports
const joi = require('joi')

Config.schema = joi.object().keys({
  profiles: joi.object(),
  connection: joi.object().keys({
    user: joi.string(),
    pass: joi.string(),
    server: joi.array(),
    port: joi.number(),
    vhost: '%2f'
  })
}).unknown()

Config.defaults = {
  profiles: {},
  connection: {
    server: ['localhost'],
    user: 'guest',
    pass: 'guest',
    port: 5672,
    vhost: '%2f'
  },
  worker: false
}
