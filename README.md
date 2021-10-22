<p align="center">
  <a href="https://github.com/Milkywire/slack-pr-actions/actions"><img alt="typescript-action status" src="https://github.com/Milkywire/slack-pr-actions/workflows/build-test/badge.svg"></a>
</p>

# Slack PR sync github action

Publish PRs as a message to a slack channel updates the message with emojis representing the PR status.

The message format used is

```
repositoryName #pullRequestNumber title
```

and links to the PR in Github

## Environment variables

### `SLACK_BOT_TOKEN`

**Required** A bot token for the app from Slack

The token needs the following scopes:

1. `channels:history`
2. `channels:read`
3. `chat:write`
4. `reactions:read`
5. `reactions:write`

### `SLACK_SIGNING_SECRET`

**Required** The signing secret for the app from Slack

## Inputs

### `slack-channel-id`

The channel id for the Slack channel that the bot should post to. The must have access to the channel. If missing the action will post the message to all channels that the bot is a member of.

## Example usage

```yaml
uses: milkywire/slack-pr-actions
  env:
    SLACK_SIGNING_SECRET: ${{ secrets.SLACK_SIGNING_SECRET }}
    SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
  with:
    slack-channel-id: C02B6809Z43
```
