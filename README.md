<a href="https://movflow.app" alt="MovFlow">
<!--   <img alt="MovFlow cover image" src="https://movflow.app/cover.png"> -->
  <p align="center">
  <img height="200" alt="MovFlow cover image" src="https://avatars.githubusercontent.com/u/166426138?s=400&u=4c9d80dad1e54603edcb11b1f9f0aff62095db75&v=4">
  </p>
</a>


<h1 align="center">MovFlow</h1>
<p align="center">
  Forms that Speak, Literally!
</p>
<p align="center">
  <a href="https://movflow.app"><strong>Formonce.in</strong></a>
</p>

<p align="center">
  <a href="https://github.com/movflow/movflow/stargazers">
    <img src="https://img.shields.io/github/stars/movflow/movflow??style=flat&label=movflow&logo=Github&color=2dd4bf&logoColor=fff" alt="Github" />
  </a>
  
  <a href="https://x.com/movflow">
    <img src="https://img.shields.io/twitter/follow/movflow?style=flat&label=MovFlow&logo=twitter&color=0bf&logoColor=0bf" alt="Twitter" />
  </a>
  
  <a href="https://github.com/movflow/movflow/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/movflow/movflow?label=license&logo=github&color=f80&logoColor=fff" alt="License" />
  </a>
</p>

> [!IMPORTANT]  
> MovFlow is an open-source alternative to proprietary video form solutions like videoAsk. It enables you to create interactive, video-based forms and surveys, leveraging the power of video to enhance user engagement and gather more nuanced insights.

<h3 id="toc">Table of contents</h3>

- <a href="#stack">Tech stack</a>
- <a href="#contributions">Contibutions</a>
- <a href="#gettingStarted">Getting started</a>

<h3 id="stack">📟 Tech Stack</h3>

- [T3 Stack](https://create.t3.gg/)
- [Next.js](https://nextjs.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [@shadcn/ui](https://ui.shadcn.com/)
- [Biome](https://biomejs.dev/)

---

<h2 id="contributions">😎 Contributions</h2>

- Show us support by giving us a ⭐️
- We are looking for contributors to help us in this journey.
- Every contribution you make is recognized and deeply appreciated.
- Please follow this [Contribution guideline](https://github.com/movflow/movflow/blob/main/CONTRIBUTING.md) to get started.
- Questions? Start a new [Q&A](https://github.com/MovFlow/MovFlow/discussions/new?category=q-a) in discussions or shoot us a [DM](https://x.com/movflow).

<h3 id="gettingStarted">🏁 Getting started</h3>

<h3 id="setup">Setup development environment</h3>

- <a href="#gitpod">Development environment on Gitpod</a>
- <a href="#with-docker">Development environment with Docker</a>
- <a href="#without-docker">Development environment without Docker</a>

<h4 id="gitpod">Development environment on Gitpod</h4>

- Click the button below to open this project in Gitpod.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/new/#https://github.com/movflow/movflow)

<h4 id="codeanywhere">Development environment on Codeanywhere</h4>

- Click the button below to open this project in Codeanywhere.

[![Open in Codeanywhere](https://codeanywhere.com/img/open-in-codeanywhere-btn.svg)](https://app.codeanywhere.com/#https://github.com/movflow/movflow)

---

<h4 id="with-docker">Development environment with Docker</h4>

- Coming soon.
---

<h4 id="without-docker">Development environment without Docker</h4>

> This has been tested on Mac OS. If you face any issues on Linux/Windows/WSL please create an [issue](https://github.com/MovFlow/MovFlow/issues/new)

- [Fork the repository](https://github.com/movflow/movflow/fork)

- Clone the repository

  ```bash
  git clone https://github.com/<your-github-username>/MovFlow.git
  ```

- Copy `.env.example` to `.env`

  ```bash
  cp .env.example .env
  ```

- Install latest version of node and pnpm
- Create a new postgres `database` using [NEON](https://neon.tech/)
- Update `DATABASE_URL` in `.env`
- Install dependencies

  ```bash
  pnpm install
  ```

- Migrate database

  ```bash
  pnpx prisma migrate dev
  ```

- Start development server

  ```bash
  pnpm dev
  ```

<h4 id="changes">Implement your changes</h4>

When making commits, make sure to follow the [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/) guidelines, i.e. prepending the message with `feat:`, `fix:`, `chore:`, `docs:`, etc...

```bash
git add <file> && git commit -m "feat/fix/chore/docs: commit message"
```

<h4 id="pr">Open a pull request</h4>

> When you're done

Make a commit and push your code to your github fork and make a pull-request.

Thanks for your contributions ❤️

---

<h2 id="contributors">💌 Contributors</h2>
<a href="https://github.com/movflow/movflow/graphs/contributors">
  <p>
    <img src="https://contrib.rocks/image?repo=movflow/movflow" alt="A table of avatars from the project's contributors" />
  </p>
</a>

---
