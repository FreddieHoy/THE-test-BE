import { Request, Response, Router } from "express";
import { addJSONSubmissions } from "./Submissions";

export const router = Router();

router.post("/submissionsJSON", addJSONSubmissions);
