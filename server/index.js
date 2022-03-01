const fastify = require('fastify')({logger: true})

fastify.get('/', async (request, response) => {
    return { hello: 'world'}
})

const start = async () => {
    try {
        await fastify.listen(2999)
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()