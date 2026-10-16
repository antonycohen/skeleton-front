import * as z from 'zod';

export const readResizedImageSchema = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
  mode: z.string(),
});

export type ReadResizedImage = z.infer<typeof readResizedImageSchema>;

export const readImageSchema = {
  id: z.string().nullable(),
  base64: z.string().nullable(),
  url: z.string().nullable(),
  downloadUrl: z.string().optional(),
  originalFilename: z.string().nullable(),
  // Natural pixel dimensions of the original (unresized) image.
  originalWidth: z.number().nullish(),
  originalHeight: z.number().nullish(),
  resizedImages: z.array(readResizedImageSchema).nullable(),
};

export const updateImageSchema = z
  .object({
    id: z.string().nullish(),
    base64: z.string().nullish(),
    url: z.string().nullish(),
    downloadUrl: z.string().nullish(),
    originalFilename: z.string().nullish(),
  })
  .refine((data) => data.base64 || data.downloadUrl || data.id, {
    message: 'validation.image.sourceRequired',
  });


export type UpdateImage = z.infer<typeof updateImageSchema>;

export type Image = z.infer<z.ZodObject<typeof readImageSchema>>;
