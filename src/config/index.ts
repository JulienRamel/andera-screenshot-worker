import { config as coreConfig } from '@andera-top/worker-core/dist/config'

interface BaseWorkerConfig {
  baseWorkerSpecificConfig: {
    allowIgnoreSslErrors: boolean
  }
  port: number
  websocketPort: number
}

export type Config = typeof coreConfig & BaseWorkerConfig

export const config: Config = {
  ...coreConfig,
  baseWorkerSpecificConfig: {
    allowIgnoreSslErrors: process.env.ALLOW_IGNORE_SSL_ERRORS === 'true',
  },
  port: parseInt(process.env.PORT || '3000', 10),
  websocketPort: parseInt(process.env.WEBSOCKET_PORT || '3001', 10),
}
