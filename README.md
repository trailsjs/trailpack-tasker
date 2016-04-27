# trailpack-tasker

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

Easily set up background workers with [RabbitMQ](https://www.rabbitmq.com/) and [Trails](http://trailsjs.io).

## Install

```sh
$ npm install --save trailpack-tasker
```

## Configure

### Add Trailpack

```js
// config/main.js
module.exports = {
  packs: [
    // ... other trailpacks
    require('trailpack-tasker')
  ]
}
```

### Configure Tasker Settings

```js
// config/tasker.js
module.exports = {

  /**
   * Define worker profiles. Each worker of a given type listens for the
   * "tasks" defined in its profile below. The task names represent a Task
   * defined in api.services.tasks
   */
  profiles: {
    memoryBound: {
      tasks: [ 'hiMemoryTask1' ]
    },
    cpuBound: {
      tasks: [ 'VideoEncoder', 'hiCpuTask2' ]
    }
  },

  /**
   * Set RabbitMQ connection info
   */
  rabbitmq: {
    exchange: process.env.TASKER_EXCHANGE,
    host: 'localhost',
    port: 5672,
    username: 'guest',
    password: 'guest',
    ssl: true
  },

  /**
   * Set worker to subscribe to tasks in the matching profile (tasker.profiles).
   * If false, the application will not subscribe to any tasks.
   */
  worker: process.env.WORKER || false
}
```

### Configure `worker` Environment

```js
// config/env/worker.js
module.exports = {
  main: {

    /**
     * Only load the packs needed by the workers
     */
    packs: [
      require('trailpack-core'),
      require('trailpack-tasker')
    ]
  }
}
```

If the worker profiles each require more granular environment configurations,
create `worker-cpuBound`, `worker-memoryBound`, etc. environments.

## Usage

Define tasks in `api.services.tasks`. Each task is run in a separate process.

```js
// api/services/tasks/VideoEncoder.js

const Task = require('trailpack-tasker').Task
module.exports = class VideoEncoder extends Task {

  /**
   * "payload" is the message from RabbitMQ, and contains all the information
   * the worker needs to do its job. By default, sets this.payload and this.app.
   *
   * @param payload.videoFormat
   * @param payload.videoBuffer
   */
  constructor (app, payload) {
    super(app, payload)
  }

  /**
   * Do work here. When the work is finished (the Promise is resolved), send
   * "ack" to the worker queue. You must override this method.
   *
   * @return Promise
   */
  run () {
    return doWork(this.payload)
  }

  /**
   * This is a listener which is invoked when the worker is interrupted (specifically,
   * an interrupt is a particular type of message that instructs this worker to
   * stop).
   */
  interrupt () {
    this.log.warn('only encoded', this.currentIndex, 'out of', this.totalItems, 'frames')
  }

  /**
   * Perform any necessary cleanup, close connections, etc. This method will be
   * invoked regardless of whether the worker completed successfully or not.
   * @return Promise
   */
  finalize () {
    return doCleanup(this.payload)
  }
}
```

## Deployment

An example [Procfile](https://devcenter.heroku.com/articles/procfile) may look like:

```
web: npm start
memoryBound: NODE_ENV=worker WORKER=memoryBound npm start
cpuBound: NODE_ENV=worker WORKER=cpuBound npm start
```

## License
MIT

## Maintained By
[<img src='http://i.imgur.com/Y03Jgmf.png' height='64px'>](https://langa.io)

[npm-image]: https://img.shields.io/npm/v/trailpack-tasker.svg?style=flat-square
[npm-url]: https://npmjs.org/package/trailpack-tasker
[ci-image]: https://img.shields.io/travis/langateam/trailpack-tasker/master.svg?style=flat-square
[ci-url]: https://travis-ci.org/langateam/trailpack-tasker
[daviddm-image]: http://img.shields.io/david/langateam/trailpack-tasker.svg?style=flat-square
[daviddm-url]: https://david-dm.org/langateam/trailpack-tasker
[codeclimate-image]: https://img.shields.io/codeclimate/github/langateam/trailpack-tasker.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/langateam/trailpack-tasker

