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

        history_col.insertOne({ username })
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
        const user_history_id = (await history_col.findOne({ username }))._id

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
            if ('notes' in data.deleted) {
                let deleted_notes = (await users_col.findOne({ _id: userid })).notes
                deleted_notes = Object.values(deleted_notes)
                let is = false
                for (let i = 0; i < deleted_notes.length; i++) {
                    for (let j = 0; j < data.deleted.notes.length; j++) {
                        if (deleted_notes[i]._id == data.deleted.notes[j]) {
                            is = true
                            break
                        }
                    }
                    if (is == false) {
                        deleted_notes.splice(i, 1)
                        i--
                    }
                    is = false
                }
                await history_col.updateOne({ _id: user_history_id },
                    {
                        $addToSet: {
                            notes: {
                                $each: deleted_notes
                            }
                        }
                    })
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
            }
            if ('todo' in data.deleted) {
                let deleted_todo = (await users_col.findOne({ _id: userid })).todo
                deleted_todo = Object.values(deleted_todo)
                let is = false
                for (let i = 0; i < deleted_todo.length; i++) {
                    for (let j = 0; j < data.deleted.todo.length; j++) {
                        if (deleted_todo[i]._id == data.deleted.todo[j]) {
                            is = true
                            break
                        }
                    }
                    if (is == false) {
                        deleted_todo.splice(i, 1)
                        i--
                    }
                    is = false
                }
                await history_col.updateOne({ _id: user_history_id },
                    {
                        $addToSet: {
                            todo: {
                                $each: deleted_todo
                            }
                        }
                    })
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
            }
            if ('calendar' in data.deleted) {
                let deleted_calendar = (await users_col.findOne({ _id: userid })).calendar
                deleted_calendar = Object.values(deleted_calendar)
                let is = false
                for (let i = 0; i < deleted_calendar.length; i++) {
                    for (let j = 0; j < data.deleted.calendar.length; j++) {
                        if (deleted_calendar[i]._id == data.deleted.calendar[j]) {
                            is = true
                            break
                        }
                    }
                    if (is == false) {
                        deleted_calendar.splice(i, 1)
                        i--
                    }
                    is = false
                }
                await history_col.updateOne({ _id: user_history_id },
                    {
                        $addToSet: {
                            todo: {
                                $each: deleted_calendar
                            }
                        }
                    })
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
        }
        if ('modified' in data) {
            if ('notes' in data.modified) {
                let modified_notes = (await users_col.findOne({ _id: userid })).notes
                modified_notes = Object.values(modified_notes)
                for (const item of data.modified.notes) {
                    for (var note of modified_notes) {
                        if (note._id == item._id) {
                            await history_col.updateOne({ _id: user_history_id }, {
                                $addToSet: {
                                    notes: note
                                }
                            })
                            break
                        }
                    }
                    await users_col.updateOne({ _id: userid, "notes._id": item._id },
                        {
                            $set: {
                                "notes.$": item
                            }
                        })
                }
            }
            if ('todo' in data.modified) {
                let modified_todo = (await users_col.findOne({ _id: userid })).todo
                modified_todo = Object.values(modified_todo)
                for (const item of data.modified.todo) {
                    for (var todo of modified_todo) {
                        if (todo._id == item._id) {
                            await history_col.updateOne({ _id: user_history_id }, {
                                $addToSet: {
                                    todo: todo
                                }
                            })
                            break
                        }
                    }
                    await users_col.updateOne({ _id: userid, "todo._id": item._id },
                        {
                            $set: {
                                "todo.$": item
                            }
                        })
                }

            }
            if ('calendar' in data.modified) {
                let modified_calendar = (await users_col.findOne({ _id: userid })).calendar
                modified_calendar = Object.values(modified_calendar)
                for (const item of data.modified.notes) {
                    for (var calendar of modified_calendar) {
                        if (calendar._id == item._id) {
                            await history_col.updateOne({ _id: user_history_id }, {
                                $addToSet: {
                                    calendar: calendar
                                }
                            })
                            break
                        }
                    }
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
        const user_history_id = (await history_col.findOne({ username }))._id
        const user_notes = (await users_col.findOne({ _id: userid })).notes || []
        const user_todo = (await users_col.findOne({ _id: userid })).todo || []
        const user_calendar = (await users_col.findOne({ _id: userid })).calendar || []

        await history_col.updateOne({ _id: user_history_id },
            {
                $addToSet:
                {
                    notes:
                        { $each: user_notes },
                    todo:
                        { $each: user_todo },
                    calendar:
                        { $each: user_calendar }
                }
            })
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
