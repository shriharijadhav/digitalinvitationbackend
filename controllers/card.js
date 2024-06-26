const CardModel = require('../models/cards.model')
const EventModel = require('../models/events.model')
const EngagementModel = require('../models/engagement.model')
const SangeetModel = require('../models/sangeet.model')
const HaldiModel = require('../models/haldi.model')
const BrideModel = require('../models/bride.model')
const GroomModel = require('../models/groom.model')

const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs')
const ParentModel = require('../models/parents.model')

const brideImagesFolderName = process.env.brideImagesFolderName
const groomImagesFolderName = process.env.groomImagesFolderName
const brideParentImagesFolderName = process.env.brideParentImagesFolderName
const groomParentImagesFolderName = process.env.groomParentImagesFolderName
 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

const uploadImageToCloudinary = async (filePath,nestedFolderPath) =>  {
    try {
        const result = await cloudinary.uploader.upload(filePath, { folder: nestedFolderPath });
        return result.secure_url;  
      } catch (error) {
        console.log(error) 
      }
}

exports.createNewCard = async(req,res) =>{
   try {


    
    const allData = JSON.parse(req.body.allData)
    const eventData = allData.eventDetails;
    const engagementData = allData.eventDetails.subEvents.engagementDetails
    const sangeetData = allData.eventDetails.subEvents.sangeetDetails
    const haldiData = allData.eventDetails.subEvents.haldiDetails
    const brideData = allData.brideDetails
    const groomData = allData.groomDetails

    

    
    const brideActualImage = req.files.find(f => f.fieldname === 'brideActualImage');
    const groomActualImage = req.files.find(f => f.fieldname === 'groomActualImage');
    const brideMotherActualImage = req.files.find(f => f.fieldname === 'brideMotherActualImage');
    const brideFatherActualImage = req.files.find(f => f.fieldname === 'brideFatherActualImage');
    const groomMotherActualImage = req.files.find(f => f.fieldname === 'groomMotherActualImage');
    const groomFatherActualImage = req.files.find(f => f.fieldname === 'groomFatherActualImage');

    if(!brideActualImage || !groomActualImage){
        return res.status(200).json({
            message: "Bride or Groom image is not found",
        })
    }

 

    const brideActualImageFilePath = brideActualImage.path;
    const groomActualImageFilePath = groomActualImage.path;

    let brideMotherActualImageFilePath;
    let brideFatherActualImageFilePath ;
    let groomMotherActualImageFilePath ;
    let groomFatherActualImageFilePath ;

    if(brideMotherActualImage && brideFatherActualImage && groomMotherActualImage && groomFatherActualImage) {
        brideMotherActualImageFilePath = brideMotherActualImage.path;
        brideFatherActualImageFilePath = brideFatherActualImage.path;
        groomMotherActualImageFilePath = groomMotherActualImage.path;
        groomFatherActualImageFilePath = groomFatherActualImage.path;
    }

    // console.log('brideActualImageFilePath',brideActualImageFilePath)
    // console.log('brideMotherActualImageFilePath',brideMotherActualImageFilePath)
    // console.log('brideFatherActualImageFilePath',brideFatherActualImageFilePath)

    // console.log('groomActualImageFilePath',groomActualImageFilePath)
    // console.log('groomMotherActualImageFilePath',groomMotherActualImageFilePath)
    // console.log('groomFatherActualImageFilePath',groomFatherActualImageFilePath)

    const brideImage_secureUrl = await uploadImageToCloudinary(brideActualImageFilePath,brideImagesFolderName)
    const groomImage_secureUrl = await uploadImageToCloudinary(groomActualImageFilePath,groomImagesFolderName)



    let brideMotherImage_secureUrl ;
    let brideFatherImage_secureUrl ;
    let groomMotherImage_secureUrl = '';
    let groomFatherImage_secureUrl = '';

    
    if(brideMotherActualImage && brideFatherActualImage && groomMotherActualImage && groomFatherActualImage){
        
        brideMotherImage_secureUrl = await uploadImageToCloudinary(brideMotherActualImageFilePath,brideParentImagesFolderName)
        brideFatherImage_secureUrl = await uploadImageToCloudinary(brideFatherActualImageFilePath,brideParentImagesFolderName)
    
        groomMotherImage_secureUrl = await uploadImageToCloudinary(groomMotherActualImageFilePath,groomParentImagesFolderName)
        groomFatherImage_secureUrl = await uploadImageToCloudinary(groomFatherActualImageFilePath,groomParentImagesFolderName)
    }
     // Once uploaded, delete the file from server


    try {
        
    fs.unlinkSync(brideActualImageFilePath);
    fs.unlinkSync(groomActualImageFilePath);

    if(brideMotherActualImage ){
        fs.unlinkSync(brideMotherActualImageFilePath);
    }
    if(brideFatherActualImage ){
        fs.unlinkSync(brideFatherActualImageFilePath);
    }
    if(groomMotherActualImage ){
        fs.unlinkSync(groomMotherActualImageFilePath);
    }
    if(groomFatherActualImage ){
        fs.unlinkSync(groomFatherActualImageFilePath);
    }
    } catch (error) {
        console.log('error')
    }
    
   





    // return res.status(200).json({
    //     message: "done",
    //     brideImage_secureUrl,
    //     groomImage_secureUrl,
    //     brideMotherImage_secureUrl,
    //     brideFatherImage_secureUrl,
    //     groomMotherImage_secureUrl,
    //     groomFatherImage_secureUrl
    // })

    let isEngagementDetailsSaved = false;
    let isSangeetDetailsSaved = false;
    let isHaldiDetailsSaved = false;
    let isBrideDetailsSaved = false;
    let isGroomDetailsSaved = false;
    let isParentDetailsSaved = false;
 
    // create a new card by inserting user ID into it
    const {cardStatus,cardLink,paymentStatus,selectedTemplate,userId} = JSON.parse(req.body.allData);
    const user_Id = new mongoose.Types.ObjectId(userId);
    const savedCard = await CardModel.create({cardLink:cardLink, cardStatus:cardStatus,selectedTemplate:selectedTemplate,paymentStatus:paymentStatus,user:user_Id})

   
   


     
    // create a new event document by inserting user ID and Card ID into it
     const {eventName,eventDate,raw_eventDate,eventTime,eventAddress,eventAddressGoogleMapLink,addEngagementDetails,addSangeetDetails,addHaldiDetails,addParentDetails,isEngagementAddressSameAsWedding,isSangeetAddressSameAsWedding,isHaldiAddressSameAsWedding,priorityBetweenBrideAndGroom,priorityBetweenParents} = eventData;

    const savedEvent = await EventModel.create({eventName:eventName,eventDate:eventDate,raw_eventDate:raw_eventDate,eventTime:eventTime,eventAddress:eventAddress,eventAddressGoogleMapLink:eventAddressGoogleMapLink,addEngagementDetails:addEngagementDetails,addSangeetDetails:addSangeetDetails,addHaldiDetails:addHaldiDetails,priorityBetweenParents:priorityBetweenParents,priorityBetweenBrideAndGroom:priorityBetweenBrideAndGroom,isEngagementAddressSameAsWedding:isEngagementAddressSameAsWedding,isSangeetAddressSameAsWedding:isSangeetAddressSameAsWedding,isHaldiAddressSameAsWedding:isHaldiAddressSameAsWedding,addParentDetails:addParentDetails,card:savedCard._id,user:user_Id})

    // add engagement details starts
    if(addEngagementDetails){
        const {engagementDate,raw_engagementDate,engagementTime,engagementAddress} = engagementData
        let temp_engagementAddress;
        if(isEngagementAddressSameAsWedding){
            temp_engagementAddress = eventAddress
        }else{
            temp_engagementAddress= engagementAddress
        }

        const savedEngagement = await EngagementModel.create({engagementDate:engagementDate,raw_engagementDate:raw_engagementDate,engagementTime:engagementTime,engagementAddress:temp_engagementAddress,card:savedCard._id,event:savedEvent._id,user:user_Id})

        if(savedEngagement){
            isEngagementDetailsSaved= true
        }
    }
    // add engagement details ends

    // add sangeet details starts
    if(addSangeetDetails){
        const {sangeetDate,raw_sangeetDate,sangeetTime,sangeetAddress} = sangeetData
        let temp_sangeetAddress;
        if(isSangeetAddressSameAsWedding){
            temp_sangeetAddress = eventAddress
        }else{
            temp_sangeetAddress= sangeetAddress
        }


        const savedSangeet = await SangeetModel.create({sangeetDate:sangeetDate,raw_sangeetDate:raw_sangeetDate,sangeetTime:sangeetTime,sangeetAddress:temp_sangeetAddress,card:savedCard._id,event:savedEvent._id,user:user_Id})

        if(savedSangeet){
            isSangeetDetailsSaved= true
        }
    }
    // add sangeet details ends

    // add Haldi details starts
    if(addHaldiDetails){
        const {haldiDate,raw_haldiDate,haldiTime,haldiAddress} = haldiData
        let temp_haldiAddress;
        if(isSangeetAddressSameAsWedding){
            temp_haldiAddress = eventAddress
        }else{
            temp_haldiAddress= haldiAddress
        }


        const savedHaldi = await HaldiModel.create({haldiDate:haldiDate,raw_haldiDate:raw_haldiDate,haldiTime:haldiTime,haldiAddress:temp_haldiAddress,card:savedCard._id,event:savedEvent._id,user:user_Id})

        if(savedHaldi){
            isHaldiDetailsSaved= true
        }
    }
    // add Haldi details ends


    // bride starts

    const { firstName:b_firstName, lastName:b_lastName, socialMediaLinks: b_socialMedia } = brideData;
    const b_instagramUrl = b_socialMedia[0].instagramLink
    const b_facebookUrl = b_socialMedia[1].facebookLink
    const b_youtubeUrl = b_socialMedia[2].youtubeLink

    const savedBride = await BrideModel.create({firstName:b_firstName,lastName:b_lastName,instagramLink:b_instagramUrl,facebookLink:b_facebookUrl,youtubeLink:b_youtubeUrl,brideImageLink:brideImage_secureUrl,card:savedCard._id,event:savedEvent._id,user:user_Id})

    if(savedBride){
        isBrideDetailsSaved= true
    }

    // bride ends

    
    // groom starts

    const { firstName:g_firstName, lastName:g_lastName, socialMediaLinks: g_socialMedia } = groomData;
    const g_instagramUrl = g_socialMedia[0].instagramLink
    const g_facebookUrl = g_socialMedia[1].facebookLink
    const g_youtubeUrl = g_socialMedia[2].youtubeLink

    const savedGroom = await GroomModel.create({firstName:g_firstName,lastName:g_lastName,instagramLink:g_instagramUrl,facebookLink:g_facebookUrl,youtubeLink:g_youtubeUrl,groomImageLink:groomImage_secureUrl,card:savedCard._id,event:savedEvent._id,user:user_Id})

    if(savedGroom){
        isGroomDetailsSaved= true
    }

    // groom ends

    // bride parent details start
    console.log('brideMotherImage_secureUrl',brideMotherImage_secureUrl)
    console.log('brideFatherImage_secureUrl',brideFatherImage_secureUrl)
    
    console.log('eventData.addParentDetails',eventData.addParentDetails)
    if(eventData.addParentDetails){
        
        const {firstName:bm_firstName, lastName:bm_lastName} = brideData.parentDetails.motherDetails
        const {firstName:bf_firstName, lastName:bf_lastName} = brideData.parentDetails.fatherDetails

        const {firstName:gm_firstName, lastName:gm_lastName} = groomData.parentDetails.motherDetails
        const {firstName:gf_firstName, lastName:gf_lastName} = groomData.parentDetails.fatherDetails

        const savedParent = await ParentModel.create({brideMotherFirstName:bm_firstName, brideMotherLastName:bm_lastName,brideFatherFirstName:bf_firstName,brideFatherLastName:bf_lastName,brideMotherImageUrl:brideMotherImage_secureUrl,brideFatherImageUrl:brideFatherImage_secureUrl,groomMotherFirstName:gm_firstName, groomMotherLastName:gm_lastName,groomFatherFirstName:gf_firstName,groomFatherLastName:gf_lastName,groomMotherImageUrl:groomMotherImage_secureUrl,groomFatherImageUrl:groomFatherImage_secureUrl,card:savedCard._id,event:savedEvent._id,user:user_Id})

        if(savedParent){
            isParentDetailsSaved = true
        }



    }
 
    // bride parent details end





    

    return res.status(200).json({
        isEngagementDetailsSaved,
        isSangeetDetailsSaved,
        isHaldiDetailsSaved,
        isBrideDetailsSaved,
        isGroomDetailsSaved,
        isParentDetailsSaved,
        message:'New Card Created successfully'
    })
   } catch (error) {
    console.log(error)
   }
}