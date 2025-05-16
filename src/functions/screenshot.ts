import { defineFunction } from '@andera-top/worker-core'
import { getFreeContext, releaseContext } from '../helpers/playwrightPool'
import { log, warn, error } from '@andera-top/worker-core/dist/utils/logger'
import { URL } from 'url'

// Validate that the provided URL is well-formed and uses http or https
function validateUrlBasic(urlString: string) {
  let url
  try {
    url = new URL(urlString)
  } catch {
    throw new Error('[SCREENSHOT] Invalid URL')
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('[SCREENSHOT] Only http and https are allowed')
  }
}

// Format the screenshot result according to the requested returnType
function formatScreenshotResult(buffer: unknown, returnType: string) {
  if (returnType === 'binary') {
    if (Buffer.isBuffer(buffer)) {
      return { screenshot: buffer.toString('binary') }
    } else if (typeof buffer === 'string') {
      return { screenshot: Buffer.from(buffer, 'base64').toString('binary') }
    }
  } else if (returnType === 'base64') {
    if (typeof buffer === 'string') {
      return { screenshot: buffer }
    } else if (Buffer.isBuffer(buffer)) {
      return { screenshot: buffer.toString('base64') }
    }
  }
  throw new Error('Unexpected screenshot buffer type or returnType')
}

export const screenshot = defineFunction({
  params: {
    url: { type: 'string', required: true },
    width: { type: 'number', required: false, default: 1280 },
    height: { type: 'number', required: false, default: 720 },
    returnType: { type: 'string', required: false, default: 'base64' },
    waitForSelector: { type: 'string', required: false },
    imageMimeType: { type: 'string', required: false, default: 'image/jpeg', enum: ['image/png', 'image/jpeg'] },
    quality: { type: 'number', required: false },
    delay: { type: 'number', required: false },
  },
  config: {
    timeout: 30000,
    logResult: false,
  },
  handler: async (params, context) => {
    // Extract and validate input parameters
    const { url, width, height, returnType = 'base64', waitForSelector, imageMimeType = 'image/jpeg', quality, delay } = params
    validateUrlBasic(url)

    // Determine the image type for Playwright ('png' or 'jpeg')
    let imageType: 'png' | 'jpeg' = imageMimeType === 'image/jpeg' ? 'jpeg' : 'png'

    log(
      '[SCREENSHOT]',
      `Taking screenshot: url=${url}, width=${width}, height=${height}, imageType=${imageType}, waitForSelector=${waitForSelector}, quality=${quality}, delay=${delay}`
    )

    // Get a free Playwright context (slot) from the pool
    const slot = await getFreeContext()
    if (!slot) throw new Error('[SCREENSHOT] No free Playwright context available')
    const { context: browserContext, index } = slot

    // Set up timeout management
    const timeoutMs = screenshot.config?.timeout ?? 30000
    let timeoutId: NodeJS.Timeout | null = null
    let finished = false

    try {
      // Optional delay before taking the screenshot
      if (delay && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      // Race between the screenshot logic and the global timeout
      return await Promise.race([
        (async () => {
          // Open a new page in the allocated context
          const page = await browserContext.newPage()

          // Set the viewport size
          await page.setViewportSize({ width: Number(width), height: Number(height) })

          // Navigate to the target URL
          await page.goto(url, { waitUntil: 'networkidle', timeout: timeoutMs })

          // Optionally wait for a selector to appear
          if (waitForSelector) {
            await page.waitForSelector(waitForSelector, { timeout: timeoutMs })
          }

          // Build screenshot options
          let options: any = { type: imageType }

          // Quality is only used for JPEG
          if (imageType === 'jpeg' && typeof quality === 'number') {
            options.quality = quality
          }

          let buffer: unknown
          try {
            // Take the screenshot with a timeout
            buffer = await Promise.race([
              page.screenshot({ ...options, encoding: returnType === 'binary' ? 'binary' : 'base64' }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('screenshot() timeout')), timeoutMs)),
            ])
            finished = true
            await page.close()

            // Format and return the screenshot result
            return formatScreenshotResult(buffer, returnType)
          } catch (err) {
            error('[SCREENSHOT]', `Error during page.screenshot() (${returnType}):`, err)
            await page.close()
            throw err
          }
        })(),
        // Global timeout for the whole function
        new Promise((_, reject) => {
          timeoutId = setTimeout(async () => {
            if (!finished) {
              warn('[SCREENSHOT]', `Timeout reached for url=${url}, width=${width}, height=${height} (slot ${index}) - releasing context`)
              await releaseContext(index)
            }
            reject(new Error('[SCREENSHOT] Screenshot timeout'))
          }, timeoutMs)
        }),
      ])
    } finally {
      if (timeoutId) clearTimeout(timeoutId)
      // Always release the context (slot) after use
      await releaseContext(index)
    }
  },
})
