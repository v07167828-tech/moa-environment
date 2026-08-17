# My Own Assistant

BUILD MOA — MY OWN ASSISTANT



IMPORTANT:



You are not building a generic AI chatbot.



You are building a complete product prototype called:



MOA

MY OWN ASSISTANT



MOA is intended to become a lifelong, modular, extensible personal AI assistant.



The purpose of this generation is to create a highly complete working prototype so we can visually and functionally inspect what the finished MOA could look like, identify architectural/UI problems, and then progressively connect real infrastructure.



DO NOT make MOA look like a clone of ChatGPT.



DO NOT reduce MOA to a single chat page.



MOA should feel like an actual personal operating environment with an AI assistant at its centre.



==================================================

CORE PRODUCT VISION

==================================================



MOA should combine:



- conversational AI

- persistent memory

- personal knowledge

- reasoning

- planning

- tools

- skills

- web access

- maps

- voice

- files

- multimodal interaction

- communications

- email

- phone/number tools

- coding

- application building

- personalization

- permissions

- connected services

- future device control



The architecture must be modular.



MOA must be able to gain new capabilities through Skills/Tools/Plugins without requiring the entire application to be rewritten.



The long-term architecture is:



MOA

│

├── Conversation

├── Memory

├── Knowledge

├── Reasoning

├── Planner

├── Skills

│   ├── Web

│   ├── Maps

│   ├── Voice

│   ├── Files

│   ├── Email

│   ├── Numbers

│   ├── Communications

│   ├── Code

│   └── ...

│

├── Builder

├── Model Router

├── Permissions

└── Device / Platform Layer



==================================================

DESIGN PHILOSOPHY

==================================================



MOA should feel:



- intelligent

- minimal

- futuristic

- personal

- calm

- responsive

- powerful

- configurable



Do not overcrowd the interface.



The central MOA presence should remain visually important.



The interface should work beautifully on:



- mobile

- tablet

- desktop



Prioritize mobile because MOA is intended to be heavily used from a phone.



Use a modern premium interface.



Avoid unnecessary gradients, excessive cards, excessive borders, and generic SaaS-dashboard styling.



Use subtle animation and depth.



==================================================

MOA CENTRAL IDENTITY

==================================================



MOA needs a persistent visual identity.



DEFAULT STATE:



MOA is represented by an animated ORB.



Before the user uploads an image, the orb is the MOA avatar.



The orb should be visually sophisticated and responsive.



It should support states:



- idle

- listening

- thinking

- speaking

- error

- offline



Each state should have a distinct subtle animation.



The user must be able to replace the orb with their own MOA picture.



==================================================

MOA IDENTITY SETTINGS

==================================================



Create:



Settings

→ Appearance

→ MOA Identity



Allow:



- Default Orb

- Upload MOA Picture

- Replace Picture

- Remove Picture

- Return to Orb

- Preview

- crop

- reposition

- choose display shape



MOA image and user profile image are NOT the same thing.



USER IDENTITY:



- name

- profile picture

- account information



MOA IDENTITY:



- orb

- MOA picture

- MOA visual states



MOA identity must be stored per user.



One user's MOA identity must never appear for another user.



==================================================

BACKGROUND / APPEARANCE SYSTEM

==================================================



The user must have complete control over the application background.



Allow:



1. Solid colour

2. Gradient

3. Image / wallpaper



SOLID COLOUR:



- colour picker

- custom colour



GRADIENT:



- multiple colours

- direction



IMAGE / WALLPAPER:



- upload

- preview

- crop

- reposition

- cover

- contain

- opacity

- blur



Appearance must persist.



Add presets:



- Default

- Midnight

- Aurora

- Minimal

- Glass

- Custom



Also support:



- light mode

- dark mode

- system mode

- transparency

- chat density

- font size

- message appearance

- animation on/off

- glow effects

- reduced motion



The interface must update immediately when appearance settings change.



==================================================

HOME / MAIN MOA EXPERIENCE

==================================================



The main screen should feel like MOA's home.



Possible structure:



TOP:

- MOA status

- profile

- settings

- notifications



CENTER:

- MOA orb/avatar

- greeting

- contextual information

- active state



BOTTOM:

- chat input

- microphone

- attachment

- tools/skills

- send



The user should be able to enter a conversation immediately.



Do not make the dashboard feel more important than MOA itself.



==================================================

CHAT

==================================================



Build a complete chat experience.



Support:



- new conversation

- conversation history

- send messages

- multiline input

- drafts

- timestamps

- copy response

- code blocks

- copy code

- edit message

- delete message

- regenerate response

- attachments

- microphone

- voice interaction

- tool invocation indicators

- thinking state

- streaming response state



The interface should clearly distinguish:



USER MESSAGE



MOA RESPONSE



TOOL ACTION



SYSTEM STATUS



==================================================

CONVERSATIONS

==================================================



Create a conversation drawer/sidebar.



Support:



- new conversation

- search

- rename

- pin

- delete

- recent conversations

- open conversation

- conversation timestamps



Organize conversations cleanly.



==================================================

MEMORY

==================================================



Memory is a core MOA feature.



MOA should not treat every conversation as permanent memory.



Create a dedicated Memory section.



Support:



- create memory

- edit memory

- delete memory

- search memory

- categories

- tags

- importance

- pinned memory

- automatic memory architecture

- memory approval/control

- memory export

- memory deletion



Display memory in a way the user can understand.



The user must remain in control of what MOA remembers.



Include controls such as:



- Remember

- Don't remember

- Delete memory

- Forget everything



==================================================

KNOWLEDGE

==================================================



Knowledge is separate from Memory.



MEMORY:

Information about the user and interaction history.



KNOWLEDGE:

Information MOA knows or retrieves from sources.



Create a Knowledge section.



Support:



- knowledge sources

- source list

- import

- search

- source details

- source deletion

- future retrieval



Potential sources:



- uploaded documents

- PDFs

- notes

- websites

- other user-provided information



==================================================

FILES

==================================================



Create a Files area.



Support UI for:



- upload

- file list

- preview

- delete

- images

- PDFs

- documents

- spreadsheets

- attachments

- search

- processing status



Display states:



- uploading

- processing

- ready

- failed

- unavailable



Do not fake file analysis.



If an integration isn't configured, show that it is unavailable.



==================================================

MULTIMODAL INPUT

==================================================



MOA should be designed for:



- text

- images

- PDFs

- documents

- spreadsheets

- video

- voice



The attachment system should identify the type of content.



Each attachment should show:



- type

- filename

- size

- processing status

- remove option



==================================================

PERSONALITY

==================================================



Create:



Settings

→ Personality



Allow the user to configure:



- personality notes

- behaviour preferences

- response preferences

- tone

- verbosity

- communication style



The system should make it clear that these settings affect MOA's behaviour.



==================================================

WEB / INTERNET

==================================================



Create a Web skill.



UI:



- search

- search results

- open result

- sources

- browsing state

- errors

- unavailable state



When no real search provider is configured, clearly display:



WEB SEARCH NOT CONFIGURED



Never fabricate search results.



==================================================

MAPS / NAVIGATION

==================================================



Create a Maps skill.



Support UI for:



- map

- place search

- current location

- directions

- routes

- navigation assistant

- location permission

- provider configuration



If unavailable:



MAPS NOT CONFIGURED



Do not fake maps or routes.



==================================================

VOICE

==================================================



Create a Voice skill.



States:



- microphone ready

- listening

- processing

- speaking

- stopped

- permission denied

- unavailable



Controls:



- microphone

- stop

- voice settings

- speech settings



Prepare architecture for:



- speech-to-text

- text-to-speech



Do not fake voice functionality if no real provider exists.



==================================================

COMMUNICATIONS

==================================================



Create a Communications skill.



Possible connected capabilities:



- email

- messaging

- phone/number tools

- communication accounts



Every connected service must require explicit authorization.



==================================================

NUMBER MANAGEMENT

==================================================



Create a Number Management skill.



Long-term capabilities:



- add number

- manage numbers

- virtual/web numbers

- legitimate international/foreign number providers

- SMS receiving workflows

- provider connection

- number status



Do not fabricate numbers.



Do not fabricate SMS.



Do not bypass provider verification, CAPTCHA, identity verification, or anti-abuse systems.



The UI should make the provider connection state obvious.



==================================================

NUMBER IDENTIFICATION

==================================================



Create Number Identification.



Support UI for:



- manual number lookup

- caller lookup where supported

- caller identity

- spam/scam context

- trust/block context

- lookup history



==================================================

EMAIL

==================================================



Create an Email skill.



UI:



- inbox

- search

- read

- compose

- reply

- forward

- send

- drafts

- attachments

- connected accounts



Require explicit account authorization.



==================================================

ACCOUNT MANAGEMENT

==================================================



Create a Connected Accounts section.



Display:



- connected account

- provider

- permissions

- status

- disconnect

- reconnect

- authorization



Allow legitimate account creation assistance.



Do not bypass:



- CAPTCHA

- phone verification

- identity verification

- provider security

- anti-abuse systems



==================================================

SKILLS SYSTEM

==================================================



Create a Skills page.



Initial skills:



- Chat

- Memory

- Knowledge

- Web

- Maps

- Builder

- Files

- Voice

- Numbers

- Communications

- Email

- Code

- Planner



Each skill should have:



- icon

- name

- description

- enabled/disabled

- status

- permissions

- configuration



Use status labels:



IMPLEMENTED

CONFIGURED

NOT CONFIGURED

UNAVAILABLE

PLANNED



Never make unavailable functionality appear operational.



==================================================

PERMISSIONS

==================================================



Create a unified Permissions section.



Examples:



Web

→ internet access



Maps

→ location



Voice

→ microphone



Email

→ email account



Files

→ file access



Numbers

→ provider account



Builder

→ project files



Permissions must be explicit and user-controlled.



==================================================

PLANNER

==================================================



Create a Planner system.



The intended flow:



Goal

↓

Understand

↓

Plan

↓

Select tools

↓

Execute

↓

Inspect result

↓

Correct

↓

Respond



Planner should display:



- goal

- plan

- current step

- completed steps

- failed steps

- tools being used

- results

- retry

- correction state



Make this visually understandable.



==================================================

MODEL ROUTER

==================================================



Prepare the architecture for multiple AI models.



Potential model types:



- general chat

- reasoning

- coding

- vision

- local/offline



Conceptual routing:



Task

↓

classification

↓

model selection

↓

execution

↓

result



Create a Model settings page.



Show:



- current model

- model type

- availability

- configuration

- future automatic routing



Do not claim automatic routing works unless implemented.



==================================================

CODE SKILL

==================================================



Create a Code section.



Support UI for:



- code generation

- explanation

- editing

- debugging

- project files

- execution status



Prepare integration with Builder.



==================================================

MOA BUILDER

==================================================



THIS IS ONE OF THE MOST IMPORTANT MOA FEATURES.



Create a full Builder workspace.



MOA Builder is intended to allow MOA to help create software.



Builder roadmap:



V0:

- code generation

- UI generation

- documentation

- bug fixing



V1:

- module creation

- tests

- API connections

- plugins



V2:

- task decomposition

- architecture planning

- multi-model coordination

- self-review



V3:

- complete feature implementation

- database migrations

- testing

- approval workflow



V4:

- complete application construction



==================================================

BUILDER UI

==================================================



Create:



- Builder home

- create project

- project name

- description

- requirements input

- technology selection

- project history

- task list

- task status

- generated files

- file tree

- code viewer/editor

- preview

- build status

- logs

- errors

- testing

- approval/review

- export/download



The Builder must look like a genuine development workspace.



Do not create one button called "Build App" and consider the feature complete.



==================================================

BUILDER WORKFLOW

==================================================



Conceptually:



User requirement

↓

Understand requirements

↓

Decompose task

↓

Architecture

↓

Generate files

↓

Implement

↓

Test

↓

Detect errors

↓

Correct

↓

Review

↓

User approval

↓

Export/deploy



Show this process visually.



==================================================

BUILDER PROJECTS

==================================================



Each Builder project should have:



- project name

- description

- status

- technology

- created date

- updated date

- files

- tasks

- build status

- test status



Allow project history.



==================================================

BUILDER APPROVAL

==================================================



MOA must not silently modify production projects.



Create:



- proposed change

- explanation

- affected files

- generated diff

- tests

- approve

- reject

- deployment status



==================================================

KODULAR / MOBILE APP BUILDER

==================================================



Prepare Builder for future mobile application construction.



Architecture should support:



- screen creation

- component creation

- layouts

- logic/block generation

- project structure

- project files

- screenshot understanding

- UI reconstruction



Do not claim direct Kodular control unless a real integration exists.



==================================================

BUILDER + PLANNER

==================================================



Connect Planner and Builder conceptually.



Example:



User:

"Create an inventory application."



MOA:



Goal

↓

Planner

↓

Requirements

↓

Architecture

↓

Builder

↓

Files

↓

Tests

↓

Review

↓

Approval

↓

Export



==================================================

SELF-REVIEW

==================================================



Prepare architecture for:



- code review

- architecture review

- error detection

- test generation

- regression checking

- requirement verification



Every generated project should eventually be inspectable before approval.



==================================================

MOA DASHBOARD

==================================================



Create a central dashboard.



Show:



- MOA status

- active model

- memory status

- knowledge status

- connected services

- enabled skills

- available tools

- recent conversations

- recent files

- Builder projects

- system status

- service status



The dashboard should feel like the control centre of MOA.



==================================================

OFFLINE MOA

==================================================



Prepare an offline architecture.



The offline core should eventually retain:



- MOA identity

- local settings

- local memory/cache

- selected knowledge

- basic interface

- offline status

- local model capability where available



Cloud features should extend MOA rather than define its entire identity.



==================================================

DEVICE / COMPUTER CONTROL

==================================================



Create an architecture placeholder for future device/computer control.



UI:



- connected devices

- permissions

- device status

- available actions

- execution status

- connection management



Do not pretend device control is available without an actual integration.



==================================================

SELF-IMPROVEMENT

==================================================



Prepare architecture for future:



- capability discovery

- error detection

- self-review

- tool selection

- skill creation

- plugin creation

- Builder-assisted development

- skill updates



MOA must NOT autonomously alter production code without approval.



Create UI for:



- proposed improvement

- reason

- files affected

- tests

- approval

- implementation

- verification

- deployment



==================================================

MOA ECOSYSTEM

==================================================



Keep the architecture extensible for:



- web

- Android

- desktop

- future devices



The backend/API should remain reusable.



Do not hard-code MOA to one webpage.



==================================================

MEMORY / KNOWLEDGE / CONVERSATION / TOOLS / SKILLS

==================================================



Maintain these distinctions:



MEMORY

→ information about the user and interaction history.



KNOWLEDGE

→ information MOA knows or retrieves.



CONVERSATION

→ current interaction.



TOOLS

→ capabilities MOA can execute.



SKILLS

→ organized groups of tools/capabilities.



BUILDER

→ system that can construct new capabilities/projects.



Do not collapse these into one concept.



================================================

USER DATA ISOLATION

==================================================



All of the following must be user-specific:



- conversations

- memories

- files

- settings

- MOA identity

- appearance

- Builder projects

- connected services



One user must never see another user's private data.



==================================================

SECURITY

==================================================



Never expose:



- service-role keys

- private API keys

- secret credentials



to the frontend.



Use environment variables and secure server-side access.



==================================================

TECHNICAL DIRECTION

==================================================



Use a modern maintainable architecture.



Preferred direction:



Frontend:

- React

- TypeScript

- responsive design



Backend:

- secure API layer



Database/auth/storage:

- Supabase where appropriate



Use reusable components.



Keep business logic separate from UI.



Keep skills modular.



Keep provider integrations replaceable.



==============================SUPABASE

==================================================



Prepare database architecture for:



- users

- profiles

- conversations

- messages

- memories

- knowledge sources

- files

- settings

- MOA identities

- appearances

- skills

- permissions

- connected services

- Builder projects

- Builder tasks



Use proper user-level security.



Do not expose service-role credentials.



==================================================

DEMO / PROTOTYPE MODE

==================================================



THIS IS A TEST GENERATION.



The purpose is to see what the complete MOA could look and feel like.



Therefore:



Build as much of the UI and interaction model as possible.



For capabilities requiring external infrastructure:



- create the real interface

- create proper API/service boundaries

- create loading states

- create error states

- create unavailable states

- create configuration screens



But DO NOT fabricate successful API responses.



If something cannot actually function in this environment, label it:



NOT CONFIGURED

or

UNAVAILABLE



instead of pretending it works.



For purely visual interactions, use realistic local/demo data where clearly identified as demo data.



==================================================

STATUS SYSTEM

==================================================



Every advanced feature should communicate its state.



Use:



IMPLEMENTED

CONFIGURED

NOT CONFIGURED

UNAVAILABLE

PLANNED



Example:



WEB

Status: NOT CONFIGURED



MAPS

Status: NOT CONFIGURED



VOICE

Status: NOT CONFIGURED



BUILDER

Status: PROTOTYPE



CHAT

Status: IMPLEMENTED



==================================================

RESPONSIVE DESIGN

==================================================



The application must work on:



- phone

- tablet

- desktop



On mobile:



- navigation should collapse intelligently

- sidebar should become a drawer

- chat input should remain usable

- MOA avatar should remain prominent

- settings should remain easy to navigate

- Builder should remain usable

- cards should not overflow

- buttons must be touch-friendly



==================================================

ACCESSIBILITY

==================================================



Include:



- keyboard navigation

- accessible labels

- readable contrast

- focus states

- reduced motion

- screen-reader-friendly controls



==================================================

ANIMATION

==================================================



Use subtle meaningful animation.



Especially for:



- MOA orb

- thinking

- listening

- speaking

- page transitions

- skill activation

- tool execution

- Builder generation

- status changes



Do not over-animate the interface.



==================================================

ERROR HANDLING

==================================================



Create clear states for:



- network failure

- authentication failure

- provider unavailable

- API failure

- file failure

- permission denied

- tool failure

- Builder failure

- model unavailable



Never silently fail.



==================================================

FINAL PRODUCT FEEL

==================================================



When I open MOA, it should feel like:



"This is my personal AI environment."



Not:



"This is another ChatGPT clone."



The central relationship is:



USER

↕

MOA

↕

MEMORY / KNOWLEDGE / TOOLS / SKILLS / BUILDER



==================================================

DO NOT

==================================================



DO NOT:



- build only a chat page

- create fake API responses

- create fake maps

- create fake SMS

- create fake phone numbers

- pretend unavailable integrations work

- hard-code one user's MOA image

- hard-code one background

- expose private credentials

- merge all features into one giant component

- delete existing useful architecture

- make unavailable features look implemented

- silently modify user projects through Builder



==================================================

DELIVERABLE

==================================================



Generate the most complete working MOA prototype possible.



Create the actual pages, components, navigation, settings, database architecture, API boundaries, states, and interactions.



The prototype should allow us to navigate through the entire conceptual MOA product and understand what the finished system would look like.



After generation, provide a clear implementation report containing:



1. What is actually implemented.

2. What is prototype-only.

3. What requires external APIs.

4. What requires additional infrastructure.

5. What remains unimplemented.

6. Any architectural problems discovered.

7. Any UI problems discovered.

8. Any database/security issues discovered.

9. Recommended next development steps.



MOST IMPORTANT:



Do not optimize for pretending that MOA is complete.



Optimize for giving us the most accurate, honest, comprehensive representation of the MOA we have designed.



Build the prototype now.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d5bf523f-004c-4426-91cf-a812dae4b94c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
