import { Request, Response } from 'express';
import { requireAuth, optionalAuth, getUserId } from '../auth';
import { verifyAccessToken } from '../../auth/jwt';

// Mock JWT verification
jest.mock('../../auth/jwt');

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('should call next() with valid token', () => {
      const mockPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        type: 'access' as const,
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (verifyAccessToken as jest.Mock).mockReturnValue(mockPayload);

      requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest).toHaveProperty('userId', 'user-123');
      expect(mockRequest).toHaveProperty('userEmail', 'test@example.com');
    });

    it('should return 401 when no authorization header', () => {
      requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'No authorization header provided',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid header format', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message:
          'Invalid authorization header format. Expected "Bearer <token>"',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 with missing Bearer keyword', () => {
      mockRequest.headers = {
        authorization: 'token-only',
      };

      requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when token verification fails', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid access token');
      });

      requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid access token',
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when token is expired', () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token',
      };

      (verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Access token has expired');
      });

      requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Access token has expired',
      });
    });
  });

  describe('optionalAuth', () => {
    it('should attach user data with valid token', () => {
      const mockPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        type: 'access' as const,
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (verifyAccessToken as jest.Mock).mockReturnValue(mockPayload);

      optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest).toHaveProperty('userId', 'user-123');
    });

    it('should continue without user data when no token', () => {
      optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest).not.toHaveProperty('userId');
    });

    it('should continue without user data when token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest).not.toHaveProperty('userId');
    });
  });

  describe('getUserId', () => {
    it('should return userId if present', () => {
      const req = { userId: 'user-123' } as unknown as Request;
      expect(getUserId(req)).toBe('user-123');
    });

    it('should return undefined if not present', () => {
      const req = {} as unknown as Request;
      expect(getUserId(req)).toBeUndefined();
    });
  });
});
