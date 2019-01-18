const Booking = require('../../../api/model/booking');
const {dateToString} = require('../helpers/date');
const {user, singleEventHandler} = require('./merge');
const Event = require('../../../api/model/event');

const transformBooking = async booking => {
    return {
        ...booking._doc,
        _id: booking.id,
        user: user.bind(this, booking._doc.user),
        event: await singleEventHandler.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updatedAt: dateToString(booking._doc.updatedAt)
    }
};
const transformEvent = event => {
    return {
        ...event._doc,
        _id: event.id,
        date: dateToString(event._doc.date),
        creator: user.bind(this, event.creator)
    };
};
module.exports = {
    bookings: async () => {
        try {
            const bookings = await Booking.find();
            console.log(bookings);
            return bookings.map(async booking => {
                return await transformBooking(booking);
            })
        } catch (e) {
            console.log(e.message);
            throw e;
        }
    },

    bookEvent: async (args, req) => {
        try {
            if (!req.isAuth) {
                return new Error('Unauthorized Action')
            }
            const fetchedEvent = await Event.findOne({_id: args.eventId});
            const singleBooking = new Booking({
                user: '5c20be57305ea72cf841b022',
                event: fetchedEvent
            });
            const result = await singleBooking.save();
            return transformBooking(result);
        } catch (e) {
            console.log(e.message);
            throw e;
        }
    },
    cancelBooking: async (args, req) => {
        try {
            if (!req.isAuth) {
                return new Error('Unauthorized Action')
            }
            const bookedEvent = await Booking.findById(args.bookingId).populate('event');
            if (bookedEvent == null) {
                throw new Error("Booking Does not Exist");
            }
            const event = transformEvent(bookedEvent.event);
            await Booking.deleteOne({_id: args.bookingId});
            return event;
        } catch (e) {
            console.log(e.message);
            throw e;
        }
    }
};