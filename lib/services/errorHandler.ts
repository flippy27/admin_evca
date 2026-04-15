/**
 * Centralized error handler
 * Converts API errors to user-friendly messages
 */

import axios, { AxiosError } from 'axios';
import { logger } from './logger';
import { ErrorDetails } from '../types/auth.types';

export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
  details?: string[];
}

/**
 * Extract error message from API response or error object
 */
export function extractErrorMessage(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ details?: ErrorDetails }>;

    // Try to get message from response
    if (axiosError.response?.data?.details?.message) {
      const msg = axiosError.response.data.details.message;
      return {
        message: Array.isArray(msg) ? msg[0] : msg,
        statusCode: axiosError.status ?? 500,
        details: Array.isArray(msg) ? msg : [msg],
      };
    }

    if (axiosError.response?.data?.message) {
      return {
        message: axiosError.response.data.message,
        statusCode: axiosError.response.status ?? 500,
      };
    }

    // Fallback by status code
    switch (axiosError.status) {
      case 400:
        return {
          message: 'Invalid input. Please check your data.',
          statusCode: 400,
        };
      case 401:
        return {
          message: 'Session expired. Please login again.',
          statusCode: 401,
        };
      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          statusCode: 403,
        };
      case 404:
        return {
          message: 'The resource was not found.',
          statusCode: 404,
        };
      case 422:
        return {
          message: 'Validation error. Please check your input.',
          statusCode: 422,
        };
      case 500:
        return {
          message: 'Server error. Please try again later.',
          statusCode: 500,
        };
      case 0:
        return {
          message: 'Network error. Check your connection.',
          statusCode: 0,
        };
      default:
        return {
          message: axiosError.message || 'An error occurred.',
          statusCode: axiosError.status ?? 500,
        };
    }
  }

  if (error instanceof Error) {
    logger.error('Non-API Error:', error);
    return {
      message: error.message,
      statusCode: 500,
    };
  }

  logger.error('Unknown Error:', error);
  return {
    message: 'An unexpected error occurred',
    statusCode: 500,
  };
}

/**
 * Handle error and log it
 */
export function handleError(error: unknown): ApiError {
  const apiError = extractErrorMessage(error);
  logger.error('API Error:', {
    message: apiError.message,
    statusCode: apiError.statusCode,
    details: apiError.details,
  });
  return apiError;
}

/**
 * Check if error is 401 (session expired)
 */
export function isUnauthorizedError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 401;
  }
  return false;
}

/**
 * Check if error is network-related (no response from server)
 */
export function isNetworkError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return !error.response && error.code !== 'ECONNABORTED';
  }
  return false;
}
