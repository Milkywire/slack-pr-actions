import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test, jest} from '@jest/globals'

jest.mock('@slack/bolt')

// shows how the runner will run a javascript action with env / stdout protocol
test.skip('test runs', () => {
  process.env['INPUT_SLACK_-_CHANNEL_-_ID'] = 'test-channel'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  console.log(cp.execFileSync(np, [ip], options).toString())
})
