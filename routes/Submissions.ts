import { Request, Response, Router } from "express";
import { pool } from "../Pool";
import { Submission } from "../types";

// type guard
const isSubmission = (value: any): value is Submission => {
  // Add more test cases
  return !!(value as Submission).institution_id && !!(value as Submission).id;
};

const getSubmissions = (data: string): Submission[] | undefined => {
  try {
    const a = JSON.parse(data);
    if (!Array.isArray(a)) {
      throw new Error("Is not a list");
    }

    const submissions = a.map((item) => {
      const isSub = isSubmission(item);

      if (!isSub) {
        throw new Error("Bad submission");
      }

      return item;
    });

    return submissions;
  } catch (e) {
    console.log("Fail to parse JSON", e);
    return undefined;
  }
};

const SQLquery = "";

export const addJSONSubmissions = (request: Request, response: Response) => {
  const { jsonData } = request.body;

  const submissionParseResult = getSubmissions(jsonData);
  if (!submissionParseResult) {
    response.statusMessage = "Failed to parse JSON Submissions";
    response.status(400).end();
    return;
  }

  // NOTE at this point submission.subjects has been parse into an array of Subjects but were saving them in the DB as just JSON. Interested to know the bes thing to do here.
  // need to turn submissionParseResult into [] of [] of values. While making .subjects JSON again.

  const subsWithJsonSubjects = submissionParseResult.map((sub) => ({
    ...sub,
    subjects: JSON.stringify(sub.subjects),
  }));

  // Does this ensure the order of the values
  const subsData = subsWithJsonSubjects.map((sub) => Object.values(sub));

  pool.query(SQLquery, subsData, (error, results) => {
    if (error) {
      response.status(500).json({
        status: "error",
        error: error.message,
      });
      return;
    }

    response.status(200).json({
      status: "success",
      message: "Data inserted successfully",
      result: results.rows,
    });
  });
};
