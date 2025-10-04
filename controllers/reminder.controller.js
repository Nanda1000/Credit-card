import { reminder } from "../services/reminder.service";
import { cardService } from "../services/card.service";


//payment reminder

export const paymentMake = async(req, res, next)=>{
    try{
        const {cardId, userId, dueDate, message, subject, email} = req.body;
        const { bankName, cardType, cardNumber, limit, balance } = req.body;
        
        const card = await cardService.getCardById(cardId);

        if(!dueDate || !card) {
            res.status(200).json({message: "There is no due data for this card or No card found under this details"})
        }
        await reminder.scheduleAllReminders(cardId, userId, email);
        res.status(200).json({message: "Reminder scheduled successfully"});
    }catch(err){
        next(err);
    }
};

//due date notification

export const dueDate = async(req, res, next)=>{
    try{
        const {cardId, userId, email} = req.body;
        const dueDate = await reminder.paymentDueDate(cardId, userId);
        await reminder.sendReminderEmail(email, cardId, dueDate);
        res.status(200).json({message: "Due date notification sent successfully"});

    }catch(err){
        next(err);
    }
};


//rewards & offers

export const rewardsOffers = async(req, res, next)=>{
    try{

    }catch(err){
        next(err);
    }
};

