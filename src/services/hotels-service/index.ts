import { notFoundError, PaymentRequiredError } from "@/errors"
import enrollmentRepository from "@/repositories/enrollment-repository"
import hotelsRepository from "@/repositories/hotels-repository"
import ticketRepository from "@/repositories/ticket-repository"
import { Ticket, TicketType } from "@prisma/client"

async function getAllHotels(userId: number) {
    const ticket = await validateHotelExistence(userId)

    await validatePayment(ticket)

    return await hotelsRepository.findAllHotels()
}

async function getSpecificHotel(userId: number, hotelId: number){
    const ticket = await validateHotelExistence(userId)

    await validatePayment(ticket)

    const hotel = await hotelsRepository.findHotelById(hotelId)
    if(!hotel) throw notFoundError()

    return hotel
}

async function validatePayment(ticket: Ticket & {TicketType: TicketType}){
    if(ticket.status !== "PAID" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel){
        throw PaymentRequiredError()
    }
}

async function validateHotelExistence(userId: number){
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId)
    if(!enrollment) throw notFoundError()
    const enrollmentId = enrollment.id

    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollmentId)
    if(!ticket) throw notFoundError()
    
    const hotels = await hotelsRepository.findAllHotels()
    if(hotels.length === 0) throw notFoundError()

    return ticket
}


const  hotelsService ={
    getAllHotels,
    getSpecificHotel
}


export default hotelsService