const express = require('express');

const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const AppointmentService = require('./services/AppointmentService');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/agendamento', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/cadastro', (req, res) => {
  res.render('create');
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
