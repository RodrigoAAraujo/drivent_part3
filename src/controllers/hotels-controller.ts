import { AuthenticatedRequest } from "@/middlewares";
import hotelsService from "@/services/hotels-service";
import { Request, Response } from "express";
import httpStatus from "http-status";

export async function getAllHotels(req: AuthenticatedRequest, res: Response ){
    const { userId } = req;

    try{
        const hotels = await hotelsService.getAllHotels(userId);
        return res.status(httpStatus.OK).send(hotels);
    }catch(error){
        if (error.name === "NotFoundError") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        if (error.name === "PaymentRequiredError") {
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
        }
    }
}

export async function getSpecificHotel( req: AuthenticatedRequest, res: Response){
    const userId = req.userId;

    const {hotelId} = req.params

    try{
        const hotel = await hotelsService.getSpecificHotel(userId, Number(hotelId));
        return res.status(httpStatus.OK).send(hotel);
    }catch(error){
        if (error.name === "NotFoundError") {
            return res.sendStatus(httpStatus.NOT_FOUND);
        }
        if (error.name === "PaymentRequiredError") {
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
        }
    }
}