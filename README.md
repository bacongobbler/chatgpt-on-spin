# OpenAI with Spin and Fermyon Cloud

This repository is a demonstration for integrating the [OpenAI API](https://platform.openai.com/docs/introduction) in
TypeScript using Spin and Fermyon Cloud.

Note: This repository uses the `gpt-4` engine to generate responses, which is in limited beta. You must have an invitation to the GPT-4 API beta to use this engine. If you don't have an invite, make sure to change the `model` in index.ts to `gpt-3.5-turbo` or something else available for your account.

See [OpenAI's model overview page](https://platform.openai.com/docs/models) to learn more about which models are available.

## Local development

- [Spin](https://developer.fermyon.com/spin)
- [the Spin JavaScript toolchain](https://developer.fermyon.com/spin/javascript-components)
- [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- a free [Fermyon Cloud](https://cloud.fermyon.com) account

Add your OpenAI [API key](https://platform.openai.com/docs/api-reference/authentication) into `settings-example.json`, then
build and deploy the application to [Fermyon Cloud](https://fermyon.com/cloud):

```console
$ cp settings-example.json settings.json
$ npm install
$ spin build
$ spin login
$ spin deploy
Uploading chatgpt version 0.2.0+r39d23bf0...
Deploying...
Waiting for application to become ready.......... ready
Available Routes:
  chatgpt: https://chatgpt-<your-url>.fermyon.app (wildcard)
```

Usage:

```console
$ curl https://chatgpt-<your-url>.fermyon.app/assistant -XPOST -d 'Which male artist has won the most Grammys?'
Georg Solti
```

```console
$ curl https://chatgpt-<your-url>.fermyon.app/roll/4d6
Results: 3, 5, 2, 6
Total: 16
```
