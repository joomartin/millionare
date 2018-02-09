const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('promise-mysql');
const moment = require('moment');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

(async () => {
    const conn = await mysql.createConnection({
        host: 'localhost',
        port: '8889',   // <- EZ ALAPBÓL NEM KELL
        user: 'root',
        password: 'root',
        database: 'millionare'
    });

    function getQuestionsQuery(queryParams = {}) {
        let query = 'SELECT * FROM questions ';

        if (queryParams.difficulty) {
            query += `WHERE difficulty = ${queryParams.difficulty}`;
        }

        return query;
    }

    app.get('/questions', async (request, response) => {
        const result = await conn.query(getQuestionsQuery(request.query));

        response.json(result);
    });

    app.get('/questions/random', async (request, response) => {
        let result = await conn.query(getQuestionsQuery(request.query));
        result = result.sort((a, b) => Math.random() - 0.5);

        response.json(result[0]);
    });

    app.get('/questions/isCorrect', async (request, response) => {
        const questionId = request.query.questionId;
        const answerId = request.query.answerId;

        const result = await conn.query('SELECT * FROM questions WHERE id = ' + questionId + ' LIMIT 1');
        const question = result[0];

        if (question.correctAnswer === answerId) {
            response.json({
                isCorrect: true,
                correctAnswer: answerId
            });
        } else {
            response.json({
                isCorrect: false,
                correctAnswer: question.correctAnswer
            });
        }
    });

    app.listen(8000, () => {
        console.log('Server is listening on port 8000');
    });
})();