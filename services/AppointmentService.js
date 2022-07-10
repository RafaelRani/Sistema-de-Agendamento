const mongoose = require('mongoose');
const mailer = require('nodemailer');
const appointment = require('../models/Appointment');
const AppointmentFactory = require('../factories/AppointmentFactory');

const Appo = mongoose.model('Appointment', appointment);
class AppointmentService {
  async create(name, email, description, cpf, date, time) {
    const newAppo = new Appo({
      name, email, description, cpf, date, time, finished: false, notified: false,
    });
    try {
      await newAppo.save();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async getAll(showFinished) {
    if (showFinished) {
      try {
        return Appo.find();
      } catch (err) {
        console.log(err);
        return false;
      }
    }
    try {
      const appos = await Appo.find({ finished: false });
      const appointments = [];

      appos.forEach((appo) => {
        if (appo.date != undefined) {
          appointments.push(AppointmentFactory.build(appo));
        }
      });

      return appointments;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async getById(id) {
    try {
      const event = await Appo.findOne({ _id: id });
      return event;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async finish(id) {
    try {
      await Appo.findByIdAndUpdate(id, { finished: true });
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async search(query) {
    try {
      const appos = await Appo.find().or([{ email: query }, { cpf: query }]);
      return appos;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async sendNotification() {
    const appos = await this.getAll(false);
    const transporter = mailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 25,
      auth: {
        user: '0eec12270d414',
        pass: '37a7ff11ec42cc',
      },
    });

    appos.forEach(async (app) => {
      const date = app.start.getTime();
      const hour = 1000 * 60 * 60;
      const gap = date - Date.now();

      if (gap <= hour) {
        if (!app.notified) {
          await Appo.findByIdAndUpdate(app.id, { notified: true });

          transporter.sendMail({
            from: 'Rafael Rani <victor@guia.com.br>',
            to: app.email,
            subject: 'Sua consulta vai acontecer em breve!',
            text: 'Conteúdo qualquer!!!!! Sua consulta vai acontecer em 1h',
          }).then(() => {

          }).catch((err) => {
            console.log(err);
          });
        }
      }
    });
  }
}

module.exports = new AppointmentService();
