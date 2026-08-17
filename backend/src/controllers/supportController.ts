import { Response, NextFunction } from 'express';
import * as supportService from '../services/supportService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { SenderType } from '../models/types.js';

export async function getOrCreateConversation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const visitorId = req.body.visitorId || req.query.visitorId || req.headers['x-visitor-id'] || `vis_${Date.now()}`;
    const userId = req.user ? req.user.userId : null;
    const conversation = await supportService.getOrCreateSupportConversation(visitorId as string, userId);
    res.status(200).json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { conversationId, message, senderType } = req.body;
    const type = senderType || (req.user && (req.user.role === 'SUPPORT_AGENT' || req.user.role === 'ADMIN') ? SenderType.SUPPORT_AGENT : SenderType.CUSTOMER);
    const newMessage = await supportService.sendSupportMessage({
      conversationId,
      senderType: type,
      message,
    });
    res.status(201).json({
      success: true,
      data: { message: newMessage },
    });
  } catch (error) {
    next(error);
  }
}

export async function listConversations(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status } = req.query;
    const conversations = await supportService.listAllConversations(status as string | undefined);
    res.status(200).json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
}

export async function getConversationById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const conversation = await supportService.getConversationDetails(id);
    res.status(200).json({
      success: true,
      data: { conversation },
    });
  } catch (error) {
    next(error);
  }
}

export async function replyToConversation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const newMessage = await supportService.sendSupportMessage({
      conversationId: id,
      senderType: SenderType.SUPPORT_AGENT,
      message,
    });
    res.status(201).json({
      success: true,
      data: { message: newMessage },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await supportService.updateConversationStatus(id, status);
    res.status(200).json({
      success: true,
      data: { conversation: updated },
    });
  } catch (error) {
    next(error);
  }
}

export async function getStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await supportService.getAdminSupportStats();
    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
}

