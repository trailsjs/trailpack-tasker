const Config = module.exports

Config.schema = joi.object().keys({
  profiles: joi.object(),
  rabbitmq: joi.object().keys({
    exchange: joi.string(),
    uri: joi.string().required()
  }),
  worker: joi.bool()
})

Config.defaults = {
  profiles: {
    all: '*',
    rabbitmq: {
      exchange: 'all',
      uri: 'amqp://localhost'
    },
    worker: false
  }
}
