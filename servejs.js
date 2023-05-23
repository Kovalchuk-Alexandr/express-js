const { response } = require('express')
const express = require('express')
const app = express()
// Модуль для работы с сессиями
const session = require('express-session')
// Модуль шифрования UUID (v4 - 4-я версия шифрования)
const {v4: uuidv4} = require('uuid')
// модуль cookie
const cookie = require('cookie-parser')

// Подключаем шаблонизатор EJS
app.set('view engine', 'ejs')

// по-умолчанию ищет пректы в папке views
// можно переименовать /templates в views или:
app.set('views', './templates')

// указываем каталог для статических объектов (фото и т.д.)
// можно создавать много таких папок
// app.use(express.static('image'))
app.use(express.static('public'))

// подключаем обработчик для корректной обработки формы
// возможно для одного конкретного URL
// app.use('/NodeJS',express.urlencoded({extended: false}))
app.use(express.urlencoded({ extended: false }))

// Промежуточный обработчик cookie
app.use(cookie())

// Создаем сессию
app.use(session({
    secret: uuidv4(),       // создаем секретный ключ
    resave: true,           // говорим, что можно пересохранять сессии
    saveUninitialized: true // сохраняем даже значение, которые еще не были сохранены
}))

// отслеживание URL
app.get('/', (request, response) => {
    // .send() - отправить текст (можно отправлять несоколько раз)
    // .end() - отправка текста один раз
    // .json() - отправка JSON
    // .sendFile() - отправить файл
    // response.end('Hello Express JS')
    // response.render(__dirname + '/templates/index.ejs', { name: 'Alex', id: 5 })
    let obj = {
        name: 'Alex', id: 2,
        title: 'Home',
        hobby: ['Football', 'Skate', 'Paint']
    }


    // *********** --------------- Сессии  cookie --------------- ***********
    // **
    // Для примера, предположим, что при переходе на главную, хотим сохранять объект 'obj'
    //  в сессию, позже выведем его на экран
    // создаем ключ 'data' (название м.б. любое) и помещаем в него
    // request.session.data = JSON.stringify(obj)

    // то же самое (сохранение объекта с помощью cookie)
    response.cookie('data', JSON.stringify(obj))
    // Сохранили сессию и сразу передали
    // response.render('index', JSON.parse(request.session.data))
    response.render('index', obj)
    // console.log("dirname: " + __dirname)
})

// При переходе на новую страницу данные сессии сохраняются
// На новой странице выведем, что записано в 'data'
app.get('/session', (request, response) =>
    response.json(JSON.parse(request.session.data)))

app.get('/cookie', (request, response) =>
    response.json(JSON.parse(request.cookies.data)))

// Удаление сессии
// app.get('/delete', (request, response) => request.session.destroy)    

// Удаление сессии. Вариант с параметром в виде callback ф. 
// которая будет срабатывать, если не удастся удалить сессию
app.get('/delete', (request, response) =>{
    request.session.destroy((err) => {
        console.log(err)
    }),
    response.send('Session deleted!!!')
})
// Удаление cookie
app.get('/delete/cookie', (request, response) => {
    // в cookie можно удалить не всю сессию, а только данные по ключу ('data)
    // так же можно передать callback ф.
    response.clearCookie('data'),
    response.send('Session deleted!!!')
})
// **
// *********** --------------- конец блока сессии --------------- ***********


// Получаем и обрабатываем данные (обработчик URL-адреса)
app.get('/user', (request, response) => {
    response.render('user',
        {
            error: request.session.error ? request.session.error : '',
            errorAuth: request.session.errorAuth ? request.session.errorAuth : '',
            user: request.session.user ? JSON.parse(request.session.user) : '',
            title: 'Registration form'
        })
})

// Получаем и обрабатываем данные (обработчик URL-адреса)
app.get('/dash', (request, response) => {
    response.render('dash',
        { user: request.session.user ? JSON.parse(request.session.user) : '', title: 'Dushboard' })
})

// *********** --------------- Блок Авторизации --------------- ***********
// **
//  Принимаем данные, отправленные из формы
app.post('/check-user-reg', (request, response) => {
    // Получаем значение из поля login (HTML)
    let login = request.body.login
    let name = request.body.name
    let email = request.body.email
    let pass = request.body.password

    let userObj = {
        login: login,
        name: name,
        email: email,
        pass: pass
        }

    request.session.error = ""

    if (login.length < 5) {
        request.session.error = 'Short Login length'
        // { error: 'Short Login length', title: 'Registration form' })
    } else if (name.length < 2)
        request.session.error = 'Short Name length'
    else if (!email.includes('@'))
        request.session.error = 'Email incorrect'
    else if (pass.length < 3)
        request.session.error = 'Password incorrect'
    else {
        // Если все значения верны, сохраняем
        request.session.reqUser = userObj
        request.session.error = 'Registration successfull!!'
    }
    
    // Создаем ключ для хранения всех данных пользователя
    // чтобы не вводить заново, сохранять то, что уже ввел
    request.session.user = JSON.stringify(userObj)
    
    response.redirect('/user')
    })

// **
// *********** --------------- Конец блока Авторизации --------------- ***********


// *********** --------------- Блок Регистрации --------------- ***********
// **
//  Принимаем данные, отправленные из формы
app.post('/check-user-auth', (request, response) => {
    // Получаем значение из поля login (HTML)
    let login = request.body.login
    let pass = request.body.password

    let userAuthObj = {
        login: login,
        //  pass: pass
        }

    request.session.error = ""

    if (login.length < 5)
        request.session.errorAuth = 'Short Login length'
    else if (pass.length < 3)
        request.session.errorAuth = 'Password incorrect'
    else {
        let userObj = JSON.parse(request.session.user)
        if(userObj.login == login && userObj.pass == pass)
        // Если все значения верны, переадресовываем в кабинет пользователя
            response.redirect('/dash')
        else {
            request.session.errorAuth = "Incorrect data"
            // request.session.reqUser = userAuthObj
        }
    }
    
    // чтобы не вводить заново, сохранять то, что уже ввел
    // request.session.user = JSON.stringify(userAuthObj)

    response.redirect('/user')
    })

// **
// *********** --------------- Конец блока Авторизации --------------- ***********

// Создаем сервер
// let port = 3000;
// при выгрузке на сервер правильно прописывать....
// тогда, если задана константа PORT (process.env.PORT д.б. внутри сервера) - берем ее значение,
// если нет, то свой собственный - 3000
let port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server On at: http://localhost:${port}`)
})
