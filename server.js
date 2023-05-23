const express = require('express')
const app = express()

// Подключаем шаблонизатор EJS
app.set('view engine', 'ejs')

// отслеживание URL
app.get('/', (request, response) => {
    // .send() - отправить текст (можно отправлять несоколько раз)
    // .end() - отправка текста один раз
    // .sendFile() - отправить файл
    // response.end('Hello Express JS')
    response.sendFile(__dirname + '/templates/index.html')
    console.log("dirname: " + __dirname)
})


// app.get('/news/50' - фиксированный адресс
// если хочу принимать динамический: ':name'
app.get('/user/:id/:name', (request, response) => {
    // response.end(`User ID: ${request.params.id}. User Name: ${request.params.name}`)
    // http://localhost:3000/user/4/alex?filter=Bob&login=alex
    response.end(`User ID: ${request.params.id}. User Name: ${request.params.name}. 
    Filter: ${request.query.filter}. Login: ${request.query.login}`)
})

app.get('/about', (request, response) => {
     response.end('About Us')
})

// Создаем сервер
let port = 3000;
app.listen(port, () => {
    console.log(`Server On at: http://localhost:${port}`)
})
