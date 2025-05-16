import { config as coreConfig } from '@andera-top/worker-core/dist/config'

interface BaseWorkerConfig {
  baseWorkerSpecificConfig: {
    customConfigOption: string
  }
  port: number
  websocketPort: number
}

export type Config = typeof coreConfig & BaseWorkerConfig

export const config: Config = {
  ...coreConfig,
  baseWorkerSpecificConfig: {
    customConfigOption: process.env.CUSTOM_CONFIG || 'default-value',
  },
  port: parseInt(process.env.PORT || '3000', 10),
  websocketPort: parseInt(process.env.WEBSOCKET_PORT || '3001', 10),
}
