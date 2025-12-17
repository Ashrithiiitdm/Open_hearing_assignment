import type { User } from "../../generated/prisma/client.js";
import type { GetUserDTO } from "./user.types.js";

export function toGetUserDTO(user: User): GetUserDTO {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        primaryMobile: user.primaryMobile,
        ...(user.secondaryMobile && {
            secondaryMobile: user.secondaryMobile,
        }),
        dateOfBirth: user.dateOfBirth.toISOString(),
        placeOfBirth: user.placeOfBirth,
        currentAddress: user.currentAddress,
        permanentAddress: user.permanentAddress,
        createdAt: user.createdAt.toISOString(),
    };
}

export function toGetUserDTOs(users: User[]): GetUserDTO[] {
    return users.map(toGetUserDTO);
}
