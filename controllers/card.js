const CardModel = require('../models/cards.model')
const EventModel = require('../models/events.model')
const EngagementModel = require('../models/engagement.model')
const SangeetModel = require('../models/sangeet.model')
const HaldiModel = require('../models/haldi.model')
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs')

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


    
    const tempNewCardData = JSON.parse(req.body.allData);
    const eventData  = tempNewCardData.eventDetails;
    const brideData = tempNewCardData.eventDetails.brideDetails;
    const groomData = tempNewCardData.eventDetails.groomDetails;
    const engagementData = tempNewCardData.eventDetails.subEvents.engagementDetails;
    const sangeetData = tempNewCardData.eventDetails.subEvents.sangeetDetails;
    const haldiData = tempNewCardData.eventDetails.subEvents.haldiDetails;
    const InviterData = tempNewCardData.eventDetails.InviterDetails;
    const galleryData = tempNewCardData.eventDetails.galleryDetails;
    const videoGalleryData = tempNewCardData.eventDetails.videoGalleryDetails;

   

    
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



    let brideMotherImage_secureUrl ='';
    let brideFatherImage_secureUrl = '';
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

    // create a new card by inserting user ID into it
    const {cardStatus,cardLink,paymentStatus,selectedTemplate,userId} = tempNewCardData;
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



    

    return res.status(200).json({
        isEngagementDetailsSaved,
        isSangeetDetailsSaved,
        isHaldiDetailsSaved,
        message:'New Card Created successfully'
    })
   } catch (error) {
    console.log(error)
   }
}