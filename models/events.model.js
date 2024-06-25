const mongoose = require('mongoose')

const eventSchema = mongoose.Schema({
    eventName:{
        type:String,
    },
    eventDate:{
        type:String,
    },
    raw_eventDate:{
        type:String,
    },
    eventTime:{
        type:String,
    },
    eventAddress:{
        type:String,
    },
    eventAddressGoogleMapLink:{
        type:String,
    },
    addEngagementDetails:{
        type:Boolean,
    },
    addSangeetDetails:{
        type:Boolean,
    },
    addHaldiDetails:{
        type:Boolean,
    },
    addParentDetails:{
        type:Boolean,
    },
    isEngagementAddressSameAsWedding:{
        type:Boolean,
    },
    isSangeetAddressSameAsWedding:{
        type:Boolean,
    },
    isHaldiAddressSameAsWedding:{
        type:Boolean,
    },
    priorityBetweenBrideAndGroom:{
        type:String
    },
    priorityBetweenParents:{
        type:String
    },
    card:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'cards'
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'cards'
    }

})

const EventModel  = mongoose.model('events',eventSchema)

module.exports = EventModel