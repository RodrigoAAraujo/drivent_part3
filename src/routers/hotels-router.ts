import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getAllHotels, getSpecificHotel } from "@/controllers/hotels-controller";

const hotelsRouter = Router();

hotelsRouter
    .all("/*", authenticateToken)
    .get("/", getAllHotels)
    .get("/:hotelId", getSpecificHotel)

export { hotelsRouter };