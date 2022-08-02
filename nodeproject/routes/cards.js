const express = require("express")
const {Card} = require("../models/Card")
const joi = require("joi")
const _ = require("lodash")
const auth = require("../middlewares/auth")

const router = express.Router()
const gencardNum = async () => {
    while(true) {
        let randomNum = _.random(1000, 999999);
        let card = await Card.findOne({cardNum: randomNum})
        if (!card) return randomNum;
    }
}
const cardSchema = joi.object({
    name: joi.string().required().min(2),
    address: joi.string().required().min(2),
    description: joi.string().required().min(2),
    phone: joi.string().required().regex(/^0[2-9]\d{7,8}$/),
    image: joi.string().required()
})



router.post("/", auth, async(req, res) =>{
    // 1. joi
    try {
        const {error} = cardSchema.validate(req.body);
    if(error) return res.status(400).send(error.message);

    // 2. add cardNum + user_id
    let card = new Card(req.body);
    card.cardNum = await gencardNum();
    card.user_id = req.payload._id;
        await card.save()
        res.status(201).send(card)
    } catch (error) {
        res.status(400).send(error)
    }

});

router.get("/my-cards", auth, async (req, res)=> {
    try {
        const myCards = await Card.find({user_id: req.payload._id});
        if(myCards.length == 0) return res.status(404).send("Theres no cards")
        res.status(200).send(myCards);
    } catch (error) {
        res.status(404).send("error in get user cards")
    }
})

router.get("/:id", auth, async (req, res) =>{
    try {
        let card = await Card.findOne({_id:req.params.id, user_id:req.payload._id})
        if (!card) return res.status(404).send("Card was not found")
        res.status(200).send(card)
    } catch (error) {
        res.status(400).send("Error in get specific card")
    }
});

router.put("/:id", auth, async (req, res) => {
    try {
        const {error} = cardSchema.validate(req.body);
        if (error) return res.status(400).send(error.message);
        
        let card = await Card.findOneAndUpdate({_id: req.params.id, user_id: req.payload._id}
            , req.body
            , {new: true});
        if (!card) return res.status(404).send("card was not found");

        res.status(200).send(card);
    } catch (error) {
        res.status(400).send("error in put specific card");
    }
});

router.delete("/:id", auth, async (req, res) => {
    try {
        const card = await Card.findOneAndRemove({_id: req.params.id, user_id: req.payload._id})
        if(!card) return res.status(404).send("card was not found");
        res.status(200).send("Card was deleted");
    } catch (error) {
        res.status(400).send("Error in delete specfic card");
    }
})

router.get("/", auth, async (req, res) => {
    try {
        let cards = await Card.find();
        res.status(200).send(cards);
    } catch (error) {
        res.status(404).send(error)
    }
})
module.exports = router;