import express from 'express'
import { exec } from 'child_process'

const app = express()
app.use(express.json())

const sequelize = {
    query: async (sql: string) => {
        console.log("Executing SQL:", sql)
        return [{ id: 1, username: "admin" }]
    }
}

app.get('/user', async (req, res) => {
    const id = req.query.id as string

    try {
        const result = await sequelize.query(
            "SELECT * FROM users WHERE id = '" + id + "'"
        )

        res.send(result)
    } catch (err) {
        res.status(500).send(err)
    }
})

app.get('/exec', (req, res) => {
    const cmd = req.query.cmd as string

    exec("ls " + cmd, (err, stdout) => {
        if (err) return res.status(500).send(err.message)
        res.send(stdout)
    })
})

app.post('/eval', (req, res) => {
    const { code } = req.body

    const result = eval(code)

    res.json({ result })
})

app.listen(3000, () => {
    console.log('🚨 Vulnerable API running on port 3000')
})