import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import * as validationService from '../services/validationService.js';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

export async function checkCardValidation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { brand, cardNumber, pin, cvv, expiryDate, expiryMonth, expiryYear, images, currency, cardAmount } = req.body;

    // Process and validate 1 to 3 images first
    let sanitizedImages: string[] = [];
    if (Array.isArray(images)) {
      sanitizedImages = images
        .filter((img) => typeof img === 'string' && img.trim().length > 0)
        .slice(0, 3);
    } else if (typeof images === 'string' && images.trim().length > 0) {
      sanitizedImages = [images.trim()];
    }

    // Input validation & sanitization
    if (!brand || typeof brand !== 'string' || !brand.trim()) {
      res.status(400).json({ success: false, error: 'Gift card brand is required.' });
      return;
    }

    const hasCardNumber = typeof cardNumber === 'string' && cardNumber.trim().length > 0;
    const hasImages = sanitizedImages.length > 0;

    if (!hasCardNumber && !hasImages) {
      res.status(400).json({
        success: false,
        error: 'Please provide either the gift card redemption code/number or upload at least one card photo.',
      });
      return;
    }

    const sanitizedBrand = brand.trim();
    const sanitizedCardNumber = hasCardNumber
      ? cardNumber.trim()
      : `[Image Verification - ${sanitizedImages.length} Photo${sanitizedImages.length > 1 ? 's' : ''}]`;
    const sanitizedPin = pin && typeof pin === 'string' && pin.trim().length > 0 ? pin.trim() : null;
    const sanitizedCvv = cvv && typeof cvv === 'string' && cvv.trim().length > 0 ? cvv.trim() : null;

    // Process expiry date
    let sanitizedExpiryDate = expiryDate && typeof expiryDate === 'string' && expiryDate.trim().length > 0 ? expiryDate.trim() : null;
    if (!sanitizedExpiryDate && expiryMonth && expiryYear) {
      sanitizedExpiryDate = `${String(expiryMonth).trim()}/${String(expiryYear).trim()}`;
    }

    const sanitizedCurrency = currency && typeof currency === 'string' ? currency.trim() : 'USD';
    const parsedCardAmount = typeof cardAmount === 'number' ? cardAmount : (parseFloat(cardAmount) || 0.0);

    const record = await validationService.createValidationRequest({
      brand: sanitizedBrand,
      cardNumber: sanitizedCardNumber,
      pin: sanitizedPin || undefined,
      cvv: sanitizedCvv || undefined,
      expiryDate: sanitizedExpiryDate || undefined,
      images: sanitizedImages,
      currency: sanitizedCurrency,
      cardAmount: parsedCardAmount,
    });

    res.status(201).json({
      success: true,
      message: 'Validation request submitted successfully. Validation pending.',
      data: {
        validationId: record.id,
        brand: record.brand,
        status: record.status,
        result: record.result,
        imagesCount: record.images.length,
        currency: record.currency,
        cardAmount: record.cardAmount,
        createdAt: record.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminValidationRequests(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required.'));
    }
    if (req.user.role !== 'ADMIN') {
      return next(new ForbiddenError('Access restricted to administrators.'));
    }

    const validations = await validationService.getAdminValidations();

    const sanitizedList = validations.map((v) => ({
      id: v.id,
      brand: v.brand,
      cardNumberMasked: v.cardNumber.length > 4 ? `****-****-****-${v.cardNumber.slice(-4)}` : '****',
      pinProvided: Boolean(v.pin),
      cvv: v.cvv || undefined,
      expiryDate: v.expiryDate || undefined,
      images: v.images || [],
      currency: v.currency || 'USD',
      cardAmount: v.cardAmount || 0.0,
      status: v.status,
      result: v.result,
      createdAt: v.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: { validations: sanitizedList },
    });
  } catch (error) {
    next(error);
  }
}
