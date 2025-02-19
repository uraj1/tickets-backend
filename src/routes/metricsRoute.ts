import express, { Response, Request } from 'express'
import promClient from 'prom-client'

const metricsRouter = express.Router()

const register = new promClient.Registry()
register.setDefaultLabels({
    app: 'tedx-backend',
})

promClient.collectDefaultMetrics({ register })

const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
})

register.registerMetric(httpRequestDurationMicroseconds)

metricsRouter.use((req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer()
    res.on('finish', () => {
        end({
            method: req.method,
            route: req.route?.path || req.path,
            code: res.statusCode,
        })
    })
    next()
})

metricsRouter.get('/', async (req: Request, res: any) => {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
})

export default metricsRouter;
