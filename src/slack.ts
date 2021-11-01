import {App} from '@slack/bolt'
import type {WebAPIPlatformError} from '@slack/web-api'
import dotenv from 'dotenv'

dotenv.config()

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
})

let slackChannelId: string
export function setSlackChannel(channelId: string): void {
  slackChannelId = channelId
}

export async function postPullRequestMessage(
  repositoryName: string,
  pullRequestNumber: number,
  title: string,
  pullRequestUrl?: string,
  avatarUrl?: string
): Promise<void> {
  const channels = await getChannels()
  for (const channel of channels) {
    if (!channel.id) {
      continue
    }

    const message = await findPRMessage(channel.id, pullRequestUrl, true)

    if (message) {
      // eslint-disable-next-line no-console
      console.log(
        `channel ${channel.name} already have a message for PR ${repositoryName} #${pullRequestNumber}`
      )
      continue
    }

    const text = `\`${repositoryName}\` <${pullRequestUrl}|#${pullRequestNumber} ${title}>`
    // eslint-disable-next-line no-console
    console.log(`post ${text} to ${channel.name} `)
    await app.client.chat.postMessage({
      channel: channel.id,
      text,
      icon_url: avatarUrl
    })
  }
}

export async function approvePR(
  pullRequestUrl: string | undefined,
  emojiName = 'white_check_mark'
): Promise<void> {
  await addReactionToPullRequestMessage(pullRequestUrl, emojiName)
}

export async function changeRequestPR(
  pullRequestUrl: string | undefined,
  emojiName = 'octagonal_sign'
): Promise<void> {
  await addReactionToPullRequestMessage(pullRequestUrl, emojiName)
}

export async function commentPR(
  pullRequestUrl: string | undefined,
  emojiName = 'speech_balloon'
): Promise<void> {
  await addReactionToPullRequestMessage(pullRequestUrl, emojiName)
}

export async function mergePR(
  pullRequestUrl: string | undefined,
  emojiName = 'merge'
): Promise<void> {
  await addReactionToPullRequestMessage(pullRequestUrl, emojiName)
}

export async function addReactionToPullRequestMessage(
  pullRequestUrl: string | undefined,
  emojiName: string
): Promise<void> {
  const channels = await getChannels()
  for (const channel of channels) {
    if (!channel.id) {
      continue
    }
    const message = await findPRMessage(channel.id, pullRequestUrl)

    if (!message) {
      continue
    }

    const hasReaction =
      message.reactions?.some(reaction => reaction.name === emojiName) ?? false
    if (hasReaction) {
      continue
    }
    try {
      // eslint-disable-next-line no-console
      console.log(`add emoji ${emojiName} to ${message?.text}`)
      await app.client.reactions.add({
        channel: channel.id,
        name: emojiName,
        timestamp: message.ts
      })
    } catch (error) {
      const slackError = error as WebAPIPlatformError
      if (slackError.data.error === 'invalid_name') {
        // eslint-disable-next-line no-console
        console.log(`no emoji found with name ${emojiName}`)
      } else if (slackError.data.error !== 'already_reacted') {
        throw error
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function getChannels() {
  if (slackChannelId) {
    const response = await app.client.conversations.info({
      channel: slackChannelId
    })
    if (response.channel?.is_member) {
      return [response.channel]
    } else {
      return []
    }
  }

  const response = await app.client.conversations.list()
  const channels = response.channels?.filter(channel => channel.is_member) ?? []

  return channels
}

/**
 * Find message in the given channel based on the pull request url
 * @param channelId Slack channel Id
 * @param pullRequestUrl The url to the PR in GitHub
 * @param skipPagination Disabled pagination of response to speed up response
 * @returns Slack message or undefined
 */

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function findPRMessage(
  channelId: string,
  pullRequestUrl?: string,
  skipPagination = false
) {
  let done = false
  let cursor: string | undefined = undefined
  if (!pullRequestUrl) {
    // eslint-disable-next-line no-console
    console.log('findPRMessage missing pull request url')
    return
  }

  while (!done) {
    const response = await app.client.conversations.history({
      channel: channelId,
      limit: 100,
      cursor
    })
    const {messages, response_metadata} = response
    let {has_more} = response

    if (skipPagination) {
      has_more = false
    }

    const message = messages?.find(({text}) => text?.includes(pullRequestUrl))

    if (has_more && response_metadata) {
      cursor = response_metadata.next_cursor
    }

    done = !!message || !has_more
    return message
  }
}
