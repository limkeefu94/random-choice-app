# Social Privacy Plan

This document is an initial implementation plan for future friends, direct messages, friend circle, and world-channel filtering. The UI stays closed while `SOCIAL_FEATURES_ENABLED=false`.

## Current Scope

- No friends entry, friends button, direct-message UI, or friend-circle UI is exposed.
- Existing login, registration, world channel, random modes, and GCS uploads keep their current behavior.
- Account responses include safe default social settings so old accounts do not break when future UI is added.

## Feature Flag

```env
SOCIAL_FEATURES_ENABLED=false
```

The default is closed. Future frontend UI must check this flag before rendering any social entry points.

## Account Shape

Each account can reserve these non-sensitive settings:

```js
privacy: {
  discoverable: false,
  showOnlineStatus: false,
  allowFriendRequests: false,
  allowDirectMessages: "friendsOnly",
},
worldPreferences: {
  language: "zh-CN",
  region: "global",
  topics: [],
  hideLottery: false,
}
```

`allowDirectMessages` should only accept `"friendsOnly"`, `"everyone"`, or `"none"`.

## Safe Public Account

Public account payloads should use a whitelist and never expose password hashes, password salts, token secrets, service-account data, email verification state, private contacts, private friend lists, or raw provider credentials.

Allowed public fields for the current scaffold:

- `id`
- `username`
- `displayName`
- `avatar`
- `avatarUrl`
- `userId`
- `privacy`
- `worldPreferences`
- `createdAt`
- `updatedAt`

## Future Structures

### Friends

Suggested collections:

```text
randomChoiceFriendRequests/{requestId}
randomChoiceFriendEdges/{edgeId}
```

Friend request fields:

- `fromAccountId`
- `toAccountId`
- `status`: `pending | accepted | rejected | blocked`
- `createdAt`
- `updatedAt`

Friend edge fields:

- `accountId`
- `friendAccountId`
- `createdAt`

### Direct Messages

Suggested collections:

```text
randomChoiceDmThreads/{threadId}
randomChoiceDmThreads/{threadId}/messages/{messageId}
```

Thread fields:

- `participantIds`
- `lastMessageAt`
- `createdAt`
- `updatedAt`

Message fields:

- `senderAccountId`
- `text`
- `attachment`
- `createdAt`

Direct-message writes must check `privacy.allowDirectMessages` and friend status before accepting messages.

### Friend Circle

Suggested collections:

```text
randomChoiceCirclePosts/{postId}
randomChoiceCirclePosts/{postId}/comments/{commentId}
```

Post fields:

- `accountId`
- `visibility`: `friendsOnly | public | private`
- `text`
- `attachment`
- `createdAt`
- `updatedAt`

Friend-circle reads must filter by relationship and visibility.

### World Channel Filters

Future world-channel reads can use `worldPreferences`:

- `language`: default channel language.
- `region`: preferred region for local channels.
- `topics`: selected topics such as food, travel, shopping, coding, pets, or daily chat.
- `hideLottery`: hides entertainment-number related posts from the world-channel feed.

These preferences should only filter what the user sees. They should not change the existing public world-channel message storage without a separate migration plan.

## Migration Notes

- Old accounts may not have `privacy` or `worldPreferences`.
- Account helpers must normalize missing fields to safe defaults on read.
- Future UI should write only validated settings and must keep feature-gated entry points hidden until the full product flow is ready.
