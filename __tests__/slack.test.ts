import {
  approvePR,
  postPullRequestMessage,
  mergePR,
  changeRequestPR,
  commentPR
} from '../src/slack'
import {expect, test, jest} from '@jest/globals'
import {App} from '@slack/bolt'

jest.mock('@slack/bolt')
console.log = jest.fn()

const slackApp = new App()
const PR_NUMBER = 1
const PR_URL = 'http://example.com/pr/1'

test('post a message to slack', async () => {
  const tmp = slackApp.client.conversations.history as any

  tmp.mockResolvedValueOnce({
    messages: [],
    has_more: false
  })
  await postPullRequestMessage('galaxy', PR_NUMBER, 'test title', PR_URL)

  expect(slackApp.client.chat.postMessage).toHaveBeenCalled()
  expect(slackApp.client.chat.postMessage).toHaveBeenCalledWith({
    channel: 'test-channel-id',
    text: `\`galaxy\` <${PR_URL}|#1 test title>`
  })
})

test('approve PR', async () => {
  await approvePR(PR_URL)
  expect(slackApp.client.reactions.add).toHaveBeenCalled()

  expect(slackApp.client.reactions.add).toHaveBeenCalledWith({
    channel: 'test-channel-id',
    timestamp: 'test-message',
    name: 'white_check_mark'
  })
})

test('merge PR', async () => {
  await mergePR(PR_URL)

  expect(slackApp.client.reactions.add).toHaveBeenCalled()

  expect(slackApp.client.reactions.add).toHaveBeenCalledWith({
    channel: 'test-channel-id',
    timestamp: 'test-message',
    name: 'merge'
  })
})

test('change request PR', async () => {
  await changeRequestPR(PR_URL)

  expect(slackApp.client.reactions.add).toHaveBeenCalled()

  expect(slackApp.client.reactions.add).toHaveBeenCalledWith({
    channel: 'test-channel-id',
    timestamp: 'test-message',
    name: 'octagonal_sign'
  })
})

test('comment PR', async () => {
  await commentPR(PR_URL)

  expect(slackApp.client.reactions.add).toHaveBeenCalled()

  expect(slackApp.client.reactions.add).toHaveBeenCalledWith({
    channel: 'test-channel-id',
    timestamp: 'test-message',
    name: 'speech_balloon'
  })
})
