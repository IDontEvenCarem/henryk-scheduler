const express = require('express')
const jose = require('jose')
const argon = require('argon2')
const multer = require('multer')
const mongodb = require('mongodb')
const Diff = require('diff');


async function main() {
    const client = new mongodb.MongoClient("mongodb://127.0.0.1:27017")
    await client.connect();
    const db = await client.db("henryk_scheduler")
    const users_col = db.collection('users')
    const history_col = db.collection('history')

    async function save_user(username, password) {
        if (await users_col.countDocuments({ username }) != 0) {
            throw Error("User already registered with that name")
        }

        return users_col.insertOne({
            username,
            password: await argon.hash(password)
        })
    }

    function password_of(username) {
        return users_col.findOne({ username }).then(value => value && value.password)
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
                res.status(400).json({ error: "All input is required" })
            }
            const passhash = await password_of(username)
            if (!passhash) {
                res.status(400).json({ error: "Wrong credentials" })
                return;
            }

            if (await argon.verify(passhash, password)) {
                const jwt = await new jose.SignJWT({ username })
                    .setProtectedHeader({ alg: 'PS256' })
                    .setIssuedAt()
                    .setExpirationTime('2h')
                    .sign(privateKey)

                console.log(jwt)
                res.json({ message: jwt })
            }
            else {
                res.status(400).json({ error: "Wrong credentials" })
            }
        } catch (err) {
            res.status(500).json({ error: "Login error" })
            console.log(err)
        }
    })
    
    app.post('/register', async (req, res) => {
        try {
            if (!(req.body.username && req.body.password)) {
                res.status(400).json({ error: "All input is required" })
                return
            }
            await save_user(req.body.username, req.body.password);
            res.status(200).json({ message: "User created." })
        } catch (err) {
            console.log(err)
            res.status(500).json({ error: "Registration fail" })
        }
    })

    app.post('/change', async (req, res) => {
        const data = req.body
        if (!('usertoken' in data)) {
            return res.status(400).json({ error: "You have to authenticate to save your data" })
        }
        const jwt = data.usertoken
        const { payload, protectedHeader } = await jose.jwtVerify(jwt, publicKey, {
            alg: 'PS256'
        })
        const username = payload.username
        const userid = (await users_col.findOne({ username }))._id

        if ('added' in data) {
            if ('notes' in data.added)
                await users_col.updateOne({ _id: userid },
                    {
                        $push: {
                            notes: {
                                $each: data.added.notes
                            }
                        }
                    })
            if ('todo' in data.added)
                await users_col.updateOne({ _id: userid },
                    {
                        $push: {
                            todo: {
                                $each: data.added.todo
                            }
                        }
                    })
            if ('calendar' in data.added)
                await users_col.updateOne({ _id: userid },
                    {
                        $push: {
                            calendar: {
                                $each: data.added.calendar
                            }
                        }
                    })
        }
        if ('deleted' in data) {
            if ('notes' in data.deleted)
                await users_col.updateOne({ _id: userid },
                    {
                        $pull: {
                            notes: {
                                _id: {
                                    $in: data.deleted.notes
                                }
                            }
                        }
                    })
            if ('todo' in data.deleted)
                await users_col.updateOne({ _id: userid },
                    {
                        $pull: {
                            todo: {
                                _id: {
                                    $in: data.deleted.todo
                                }
                            }
                        }
                    })
            if ('calendar' in data.deleted)
                await users_col.updateOne({ _id: userid },
                    {
                        $pull: {
                            calendar: {
                                _id: {
                                    $in: data.deleted.calendar
                                }
                            }
                        }
                    })
        }
        if ('modified' in data) {
            if ('notes' in data.modified) {
                for (const item of data.modified.notes) {
                    await users_col.updateOne({ _id: userid, "notes._id": item._id },
                        {
                            $set: {
                                "notes.$": item
                            }
                        })
                }
            }
            if ('todo' in data.modified) {
                for (const item of data.modified.todo) {
                    await users_col.updateOne({ _id: userid, "todo._id": item._id },
                        {
                            $set: {
                                "todo.$": item
                            }
                        })
                }
            }
            if ('calendar' in data.modified) {
                for (const item of data.modified.calendar) {
                    await users_col.updateOne({ _id: userid, "calendar._id": item._id },
                        {
                            $set: {
                                "calendar.$": item
                            }
                        })
                }
            }
        }
        res.status(200).json({ message: "Changes approved" })
    })

    app.post('/upsync', async (req, res) => {
        const data = req.body
        if (!('usertoken' in data)) {
            return res.status(400).json({ error: "You have to authenticate to save your data" })
        }
        const jwt = data.usertoken
        const { payload, protectedHeader } = await jose.jwtVerify(jwt, publicKey, {
            alg: 'PS256'
        })
        const username = payload.username
        const userid = (await users_col.findOne({ username }))._id
        // await history_col.insertOne({ userid, change: data })
        await users_col.updateOne({ _id: userid }, { $set: { notes: data.notes, todo: data.todo, calendar: data.calendar } })
       
        res.status(200).json({ message: "Upsync done" })
    })

    app.get('/downsync', async (req, res) => {
        const data = req.body
        if (!('usertoken' in data)) {
            return res.status(400).json({ error: "You have to authenticate to save your data" })
        }
        const jwt = data.usertoken
        const { payload, protectedHeader } = await jose.jwtVerify(jwt, publicKey, {
            alg: 'PS256'
        })
        const username = payload.username
        const userid = (await users_col.findOne({ username }))._id

        const usernotes = (await users_col.findOne({ username })).notes
        const usertodo = (await users_col.findOne({ username })).todo
        const usercalendar = (await users_col.findOne({ username })).calendar

        res.status(200).json({ notes: usernotes, todo: usertodo, calendar: usercalendar })
    })

    app.get('/history', (req, res) => {
        // ?
    })

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

main()

const exampleEvent1 = {
    usertoken: "JWT-ASDASdASDASDASDASDASD",
    added: {
        notes: [
            {
                _id: 123,
                title: "testowy tytuł",
                contents: "Hello, world!"
            }
        ]
    },
    deleted: {
        notes: [123, 4, 6],
        todo: [1120]
    },
    modified: {
        calendar: [
            {
                _id: 68,
                time_start: "12:30",
                time_end: "13:30"
            }
        ]
    }
}
