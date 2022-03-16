const express = require('express')
const jose = require('jose')
const argon = require('argon2')
const multer = require('multer')
const mongodb = require('mongodb')


async function main() {
    const client = new mongodb.MongoClient("mongodb://127.0.0.1:27017")
    await client.connect();
    const db = await client.db("henryk_scheduler")
    const users_col = db.collection('users')

    async function save_user (username, password) {
        if (await users_col.countDocuments({username}) != 0) {
            throw Error("User already registered with that name")
        }

        return users_col.insertOne({
            username,
            password: await argon.hash(password)
        })
    }

    function password_of (username) {
        return users_col.findOne({username}).then(value => value && value.password)
    }

    const app = express()
    const upload = multer()
    const port = 2999
    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())
    app.use(upload.none())

    const { publicKey, privateKey } = await jose.generateKeyPair('PS256')

    app.get('/', (req, res) => {
        res.send('Hello World!')
    })

    app.get('/jwtpublickey', async (req, res) => {
        res.send(await jose.exportSPKI(publicKey))
    })

    app.post('/login', async (req, res) => {
        try {
            const { username, password } = req.body
            if (!(username && password)) {
                res.status(400).send("All input is required")
            }
            const passhash = await password_of(username)
            if (!passhash) {
                res.status(400).send("wrong credentials")
                return;
            }

            if (await argon.verify(passhash, password)) {
                const jwt = await new jose.SignJWT({ username })
                    .setProtectedHeader({ alg: 'PS256' })
                    .setIssuedAt()
                    .setExpirationTime('2h')
                    .sign(privateKey)

                console.log(jwt)
                res.send(jwt)
            }
            else {
                res.status(400).send('not ok')
            }
        } catch (err) {
            res.status(500).send("error")
            console.log(err)
        }
    })
    app.post('/register', async (req, res) => {
        try {
            if (!(req.body.username && req.body.password)) {
                res.status(400).send("All input is required")
                return
            }
            await save_user(req.body.username, req.body.password);
            res.status(200).send('user created')
        } catch (err) {
            console.log(err)
            res.status(500).send('fail')
        }
    })


    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

main()
