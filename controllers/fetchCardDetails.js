const CardsModel = require("../models/cards.model");
const mongoose = require("mongoose");
const EventModel = require("../models/events.model");
const BrideModel = require("../models/bride.model");
const GroomModel = require("../models/groom.model");
const EngagementModel = require("../models/engagement.model");
const HaldiModel = require("../models/haldi.model");
const SangeetModel = require("../models/sangeet.model");
const ParentModel = require("../models/parents.model");
const PhotoGalleryModel = require("../models/photoGallery.model");

exports.fetchCardDetails = async (req,res)=>{
    try {
        const {cardUrl} = req.body;

    let engagementFromDB ;
    let haldiFromDB;
    let sangeetFromDB;
    let parentFromDB;
    let photoGallery;
 
 
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
    const brideFromDB = await BrideModel.findOne({card:cardFromDB._id},{user:0,__v:0})
    const groomFromDB = await GroomModel.findOne({card:cardFromDB._id},{user:0,__v:0})
    

    if(eventFromDB.addEngagementDetails){
         engagementFromDB = await EngagementModel.findOne({event:eventFromDB._id},{user:0,__v:0})
    }
    if(eventFromDB.addSangeetDetails){
        sangeetFromDB = await SangeetModel.findOne({event:eventFromDB._id},{user:0,__v:0})
    }
    if(eventFromDB.addHaldiDetails){
        haldiFromDB = await HaldiModel.findOne({event:eventFromDB._id},{user:0,__v:0})
    }
    if(eventFromDB.addParentDetails){
        parentFromDB = await ParentModel.findOne({event:eventFromDB._id},{user:0,__v:0})
    }

    photoGallery = await PhotoGalleryModel.findOne({event:eventFromDB._id},{user:0,__v:0})

     
    return res.status(200).json({
        data:{
            cardFromDB,
            eventDetails:{
                eventFromDB,
                subEvents:{
                engagementDetails:engagementFromDB ? engagementFromDB : {},
                sangeetDetails:sangeetFromDB ? sangeetFromDB : {},
                haldiDetails:haldiFromDB ? haldiFromDB : {}
                },
                brideDetails:brideFromDB,
                groomDetails:groomFromDB,
                parentDetails:parentFromDB,
                photoGallery: photoGallery || []

            },
        },
        isCardDetailsFetched: true,

    })
    } catch (error) {
        return res.status(200).json({
            message:'Something went wrong',
            isCardDetailsFetched: false,
    
        })
    }
    
} 