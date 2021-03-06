import * as core from '@actions/core'
import {context} from '@actions/github'

async function run(): Promise<void> {
  core.info('Starting slack sync action')
  // eslint-disable-next-line no-console
  console.log('Starting slack sync action')
  try {
    if (!process.env.SLACK_BOT_TOKEN) {
      throw new Error('Missing required environment variable SLACK_BOT_TOKEN')
    }

    if (!process.env.SLACK_SIGNING_SECRET) {
      throw new Error(
        'Missing required environment variable SLACK_SIGNING_SECRET'
      )
    }

    const {
      approvePR,
      changeRequestPR,
      commentPR,
      mergePR,
      postPullRequestMessage,
      setSlackChannel
    } = await import('./slack')

    const slackChannelId: string = core.getInput('slack-channel-id')
    setSlackChannel(slackChannelId)

    // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
    core.debug(`Posting to channel ${slackChannelId} from action input`)
    if (context.eventName === 'pull_request') {
      // eslint-disable-next-line no-console
      console.log('Sync pull request update to slack.')
      const {pull_request: pullRequest, repository} = context.payload
      if (!pullRequest) {
        return
      }

      if (pullRequest.draft) {
        // eslint-disable-next-line no-console
        console.log('Skip sync to slack because PR is a draft.')
        return
      }

      core.debug(JSON.stringify(pullRequest))
      if (pullRequest.merged) {
        // eslint-disable-next-line no-console
        console.log('PR merged sync to slack.')
        mergePR(pullRequest.html_url)
      } else {
        const {number, title} = pullRequest
        postPullRequestMessage(
          repository?.name ?? '',
          number,
          title,
          pullRequest.html_url,
          pullRequest.user.avatar_url
        )
      }
    } else if (context.eventName === 'pull_request_review') {
      const {
        pull_request: pullRequest,
        review: {state}
      } = context.payload

      // eslint-disable-next-line no-console
      console.log(`Sync pull request review to slack. State: ${state} `)

      if (!pullRequest) {
        return
      }

      const {html_url: url} = pullRequest
      if (state === 'commented') {
        commentPR(url)
      } else if (state === 'approved') {
        approvePR(url)
      } else if (state === 'changes_requested') {
        changeRequestPR(url)
      }
    } else if (context.eventName === 'issue_comment') {
      // eslint-disable-next-line no-console
      console.log('Sync pull request comment to slack ')
      const {pull_request: pullRequest} = context.payload
      if (!pullRequest) {
        return
      }
      const {html_url: url} = pullRequest
      commentPR(url)
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
