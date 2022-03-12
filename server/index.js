const express = require('express')
const jose = require('jose')
const argon = require('argon2')
const e = require('express')

async function main() {
    const app = express()
    const port = 2999
    app.use(express.urlencoded({ extended: false }))

    const { publicKey, privateKey } = await jose.generateKeyPair('PS256')
    console.log(publicKey)
    console.log(privateKey)

    /**  @type {Map<string, number>} */
    const Database = new Map()

    Database.set('Henryk', await argon.hash('password123'))
    Database.set('costam', await argon.hash('admin'))

    app.get('/', (req, res) => {
        res.send('Hello World!')
    })

    app.get('/jwtpublickey', (req, res) => {
        res.send(publicKey.export({ format: 'jwk' }))
    })

    app.post('/login', async (req, res) => {
        try {
            const { username, password } = req.body
            if (!(username && password))
                res.status(400).send("All input is required")
            if (Database.has(username)) {
                if (await argon.verify(Database.get(username), password)) {
                    const jwt = await new jose.SignJWT({ username })
                        .setProtectedHeader({ alg: 'PS256' })
                        .setIssuedAt()
                        .setExpirationTime('2h')
                        .sign(privateKey)

                    console.log(jwt)
                    res.send(jwt)
                }
                else
                    res.status(400).send('not ok')
            }
            else {
                res.status(400).send('not ok')
            }
        } catch (err) {
            console.log(err)
        }
    })
    app.post('/register', async (req, res) => {
        try {
            if (!(req.body.username && req.body.password))
                res.status(400).send("All input is required")
            const hashedPassword = await argon.hash(req.body.password)
            Database.set(req.body.username, hashedPassword)
            res.send('user created')
        } catch (err) {
            res.status(500).send('fail')
        }
        console.log(Database.get(req.body.username))
    })


    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

main()
