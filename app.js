const HTTP = {
    'API_URL': 'http://127.0.0.1:8000/',

    url(endpoint, queryParams) {
        let url = HTTP.API_URL + endpoint;

        if (queryParams) {
            url += '?';
            for (const key in queryParams) {
                url += `${key}=${queryParams[key]}&`;
            }
        }

        return url.slice(0, url.length - 1);
    },

    async get(url, wantsParse = false) {
        const response = await axios.get(url);
        let items = response.data;

        function parse(q) {
            q.answers = JSON.parse(q.answers);
        }

        // Kérdések JSON -é alakítása stringből
        if (wantsParse) {
            if (Array.isArray(items)) {
                items = items.map(item => {
                    parse(item)
                    return item;
                });
            } else {
                parse(items);
            }

        }

        return items;
    }
};


$(document).ready(async function () {
    let currentQuestion = 0;

    const main = $('#main');
    const questionContainer = $('#question-container');

    const PRIZES = [
        { id: 1, prize: 5000, checkpoint: false },
        { id: 2, prize: 10000, checkpoint: false },
        { id: 3, prize: 20000, checkpoint: false },
        { id: 4, prize: 50000, checkpoint: false },
        { id: 5, prize: 100000, checkpoint: true },

        { id: 6, prize: 200000, checkpoint: false },
        { id: 7, prize: 300000, checkpoint: false },
        { id: 8, prize: 500000, checkpoint: false },
        { id: 9, prize: 800000, checkpoint: false },
        { id: 10, prize: 1000000, checkpoint: true },

        { id: 11, prize: 2000000, checkpoint: false },
        { id: 12, prize: 5000000, checkpoint: false },
        { id: 13, prize: 10000000, checkpoint: false },
        { id: 14, prize: 20000000, checkpoint: false },
        { id: 15, prize: 40000000, checkpoint: true }
    ];

    initPrizes();
    increaseCurrentQuestion();

    $('#new-game').click(async function () {
        $('#panel').removeClass('d-none');

        const question = await HTTP.get(HTTP.url('questions/random', {
            difficulty: 1
        }), true);

        showQuestion(question);

        $(this).hide();
    });

    $('body').on('click', '.answer', async function () {
        $('.answer').removeClass('active');
        $(this).addClass('active');

        evaluateAnswer(this);
    });

    function increaseCurrentQuestion() {
        currentQuestion++;

        $('#prizes tr').removeClass('active');
        console.log(currentQuestion);
        console.log($('#prizes tr[data-id="' + currentQuestion + '"]'));
        $('#prizes tr[data-id="' + currentQuestion + '"]').addClass('active');
    }

    function initPrizes() {
        const source = $('#prizes-template').html();
        const template = Handlebars.compile(source);

        const prizes = PRIZES
            .sort((a, b) => b.id - a.id)
            .map(o =>  Object.assign(
                {}, o, 
                { 
                    prize: o.prize.toLocaleString('hu', { maximumFractionDigits: 0 })
                }
            ));

        const html = template({ prizes });

        $('#panel').append(html);
    }

    function evaluateAnswer(button) {
        const answerId = $(button).data('id');

        const interval = setInterval(() => {
            $(button).toggleClass('active');
        }, 500);

        setTimeout(async () => {
            const correction = await isAnswerCorrect(answerId);

            if (currentQuestion === 0) {
                if (correction.isCorrect) {
                    console.log('Beestél geci');
                } else {
                    console.log('Kiestél geci');
                }
            } else {

            }

            $(button).addClass('active');
            clearInterval(interval);

            $('.answer[data-id="' + correction.correctAnswer + '"]').addClass('correct');

            if (correction.isCorrect) currentQuestion++;
        }, 3000);
    }

    function showQuestion(question) {
        const source = $('#question-template').html();
        const template = Handlebars.compile(source);

        const html = template(question);

        questionContainer.html('');
        questionContainer.append(html);

        questionContainer.data('id', question.id);
    }

    async function isAnswerCorrect(id) {
        const result = await HTTP.get(HTTP.url('questions/isCorrect', {
            questionId: questionContainer.data('id'),
            answerId: id
        }));

        return result;
    }
});