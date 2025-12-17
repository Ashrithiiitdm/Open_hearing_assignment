export type GetUserDTO = {
    id: string;
    name: string;
    email: string;
    primaryMobile: string;
    secondaryMobile?: string;
    dateOfBirth: string;
    placeOfBirth: string;
    currentAddress: string;
    permanentAddress: string;
    createdAt: string;
};

export type PaginationMeta = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type GetUsersResponse = {
    data: GetUserDTO[];
    pagination: PaginationMeta;
};
