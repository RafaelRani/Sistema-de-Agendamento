const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const validator = require('validator');
const AppointmentService = require('./services/AppointmentService');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/agendamento', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

app.use(cookieParser('uhutfsjhb')); // senha que irá usar para gerar o cookie

// configurações express-session: ativando a sessão
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }, // tempo max: 1h
}));

// inicializar o flash para ser usado com midleware
app.use(flash());

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/cadastro', (req, res) => {
  let nameError = req.flash('nameError');
  let emailError = req.flash('emailError');
  let cpfError = req.flash('cpfError');
  let descriptionError = req.flash('descriptionError');
  let dateError = req.flash('dateError');
  let timeError = req.flash('timeError');

  let name = req.flash('name');
  let email = req.flash('email');
  let cpf = req.flash('cpf');
  let description = req.flash('description');
  let date = req.flash('date');
  let time = req.flash('time');

  nameError = (nameError == undefined || nameError.length == 0) ? undefined : nameError;
  emailError = (emailError == undefined || emailError.length == 0) ? undefined : emailError;
  cpfError = (cpfError == undefined || cpfError.length == 0) ? undefined : cpfError;
  descriptionError = (descriptionError == undefined || descriptionError.length == 0) ? undefined : descriptionError;
  dateError = (dateError == undefined || dateError.length == 0) ? undefined : dateError;
  timeError = (timeError == undefined || timeError.length == 0) ? undefined : timeError;

  name = (name == undefined || name == 0)? "" : name;
  email = (email == undefined || email == 0)? "" : email;
  cpf = (cpf == undefined || cpf == 0)? "" : cpf;
  description = (description == undefined || description == 0)? "" : description;
  date = (date == undefined || date == 0)? "" : date;
  time = (time == undefined || time == 0)? "" : time;

  res.render('create', {
    nameError, emailError, cpfError, descriptionError, dateError, timeError,
    name, email, cpf, description, date, time,
  });
});

app.post('/create', async (req, res) => {
  const {
    name, email, description, cpf, date, time,
  } = req.body;
  const status = await AppointmentService.create(name, email, description, cpf, date, time);
  if (status) {
    res.redirect('/');
  } else {
    res.send('Ocorreu uma falha!');
  }
});

app.get('/getcalendar', async (req, res) => {
  const appointments = await AppointmentService.getAll(false);
  if (appointments) {
    res.json(appointments);
  } else {
    res.send('Ocorreu uma falha!');
  }
});

app.get('/event/:id', async (req, res) => {
  const appointment = await AppointmentService.getById(req.params.id);
  if (appointment) {
    console.log(appointment);
    res.render('event', { appo: appointment });
  } else {
    res.send('Ocorreu uma falha!');
  }
});

app.post('/finish', async (req, res) => {
  const { id } = req.body;
  const result = await AppointmentService.finish(id);
  if (result) {
    res.redirect('/');
  } else {
    res.send('Ocorreu uma falha!');
  }
});

app.get('/list', async (req, res) => {
  const appos = await AppointmentService.getAll(true);
  if (appos) {
    res.render('list', { appos });
  } else {
    res.send('Ocorreu uma falha!');
  }
});

app.get('/searchresult', async (req, res) => {
  const appos = await AppointmentService.search(req.query.search);
  res.render('list', { appos });
});

const pollTime = 1000 * 5 * 60;

setInterval(async () => {
  await AppointmentService.sendNotification();
}, pollTime);

app.listen(8080, () => {
  console.log('Aplicação executando!');
});
