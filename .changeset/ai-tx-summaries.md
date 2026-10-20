---
'@buildeross/ui': patch
'@buildeross/hooks': patch
---

Only show AI transaction summaries to signed-in (SIWE) users, send the call's ETH value to the summary API, and replace raw summary errors with friendly messages (hidden entirely when the user is signed out or no AI provider is configured).
