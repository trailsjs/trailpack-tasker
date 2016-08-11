'use strict'

const assert = require('assert')
const rabbit = require('rabbot')

describe('Trailpack', () => {
  let pack

  before(() => {
    pack = global.app.packs.tasker
  })

  after(function() {
    this.timeout(10000)
    // need a slight delay here to let rabbot finish batch acks
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(rabbit.shutdown())
      }, 2000)
    })
  })

  beforeEach(() => {
    global.app.callCount = 0
    global.app.finalizeCount = 0
    global.app.interruptCount = 0
    global.app.testValue = undefined
  })

  it('should be loaded into the app.packs collection', () => {
    assert(pack)
  })

  it('should allow for publishing', done => {
    const testValue = 12378123
    global.app.tasker.publish('TestTask', { testValue })
    setTimeout(() => {
      assert.equal(global.app.callCount, 1)
      assert.equal(global.app.finalizeCount, 1)
      assert.equal(global.app.testValue, testValue)
      done()
    }, 10)
  })

  it('should only listen to tasks in its own profile', done => {
    const testValue = 3451324
    // OtherTestTask is in a different profile
    global.app.tasker.publish('OtherTestTask', { testValue })
    setTimeout(() => {
      assert.equal(global.app.callCount, 0)
      done()
    }, 10)
  })

  it('should listen to multiple tasks in its own profile', done => {
    const testValue = 893495872394
    global.app.tasker.publish('TestTask2', { testValue })
    setTimeout(() => {
      assert.equal(global.app.callCount, 1)
      assert.equal(global.app.testValue, testValue)
      done()
    }, 10)
  })

  it('should return a publish id, to be used for cancelling', () => {
    const testValue = 893495872394
    return global.app.tasker.publish('TestTask2', { testValue })
      .then(data => {
        global.app.log.info(data)
      })
  })

  it('should emit a cancel event', done => {
    const task = 'TestTask3'
    global.app.tasker.publish(task, {})
      .then(taskId => {
        setTimeout(() => {
          return global.app.tasker.cancelTask(task, taskId)
            .then(() => {
              setTimeout(() => {
                assert.equal(global.app.interruptCount, 1)
                done()
              }, 500)
            })
        }, 100)
      })
  })

  it('should call finalize even if an error is thrown in run', done => {
    const task = 'ErrorTestTask'
    const testValue = 9362381
    global.app.tasker.publish(task, { testValue })
    setTimeout(() => {
      assert.equal(global.app.callCount, 1)
      assert.equal(global.app.finalizeCount, 1)
      assert.equal(global.app.testValue, testValue)
      done()
    }, 100)
  })

  it('should send a single acknowledgement, even if .ack is called more than once', done => {
    const task = 'MultiAckTest'
    const testValue = 4313451
    global.app.tasker.publish(task, { testValue })
    setTimeout(() => {
      assert.equal(global.app.callCount, 1)
      assert.equal(global.app.finalizeCount, 1)
      done()
    }, 100)
  })
})
