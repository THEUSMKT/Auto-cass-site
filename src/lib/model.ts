import { z } from 'zod';

const text = z.string().trim().min(1).nullable();
const year = z.number().int().min(1900).max(new Date().getFullYear() + 2).nullable();
const webUrl = z.url().refine((v) => v.startsWith('https://'), 'Use HTTPS');
const mediaPath = z.string().regex(/^assets\/vehicles\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+$/);
const institutionalPath = z.string().regex(/^assets\/[A-Za-z0-9_./-]+$/).refine(value=>value.split('/').every(part=>part&&part!=='.'&&part!=='..')).nullable();
export const photoSchema = z.object({
  sourceUrl: webUrl,
  path: mediaPath.nullable(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  status: z.enum(['ready', 'unavailable']),
  variants: z.array(z.object({ path: mediaPath, width: z.number().int().positive() })),
  sha256: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
}).superRefine((p, ctx) => {
  if (p.status === 'ready' && (!p.path || !p.width || !p.height || !p.sha256)) {
    ctx.addIssue({code: 'custom', message: 'Foto pronta exige arquivo, dimensões e checksum'});
  }
});
export const vehicleSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]+$/),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  sourceUrl: webUrl,
  collectedAt: z.iso.datetime(),
  title: z.string().trim().min(1),
  brand: text, model: text, version: text,
  price: z.number().nonnegative().nullable(),
  currency: z.literal('BRL'), originalPriceText: text,
  manufacturingYear: year, modelYear: year,
  yearInTitle: year.optional(),
  mileage: z.number().int().nonnegative().nullable(),
  fuel: text, transmission: text, color: text, body: text,
  doors: z.number().int().min(1).max(8).nullable(),
  engine: text, description: text,
  features: z.array(z.string().trim().min(1)),
  specifications: z.record(z.string(), z.string()),
  status: z.enum(['available', 'unavailable', 'removed', 'unknown']),
  publishedAt: z.iso.datetime().nullable(),
  photos: z.array(photoSchema),
  issues: z.array(z.string()),
});
export const catalogSchema = z.array(vehicleSchema).superRefine((vehicles, ctx) => {
  // Several distinct home-page cards can share the same source page.
  for (const field of ['id', 'slug'] as const) {
    if (new Set(vehicles.map(v => v[field])).size !== vehicles.length) {
      ctx.addIssue({code: 'custom', message: `${field} duplicado no catálogo`});
    }
  }
  for (const v of vehicles) {
    for (const p of v.photos) {
      for (const path of [p.path, ...p.variants.map(x => x.path)].filter(Boolean)) {
        if (!path!.startsWith(`assets/vehicles/${v.id}/`)) {
          ctx.addIssue({code: 'custom', message: `Foto associada ao veículo errado: ${v.id}`});
        }
      }
    }
    if (new Set(v.photos.map(p => p.sourceUrl)).size !== v.photos.length) {
      ctx.addIssue({code: 'custom', message: `Foto repetida em ${v.id}`});
    }
  }
});
export type Vehicle = z.infer<typeof vehicleSchema>;
export type Photo = z.infer<typeof photoSchema>;
export const dealershipSchema = z.object({
 name: z.string().min(1), sourceUrl: webUrl, verifiedAt: z.iso.datetime().nullable(),
 demo: z.boolean(), catalogStatus: z.enum(['awaiting-source','verified','partial']),
 tagline: text, about: text,
 whatsapp: z.string().regex(/^55\d{10,11}$/).nullable(), phone: text,
 email: z.email().nullable(), address: text,
 hours: z.array(z.string()), socials: z.array(z.object({label:z.string(),url:webUrl})),
 services: z.array(z.object({title:z.string(),description:z.string()})),
 logo: institutionalPath, storeImage: institutionalPath, accent: z.string().regex(/^#[a-fA-F0-9]{6}$/),
 featuredIds: z.array(z.string()), provenance: z.record(z.string(),z.string()),
}).superRefine((d,ctx) => {
 if ((d.whatsapp || d.phone || d.email || d.address) && !d.verifiedAt) ctx.addIssue({code:'custom',message:'Contatos exigem data de verificação na origem'});
});
