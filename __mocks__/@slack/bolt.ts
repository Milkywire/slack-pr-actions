import {jest} from '@jest/globals'
const appMock = {
  client: {
    conversations: {
      list: jest.fn().mockResolvedValue({
        channels: [
          {
            id: 'test-channel-id',
            is_member: true,
            name: 'test-channel'
          }
        ]
      } as never),
      history: jest.fn().mockResolvedValue({
        messages: [
          {
            ts: 'test-message',
            text: `\`galaxy\` <http://example.com/pr/1|#1 test title>`
          }
        ],
        has_more: false
      } as never)
    },
    chat: {
      postMessage: jest.fn().mockResolvedValue({} as never)
    },
    reactions: {
      add: jest.fn().mockResolvedValue({} as never)
    }
  }
}

const App = jest.fn().mockImplementation(() => appMock)

export {App}
