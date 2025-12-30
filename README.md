<p align="center">
  <img src="https://andera.top/img/github.png" alt="Andera" style="max-width: 100%; height: auto;"/>
</p>

# Andera Screenshot Worker

This repository is an [Andera](https://andera.top) Worker built to allow screenshots to be taken with the help of Chrome, using [Playwright](https://playwright.dev). The Worker creates 10 slots and opens 10 Chrome tabs, assigning requests to each tab and resetting them once the screenshot has been taken.

**Andera** is a high-performance, open-source Task Orchestration Platform (TOP) designed for simplicity, flexibility, and scalability. It enables you to build, run, and manage distributed workers for any kind of task, from AI agents to automation scripts.

---

## What is Andera?

Andera is composed of three main components:
- **Load Balancer:** Routes and prioritizes tasks, manages worker clusters, and provides a dashboard for monitoring.
- **Base Worker:** A template project for building your own custom workers by adding business logic (functions, services, helpers, tags).
- **Worker Core:** The core engine, included as a dependency, that handles all non-business logic for workers.

Learn more: [Andera Documentation](https://andera.top/docs/)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (optional, for containerized deployment)

### Installation

```sh
git clone git@github.com:JulienRamel/andera-screenshot-worker.git
cd andera-screenshot-worker
cp .env.example .env
npm install
```

Edit `.env` to set your keys and configuration.

---

## Configuration

- All environment variables are documented in `.env.example`.
- For advanced configuration, see the [Base Worker Configuration Guide](https://andera.top/docs/base-worker/configuration/).

---

## Usage

### Manual setup

#### Run the application

```sh
npm run dev
```

#### Build & Run in Production

```sh
npm run build
npm start
```

### Docker setup

#### Create a Docker network for Andera

```sh
docker network create andera-net
```

#### Build the Docker image

```sh
docker-compose build
```

#### Run the stack

```sh
docker-compose up
```

This will start the Screenshot Worker with all environment variables from your `.env` file.

> **Do not use `docker run` directly.** The recommended way is to use `docker-compose up` to ensure all dependencies and configuration are handled correctly.

The image is named `julienramel/andera-screenshot-worker` by default.

---

## Endpoints

- `POST /task` — Receives tasks for execution
- `GET /health` — Public status info; more details with authentication
- `GET /logs` — Last 1000 log lines (authentication required)
- `POST /on` and `/off` — Enable/disable task acceptance

All endpoints return gzipped data. Logs are managed natively.  
See [API Reference](https://andera.top/docs/base-worker/usage/) for details.

---

## Request a Screenshot

To request a screenshot, send a POST request to the `/task` endpoint with a JSON body specifying the URL you want to capture. Here is an example using `curl`:

```bash
curl -X POST http://localhost:3000/task \
  -H "Content-Type: application/json" \
  -d '{
    "function": "screenshot",
    "input": {
      "url": "https://andera.top",
      "width": 1920,
      "height": 1080,
      "returnType": "base64"
    },
    "contract": 1,
    "mode": "sync"
  }'
```

---

### Screenshot Input Options

| Option           | Type     | Default         | Description                                                                 |
|------------------|----------|-----------------|-----------------------------------------------------------------------------|
| url              | string   | (required)      | The URL of the page to capture.                                             |
| width            | number   | 1280            | Viewport width in pixels.                                                   |
| height           | number   | 720             | Viewport height in pixels.                                                  |
| returnType       | string   | "base64"        | "base64" (string) or "binary" (Buffer).                                     |
| waitForSelector  | string   | (none)          | If set, waits for this CSS selector to appear before taking the screenshot. |
| imageMimeType    | string   | "image/jpeg"    | Output image MIME type: "image/png" or "image/jpeg".                        |
| quality          | number   | 80              | Image quality (0-100). Used for JPEG only.                                  |
| delay            | number   | 0               | Delay in milliseconds to wait before taking the screenshot.                 |

**Example:**
```json
{
  "function": "screenshot",
  "input": {
    "url": "https://andera.top",
    "width": 1920,
    "height": 1080,
    "returnType": "base64",
    "imageMimeType": "image/jpeg",
    "quality": 90,
    "waitForSelector": "#main-content",
    "delay": 1000
  },
  "contract": 1,
  "mode": "sync"
}
```

---

## Deployment

- [Deployment Guide](https://andera.top/docs/base-worker/deployment/)
- Supports local, Docker, and cloud deployment.

---

## Useful Links

- [Andera Documentation](https://andera.top/docs/)
- [Base Worker Reference](https://andera.top/docs/base-worker/)

---

## Contributing

Andera is open source and community-driven!
See [CONTRIBUTING.md](CONTRIBUTING.md) for repository guidelines, and [How to Contribute](https://andera.top/docs/contribute) for the project's philosophy and license.

---

## License

For license details, see the [LICENSE](LICENSE) file.