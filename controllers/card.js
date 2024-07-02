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
const PhotoGalleryModel = require('../models/photoGallery.model')
const AudioFileModel = require('../models/audioFile.model')
const FamilyModel = require('../models/family.model')

const brideImagesFolderName = process.env.brideImagesFolderName
const groomImagesFolderName = process.env.groomImagesFolderName

const photoGalleryFolderName = process.env.photoGalleryFolderName
const allAudioFilesFolderName = process.env.allAudioFilesFolderName
const allFamilyMembersFolder = process.env.allFamilyMembersFolder
 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

const uploadMediaToCloudinary = async (filePath, nestedFolderPath, resourceType = 'image') => {
    try {
        const options = { 
            folder: nestedFolderPath,
            resource_type: resourceType // 'image' or 'video' for audio files
        };
        
        const result = await cloudinary.uploader.upload(filePath, options);
        return result.secure_url;
    } catch (error) {
        console.log(error);
        throw new Error('Failed to upload media to Cloudinary');
    }
};

const uploadToCloudinaryForMultipleImages = (filePath,nestedFolderPath) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(filePath,{ folder: nestedFolderPath }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };

  const uploadMultipleFiles = async (files,folderName) => {
    try {
        const uploadPromises = files.map(file => uploadToCloudinaryForMultipleImages(file.path,folderName));
        const results = await Promise.all(uploadPromises);
        // console.log('Upload Results:', results);
        return results;
        } catch (error) {
        console.error('Error uploading files:', error);
        throw error;
        }
};

exports.createNewCard = async(req,res) =>{
   try {


     
    const allData = JSON.parse(req.body.allData)
    const eventData = allData.eventDetails;
    const engagementData = allData.eventDetails.subEvents.engagementDetails
    const sangeetData = allData.eventDetails.subEvents.sangeetDetails
    const haldiData = allData.eventDetails.subEvents.haldiDetails
    const brideData = allData.brideDetails
    const groomData = allData.groomDetails

    let userAudioFilePath = '';
    const userAudioFile = req.files.find(f => f.fieldname === 'userAudioFile');
    if(userAudioFile){
        userAudioFilePath = userAudioFile.path
    }
    
    // dummy 

    // dummy ends

    
    
    const brideActualImage = req.files.find(f => f.fieldname === 'brideActualImage');
    const groomActualImage = req.files.find(f => f.fieldname === 'groomActualImage');
   

    const imageArray = req.files.filter(element => {
        return element.fieldname.includes('photoGallery_');
    }) || [];
 

    if(!brideActualImage || !groomActualImage){
        return res.status(200).json({
            message: "Bride or Groom image is not found",
        })
    }

 

    const brideActualImageFilePath = brideActualImage.path;
    const groomActualImageFilePath = groomActualImage.path;

   

    const brideImage_secureUrl = await uploadMediaToCloudinary(brideActualImageFilePath,brideImagesFolderName)
    const groomImage_secureUrl = await uploadMediaToCloudinary(groomActualImageFilePath,groomImagesFolderName)




    
     // Once uploaded, delete the file from server


    try {
        
    fs.unlinkSync(brideActualImageFilePath);
    fs.unlinkSync(groomActualImageFilePath);

    } catch (error) {
        console.log('error deleting groom or bride img')
    }
    
   




    let isEngagementDetailsSaved = false;
    let isSangeetDetailsSaved = false;
    let isHaldiDetailsSaved = false;
    let isBrideDetailsSaved = false;
    let isGroomDetailsSaved = false;
    let isParentDetailsSaved = false;
    let isPhotoGallerySaved = false;
    let audioFile_secureUrl= "";
    let isAudioFileSaved = false;
    let isFamilyDetailsSaved = false;
 
    // create a new card by inserting user ID into it
    const {cardStatus,cardLink,paymentStatus,selectedTemplate,userId} = JSON.parse(req.body.allData);
    const user_Id = new mongoose.Types.ObjectId(userId);

    // check if cardName already exists for the current user
    const isCardAlreadyExists = CardModel.findOne({cardLink:cardLink,user:userId});

    if (!isCardAlreadyExists){
        return res.status(200).json({
            message:'Card with same link already exists.',
            cardLinkExistsInDB:true
        })
    }


    const savedCard = await CardModel.create({cardLink:cardLink, cardStatus:cardStatus,selectedTemplate:selectedTemplate,paymentStatus:paymentStatus,user:user_Id})

   
   


     
    // create a new event document by inserting user ID and Card ID into it
     const {eventName,eventDate,raw_eventDate,eventTime,eventAddress,eventAddressGoogleMapLink,addEngagementDetails,addSangeetDetails,addHaldiDetails,addFamilyDetails,isEngagementAddressSameAsWedding,isSangeetAddressSameAsWedding,isHaldiAddressSameAsWedding,priorityBetweenBrideAndGroom,priorityBetweenFamily} = eventData;

    const savedEvent = await EventModel.create({eventName:eventName,eventDate:eventDate,raw_eventDate:raw_eventDate,eventTime:eventTime,eventAddress:eventAddress,eventAddressGoogleMapLink:eventAddressGoogleMapLink,addEngagementDetails:addEngagementDetails,addSangeetDetails:addSangeetDetails,addHaldiDetails:addHaldiDetails,priorityBetweenFamily:priorityBetweenFamily,priorityBetweenBrideAndGroom:priorityBetweenBrideAndGroom,isEngagementAddressSameAsWedding:isEngagementAddressSameAsWedding,isSangeetAddressSameAsWedding:isSangeetAddressSameAsWedding,isHaldiAddressSameAsWedding:isHaldiAddressSameAsWedding,addFamilyDetails:addFamilyDetails,card:savedCard._id,user:user_Id})

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

    // family   details start
    
    
    if(eventData.addFamilyDetails){

        
        const familyMemberImageArray = req.files.filter(element => {
            return element.fieldname.includes('familyMember_');
        }) || [];
        
        if(familyMemberImageArray.length>0){

             const uploadResults = await uploadMultipleFiles(familyMemberImageArray,allFamilyMembersFolder);
            const familyMembers_secureUrlArray = uploadResults.map(file =>file.secure_url)
            
            // delete all images from server folder once uploaded and saved in database
            familyMemberImageArray.forEach((file) => {
              try {
                
                fs.unlinkSync(`${file.path}`)
              } catch (error) {
                console.log('error deleting member image')
              }
            });



            let arrayTemp = eventData.familyDetailsArray.map(({ actualImage, ...rest }) => rest);
            arrayTemp = arrayTemp.map((item,index)=>{
                item.actualImageUrl = familyMembers_secureUrlArray[index]
                return item
            })
           
            const savedFamilyMembers = FamilyModel.create({familyDetailsArray:arrayTemp,card:savedCard._id,event:savedEvent._id,user:user_Id})
            if(savedFamilyMembers){
                isFamilyDetailsSaved = true
            }




        }else{
            isFamilyDetailsSaved= false;
        }
       
 
    }
 
    //  family details end

    // photo gallery starts

    
    
    if(imageArray.length>0){
        const uploadResults = await uploadMultipleFiles(imageArray,photoGalleryFolderName);
        const photoGallery_secureUrlArray = uploadResults.map(file =>file.secure_url)
        // console.log(photoGallery_secureUrlArray)
        if(photoGallery_secureUrlArray.length>0){
            const savedPhotoGallery = await PhotoGalleryModel.create({photoGallery:photoGallery_secureUrlArray,card:savedCard._id,event:savedEvent._id,user:user_Id})
            if(savedPhotoGallery){
                isPhotoGallerySaved = true;
            }
        }

        // delete all images from server folder once uploaded and saved in database
        imageArray.forEach((file) => {
            try {
              
              fs.unlinkSync(`${file.path}`)
            } catch (error) {
              console.log('error deleting member image')
            }
          });
    }

    // photo gallery ends


    // audio file starts
    if(allData.rejectDefaultAudioFiles){
        audioFile_secureUrl = await uploadMediaToCloudinary(userAudioFilePath,allAudioFilesFolderName,'video')
    }else{
        audioFile_secureUrl = allData.selectedAudioDetails.audioUrl
    }

    const savedAudioFile = await AudioFileModel.create({audioFile_secureUrl:audioFile_secureUrl,card:savedCard._id,event:savedEvent._id,user:user_Id})
    
    if(savedAudioFile){
        isAudioFileSaved = true;
    }

    // delete audio file from server once uploaded
    if(userAudioFilePath.length>0){
        try {
            fs.unlinkSync(userAudioFilePath)
        } catch (error) {
            
        }
    }

    // audio file ends


    

    return res.status(200).json({
        isEngagementDetailsSaved,
        isSangeetDetailsSaved,
        isHaldiDetailsSaved,
        isBrideDetailsSaved,
        isGroomDetailsSaved,
        isParentDetailsSaved,
        isPhotoGallerySaved,
        isAudioFileSaved,
        isFamilyDetailsSaved,
        message:'New Card Created successfully'
    })
   } catch (error) {
    console.log(error)
   }
}