const bcrypt = require('bcryptjs');

const Event = require('../../models/events')
const User = require('../../models/users')

const events = async eventIds => {
  try {
    const events = await Event.find({_id: {$in: eventIds} })
    events.map(event => {
      return { 
        ...event._doc, 
        _id: event.id, 
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator)
      }
    })
    return events;
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

module.exports = {
  events: async () => {
    try {
    const events = await Event.find()
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator)
        }
      })
    } catch(err) {
        console.log(err)
        throw err
      }
      return events;
    },
    createEvents: async args => {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: '5cd6f8ed5b3d0f96fe054706'
      });
      let createdEvent;
      try {
        const result = await event.save();
        createdEvent = {
          ...result._doc,
          _id: result._doc._id.toString(),
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, result._doc.creator)
        };
        const creator = await User.findById('5cd6f8ed5b3d0f96fe054706');

        if (!creator) {
          throw new Error('User not found.');
        }
        creator.createdEvents.push(event);
        await creator.save();

        return createdEvent;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    createUser: async args => {
      try {
        const existingUser = await User.findOne({
          email: args.userInput.email,
        })
        if(existingUser) {
          throw new Error('User already exist')
        }
        const hashpassword = await bcrypt.hash(args.userInput.password, 12)
        const user = new User({
          email: args.userInput.email,
          password: hashpassword
        })
        const result = await user.save()
        return { 
          ...result._doc, 
          password: null, 
          _id: result.id 
        }
      } catch(err) {
          console.log(err);
          throw err;
      }
    }
    }