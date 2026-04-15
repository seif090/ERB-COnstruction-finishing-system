import { z } from 'zod';

export const createClientSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(8, 'Phone number is required'),
    altPhone: z.string().optional(),
    company: z.string().optional(),
    position: z.string().optional(),
    status: z
      .enum(['ACTIVE', 'INACTIVE', 'LEAD', 'NEGOTIATION', 'CLOSED', 'LOST'])
      .optional(),
    source: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    nationalId: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateClientSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    altPhone: z.string().optional(),
    company: z.string().optional(),
    position: z.string().optional(),
    status: z
      .enum(['ACTIVE', 'INACTIVE', 'LEAD', 'NEGOTIATION', 'CLOSED', 'LOST'])
      .optional(),
    source: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    nationalId: z.string().optional(),
    notes: z.string().optional(),
  }),
});
