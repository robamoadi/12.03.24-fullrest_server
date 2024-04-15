
const knex = require('knex')
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const config = require("config")
const logger = require('./logger/my_logger')

const app = express()

app.use(cors())

app.use(bodyParser.json())

app.use(express.static(path.join('.', '/statics/')))

app.post('/api/create_table', async (request, response) => {
    try{
    await data_base.raw(`CREATE TABLE students(
        id SERIAL PRIMARY KEY,
        NAME TEXT NOT NULL UNIQUE,
        CITY TEXT ,
        BIRTH INTEGER );`)
    response.status(201).json({ result: "table created" })
}
catch (e) {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // Use 24-hour clock
    });
    const formattedDate = formatter.format(date).replace(/,/, '');
    console.log(`${formattedDate}.${date.getMilliseconds().toString().padStart(3, '0')} Error in employees-create-table. error = ${e} `);
    if (e.message.includes('already exists')) {
        logger.error(`Error in employees-create-table. error = ${e.message}.`)
        response.status(400).json({ status: "Failed to create table", error: e.message.replaceAll("\"", "'") })
    }
    else {
        const case_number = Math.floor(Math.random() * 1000000) + 1000000
        logger.error(`Case number (${case_number}): Error in employees-create-table. ${e.message}.`)
        response.status(500).json({
            status: "Failed to create table", error: `Internal error. please contact support ${case_number}`,
            time: Date()
        })
    }
}
})

app.post('/api/5.students_created', async (request, response) => {
    `INSERT INTO students (NAME,CITY,BIRTH)
    VALUES ('SHALOM', 'TEL AVIV', 1974 );
    INSERT INTO students (NAME,CITY,BIRTH)
    VALUES ('YURI', 'RAANANA',  1980);
    INSERT INTO students (NAME,CITY,BIRTH)
    VALUES ('ANAT', 'RISHON',1994 );
    INSERT INTO students (NAME,CITY,BIRTH)
    VALUES ('DANA', 'REHOVOT', 1990 );
    INSERT INTO students (NAME,CITY,BIRTH)
    VALUES ('David', 'JERUSALM', 1987 );`
        .replaceAll('\n    ', '')
        .split(';')
        .filter(query => query)
        .forEach(async query => { await data_base.raw(query + ';') })
    response.status(201).json({ result: "5 students created" })
})

app.get('/api/students', async (request, response) => {
    const students = await data_base.raw("select * from students")
    response.status(200).json(students.rows)
})

app.get('/api/students/:id', async (request, response) => {
    const id = request.params.id
    const students = await data_base.raw(`select * from students where id = ${id}`)
    response.status(200).json(students.rows)
})

app.delete('/api/delete_table', async (request, response) => {
    await data_base.raw(`DROP TABLE if exists students;`)
    response.status(200).json({ result: "table deleted" })
})

app.delete('/api/students/:id', async (request, response) => {
    const id = request.params.id
    await data_base.raw(`DELETE FROM students where id=${id}`)
    response.status(200).json({ result: "student deleted" })
})

app.post('/api/students', async (request, response) => {
    const new_students = request.body
    await data_base.raw(`INSERT INTO students (name,city,birth) VALUES (?, ?, ?);`,
        [new_students.name, new_students.city, new_students.birth])
    response.status(201).json({ result: "new student created" })
})

app.put('/api/students/:id', async (request, response) => {
    const id = request.params.id
    const update_students = request.body
    await data_base.raw(`UPDATE students set name=?,city=?,birth=? where id=?`,
        [update_students.name, update_students.city, update_students.birth, id])
    response.status(200).json({ result: "student updated" })
})

app.patch('/api/students/:id', async (request, response) => {
    const id = request.params.id
    const arr = []
    for (key in request.body) {
        arr.push(`${key}='${request.body[key]}'`)
    }
    if (arr.length > 0) {
        await data_base.raw(`UPDATE students set ${arr.join(', ')} where id=${id}`)
        response.status(200).json({ result: "student patched" })
        return
    }
    response.status(200).json({ result: "empty student" })
})


app.listen(config.server.port, () => {
    console.log(`==== express server is up on port ${config.server.port}`);
})

const data_base = knex({
    client: 'pg',
    connection: {
        host: config.db_connection.host,
        user: config.db_connection.user,
        password: config.db_connection.password,
        database: config.db_connection.database
    }
})