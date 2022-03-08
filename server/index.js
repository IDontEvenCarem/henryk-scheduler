const express = require('express')
const app = express()
const port = 2999

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/test', (req, res) => {
    res.send(req.query['a'] || 'none')
})

app.get('/test2', (req, res) => {
    if (Math.random() > 0.3)
        res.send("wiecej")
    else
        res.send("mniej")
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})