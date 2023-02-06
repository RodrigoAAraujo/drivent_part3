import app, { init } from "@/app";
import { createEnrollmentWithAddress, createTicket, createTicketType, createTicketTypeSpecific, createUser } from "../factories";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import * as jwt from "jsonwebtoken";
import { createHotel } from "../factories/hotels-factory";


beforeAll(async () => {
    await init();
    await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {

    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/hotels");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });




    describe("When token is valid,", () => {


        describe("But is lacking something", () => {


            it("should respond 404 if there is no enrollment", async () => {
                const token = await generateValidToken()

                const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

                expect(response.status).toBe(httpStatus.NOT_FOUND)
            })

            it("should respond 404 if there is no ticket", async () => {
                const user = await createUser()
                const token = await generateValidToken(user)
                await createEnrollmentWithAddress(user)

                const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

                expect(response.status).toBe(httpStatus.NOT_FOUND)

            })

            it("should respond 404 if there is no hotel", async () => {
                const user = await createUser()
                const token = await generateValidToken(user)
                const enrollment = await createEnrollmentWithAddress(user)
                const ticketType = await createTicketType()
                await createTicket(enrollment.id, ticketType.id, "PAID")

                const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

                expect(response.status).toBe(httpStatus.NOT_FOUND)
            })
        })

        describe("But ticket cases", () => {

            it(`should respond 402 if ticket is not paid`, async () => {
                const user = await createUser()
                const token = await generateValidToken(user)
                const enrollment = await createEnrollmentWithAddress(user)
                const ticketType = await createTicketTypeSpecific(false, true)
                await createTicket(enrollment.id, ticketType.id, "RESERVED")
                await createHotel()

                const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

                expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED)

            })

            it(`should respond 402 if it is remote`, async () => {
                const user = await createUser()
                const token = await generateValidToken(user)
                const enrollment = await createEnrollmentWithAddress(user)
                const ticketType = await createTicketTypeSpecific(true, true)
                await createTicket(enrollment.id, ticketType.id, "PAID")
                await createHotel()

                const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

                expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED)

            })

            it(`should respond 402 if it does not include hotel`, async () => {
                const user = await createUser()
                const token = await generateValidToken(user)
                const enrollment = await createEnrollmentWithAddress(user)
                const ticketType = await createTicketTypeSpecific(true, false)
                await createTicket(enrollment.id, ticketType.id, "PAID")
                await createHotel()

                const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

                expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED)

            })
        })

        describe("And everything is alright", () => {

            it("Intended response", async () => {
                const user = await createUser()
                const token = await generateValidToken(user)
                const enrollment = await createEnrollmentWithAddress(user)
                const ticketType = await createTicketTypeSpecific(false, true)
                await createTicket(enrollment.id, ticketType.id, "PAID")
                const hotel = await createHotel()

                const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`)

                expect(response.status).toBe(httpStatus.OK)

                expect(response.body).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            id: expect.any(Number),
                            name: expect.any(String),
                            image: expect.any(String),
                            createdAt: expect.any(String),
                            updatedAt: expect.any(String)
                        })
                    ])
                )
            })
        })

    })
})



describe("GET /hotels/:hotelId", () => {

    it("should respond with status 401 if no token is given", async () => {
        await cleanDb()
        const response = await server.get("/hotels/1");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();

        const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });



    describe("When token is valid,", () => {

        describe("But is lacking something", () => {

            it("should respond 404 if there is no enrollment", async () => {
                const token = await generateValidToken()

                const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`)

                expect(response.status).toBe(httpStatus.NOT_FOUND)
            })

            it("should respond 404 if there is no ticket", async () => {
                const user = await createUser()
                const token = await generateValidToken(user)
                await createEnrollmentWithAddress(user)

                const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`)

                expect(response.status).toBe(httpStatus.NOT_FOUND)

            })

            it("should respond 404 if there is no hotel", async () => {
                const user = await createUser()
                const token = await generateValidToken(user)
                const enrollment = await createEnrollmentWithAddress(user)
                const ticketType = await createTicketType()
                await createTicket(enrollment.id, ticketType.id, "PAID")

                const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`)

                expect(response.status).toBe(httpStatus.NOT_FOUND)
            })

            it("should respond 404 if there is no hotel with given id", async () => {
                const user = await createUser()
                const token = await generateValidToken(user)
                const enrollment = await createEnrollmentWithAddress(user)
                const ticketType = await createTicketTypeSpecific(false, true)
                await createTicket(enrollment.id, ticketType.id, "PAID")
                await createHotel()

                const response = await server.get("/hotels/0").set("Authorization", `Bearer ${token}`)

                expect(response.status).toBe(httpStatus.NOT_FOUND)
            })
        })



        describe("But ticket cases", () => {

            it(`should respond 402 if ticket is not paid`, async () => {
                const user = await createUser()
                const token = await generateValidToken(user)
                const enrollment = await createEnrollmentWithAddress(user)
                const ticketType = await createTicketTypeSpecific(false, true)
                await createTicket(enrollment.id, ticketType.id, "RESERVED")
                await createHotel()

                const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`)

                expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED)

            })

            it(`should respond 402 if it is remote`, async () => {
                const user = await createUser()
                const token = await generateValidToken(user)
                const enrollment = await createEnrollmentWithAddress(user)
                const ticketType = await createTicketTypeSpecific(true, true)
                await createTicket(enrollment.id, ticketType.id, "PAID")
                await createHotel()

                const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`)

                expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED)

            })

            it(`should respond 402 if it does not include hotel`, async () => {
                const user = await createUser()
                const token = await generateValidToken(user)
                const enrollment = await createEnrollmentWithAddress(user)
                const ticketType = await createTicketTypeSpecific(true, false)
                await createTicket(enrollment.id, ticketType.id, "PAID")
                await createHotel()

                const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`)

                expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED)

            })
        })

        describe("And everything is alright", () => {

            it("Intended response", async () => {
                const user = await createUser()
                const token = await generateValidToken(user)
                const enrollment = await createEnrollmentWithAddress(user)
                const ticketType = await createTicketTypeSpecific(false, true)
                await createTicket(enrollment.id, ticketType.id, "PAID")
                const hotel = await createHotel()

                const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`)

                expect(response.status).toBe(httpStatus.OK)
                expect(response.body).toEqual(
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                        image: expect.any(String),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String)
                    })
                )
            })


        })

    })
})
