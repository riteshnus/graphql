const User = require('../../models/users');
const Event = require('../../models/events');
const { dateToString } = require('../../helpers/date')

const events = async eventIds => {
  try {
    const events = await Event.find({_id: {$in: eventIds} })
    return events.map(event => {
      return transformEvent(event);
    })
  } catch(err ) {
      console.log(err);
      throw err
  }
}

const singleEvent = async eventId => {
  try {
    const event = await Event.findById(eventId);
    return transformEvent(event);
  } catch(err ) {
      console.log(err);
      throw err
  }
}

const user = async userId => {
  try{
  const users = await User.findById(userId)
      return { ...users._doc, _id: users.id, createdEvents: events.bind(this, users._doc.createdEvents) }
  } catch(err) {
    console.log(err);
    throw err
  }
}

const transformEvent = event => {
  return { 
        ...event._doc, 
        _id: event.id, 
        date: dateToString(event._doc.date),
        creator: user.bind(this, event.creator)
  }
}


const transformBooking = booking => {
  return {
      ...booking._doc,
      _id: booking.id,
      user: user.bind(this, booking._doc.user),
      event: singleEvent.bind(this, booking._doc.event),
      createdAt: dateToString(booking._doc.createdAt),
      updatedAt: dateToString(booking._doc.updatedAt),
    }
}

// exports.events = events;
exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;