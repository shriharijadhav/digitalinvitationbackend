const CardsModel = require("../models/cards.model");
const mongoose = require("mongoose");
const EventModel = require("../models/events.model");

exports.fetchCardDetails = async (req,res)=>{
    const {cardUrl} = req.body;
 
 
    if(!cardUrl){
        return res.status(200).json({
            message:'Card Url is required.',
            isCardDetailsFetched: false,
        })
    }

    const cardFromDB = await CardsModel.findOne({cardLink:cardUrl},{__v:0})

    if(!cardFromDB){
        return res.status(200).json({
            message:'Card not found.',
            isCardDetailsFetched: false,

        })
    }

    const eventFromDB = await EventModel.findOne({card:cardFromDB._id},{user:0,__v:0})
    
    return res.status(200).json({
        data:{
            cardFromDB,
            eventDetails:eventFromDB,
        },
        isCardDetailsFetched: true,

    })
    
} 