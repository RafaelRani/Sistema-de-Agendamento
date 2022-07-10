class AppointmentFactory {
  build(simpleAppointment) {
    const day = simpleAppointment.date.getDate() + 1;
    const month = simpleAppointment.date.getMonth();
    const year = simpleAppointment.date.getFullYear();
    const hour = Number.parseInt(simpleAppointment.time.split(':')[0], 10);
    const minutes = Number.parseInt(simpleAppointment.time.split(':')[1], 10);
    const startDate = new Date(year, month, day, hour, minutes, 0, 0);
    const appo = {
      id: simpleAppointment._id,
      title: `${simpleAppointment.name} - ${simpleAppointment.description}`,
      start: startDate, // data inicial
      end: startDate, // data de finalização
      notified: simpleAppointment.notified,
      email: simpleAppointment.email,
    };
    return appo;
  }
}

module.exports = new AppointmentFactory();
