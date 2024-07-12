import { type Model, Schema, model as createModel } from "mongoose";

type URL = `http://${string}.png` | `https://${string}.png`

export interface IQuestion {
	subject: string;
	season: "m" | "s" | "w";
	year: number;
	paper: number;
	variant: number;
	questions: string[];
	answers: string | string[];
	topics: string[];
	questionNumber: number;
	board: string;
}
export interface MCQ {
    /**
     * The subject code assigned by Cambridge
     * @example 5070 (The Chemistry for O-Level)
     * @emits number
     */
    subjectCode: string
    /**
     * The season of the question.
     * @example 'm' (The February March Session)
     * @emits character
     */
    session: 'm' | 's' | 'w'
    /**
     * The image URL of the question
     * @example https://mcqify.grabyourservices.com:9000/questionify/images/5070_m24_qp_23_q15.png
     * @requires https
     * @requires png
     */
    question: URL
    mcqIdentifier: {
        /**
         * The variant of the question's question paper
         * @example 4
         */
        variant: number
        /**
         * The papaer of the question's question paper
         * @example 2
         */
        paper: number
        /**
         * The year of the question's question paper
         * @example 2024
         */
        year: number
        /**
         * The question number of the question
         * @example 29
         */
        number: number
    }
    /**
     * The answer to the MCQ Question
     * @example 'A'
     */
    answer: 'A' | 'B' | 'C' | 'D'
    /**
     * The topic that the question belons to
     * @example 12 (Stoichiometry)
     */
    topic: number
}

export interface Subject {
    code: string
    name: string
    board: 'AS' | 'A' | 'O' | 'IGCSE'
    mcqs: Array<MCQ>
    topics: Array<string>
}
interface QuestionModel extends Model<IQuestion> {
	getQuestions: (
		subject: string,
		minimumYear: number,
		limit: number,
		topics: string[],
		type: "mcq" | "all",
	) => Promise<IQuestion[]>;
}

const schema = new Schema<IQuestion, QuestionModel>({
	subject: { type: String, required: true },
	season: { type: String, required: true },
	year: { type: Number, required: true },
	paper: { type: Number, required: true },
	variant: { type: Number, required: true },
	questions: { type: [String], required: true },
	answers: { type: Schema.Types.Mixed, required: true },
	topics: { type: [String], required: true, index: true },
	questionNumber: { type: Number, required: true },
	board: { type: String, required: true },
});

schema.statics.getQuestions = async function getQuestions(
	subject: string,
	minimumYear: number,
	limit: number,
	topics: string[],
	type: "mcq" | "all",
) {
	const query = [
		{
			$match: {
				subject: subject,
				year: {
					$gte: minimumYear,
				},
				topics: {
					$elemMatch: { $in: topics },
				},
			},
		},
		{
			$sample: {
				size: limit,
			},
		},
	];
	if (type === "mcq") {
		// @ts-expect-error chirag big dummy
		query[0]["$match"]["$expr"] = {
			$eq: [{ $type: "$answers" }, "string"],
		};
	}

	return this.aggregate(query);
};

export const Question = createModel<IQuestion, QuestionModel>(
	"Question",
	schema,
);
