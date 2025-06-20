
import { z } from 'zod';

export const personalInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  cin: z.string()
    .min(9, 'Candidate Identification Number must be exactly 9 characters')
    .max(9, 'Candidate Identification Number must be exactly 9 characters')
    .regex(/^\d+$/, 'CIN must contain only numbers'),
  centerNumber: z.string()
    .min(5, 'Center number must be at least 5 characters')
    .optional()
    .or(z.literal('')),
  centerName: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  location: z.string().min(1, 'Location is required'),
  department: z.string().min(1, 'Department is required')
});

export const paymentDataSchema = z.object({
  payerName: z.string().min(1, 'Payer name is required'),
  contactPreference: z.enum(['email', 'phone', 'both']),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  phoneNumber: z.string()
    .min(9, 'Phone number must be exactly 9 digits')
    .max(9, 'Phone number must be exactly 9 digits')
    .regex(/^[67]\d{8}$/, 'Phone number must start with 6 or 7 and be 9 digits total')
    .optional()
    .or(z.literal('')),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  transactionId: z.string().optional(),
  couponCode: z.string().optional()
}).refine((data) => {
  if (data.contactPreference === 'email' || data.contactPreference === 'both') {
    return data.email && data.email.length > 0;
  }
  return true;
}, {
  message: 'Email is required for your selected contact preference',
  path: ['email']
}).refine((data) => {
  if (data.contactPreference === 'phone' || data.contactPreference === 'both') {
    return data.phoneNumber && data.phoneNumber.length > 0;
  }
  return true;
}, {
  message: 'Phone number is required for your selected contact preference',
  path: ['phoneNumber']
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type PaymentFormData = z.infer<typeof paymentDataSchema>;
