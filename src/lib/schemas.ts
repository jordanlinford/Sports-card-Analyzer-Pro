import { z } from "zod";

export const cardFormSchema = z.object({
  playerName: z.string().min(1, "Player name is required"),
  year: z.string().optional(),
  cardSet: z.string().optional(),
  variation: z.string().optional(),
  cardNumber: z.string().optional(),
  condition: z.enum(["Raw", "PSA 9", "PSA 10"], {
    required_error: "Please select a condition",
  }),
});

export type CardFormData = z.infer<typeof cardFormSchema>; 