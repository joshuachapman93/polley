const express = require('express')
const app = express()
const port = 8383
const { db } = require('./firebase')
const { readDb, writeDb } = require('./dbFunctions')

app.use(express.static('public'))
app.use(express.json())

//routes HTTP verbs
app.post('/', async (req, res) => {
    const { id, question, options } = req.body

    if (!id || !question || options.length == 0) {
        res.status(400).send({ status: 'error' })
    }
    const docRef = db.collection('poles').doc('poles')
    const response = await docRef.set({
        [id]: {
            question,
            options: Array.from(options).reduce((acc, curr) => {
                return { ...acc, [curr]: 0 }
            }, {})
        }
    }, { merge: true })

    console.log(id, question, options)
    res.redirect('/' + id)
})

app.get('/ids', async (req, res) => {
    const pollRef = db.collection('poles').doc('poles')
    const data = await pollRef.get()

    const polls = data.data()
    res.status(200).send({ ids: Object.keys(polls) })
})
// GET POST PUT DELETE

app.get('/:id', (req, res) => {
    const { id } = req.params
    console.log(id)
    try {
        return res.status(200).sendFile('poll.html', { root: __dirname + '/public' })
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

app.get('/data/:id', async (req, res) => {
    const { id } = req.params

    const pollRef = db.collection('poles').doc('poles')
    const data = await pollRef.get()

    const polls = data.data()
    if (!Object.keys(polls).includes(id)) {
        return res.redirect('/')
    }
    res.status(200).send({ data: polls[id] })
})

app.post('/vote', async (req, res) => {
    const { id, vote } = req.body
    const pollRef = db.collection('poles').doc('poles')
    const polls = await pollRef.get()

    const data = polls.data()
    data[id]['options'][vote] += 1
    const docRef = db.collection('poles').doc('poles')

    const response = await docRef.set({
        ...data
    }, { merge: true })
    res.sendStatus(200)
})

app.listen(port, () => console.log(`Server has started on port: ${port}`))