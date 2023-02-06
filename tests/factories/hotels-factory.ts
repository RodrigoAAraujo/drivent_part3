import faker from "@faker-js/faker";
import { User } from "@prisma/client";

import { prisma } from "@/config";

export async function createHotel() {
  return prisma.hotel.create({
    data:{
        name:  faker.company.companyName(),
        image:   faker.image.imageUrl()
    }
  })
}