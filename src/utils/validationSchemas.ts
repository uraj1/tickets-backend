import { z } from "zod";

export const formDetails = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Invalid email address."),
  rollNumber: z.string().min(1, "Roll number is required."),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits."),
  degree: z.string(),
  year: z.string(),
  yearOther: z.string().optional(),
  branch: z.string(),
  branchOther: z.string().optional(),
});
