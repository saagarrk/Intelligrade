from typing import List, Dict, Any
from ..models.evaluation_model import ConceptMatchResult, QuestionEvaluationResult

class FeedbackService:
    @staticmethod
    def calculate_letter_grade(percentage: float) -> str:
        if percentage >= 90.0:
            return "A+"
        elif percentage >= 85.0:
            return "A"
        elif percentage >= 75.0:
            return "B+"
        elif percentage >= 65.0:
            return "B"
        elif percentage >= 55.0:
            return "C"
        elif percentage >= 45.0:
            return "D"
        else:
            return "F"

    @staticmethod
    def generate_question_feedback(
        question_number: int,
        similarity: float,
        concepts: List[ConceptMatchResult],
        max_marks: float,
        awarded_marks: float
    ) -> Dict[str, Any]:
        strengths = []
        improvements = []

        for c in concepts:
            if c.is_satisfied:
                strengths.append(f"Accurately addressed '{c.concept}' with sound technical terminology.")
            else:
                improvements.append(f"Missing in-depth articulation of core concept '{c.concept}'.")

        if similarity >= 85.0:
            feedback = f"Exemplary response for Q{question_number}. Demonstrates comprehensive mastery and precise academic nomenclature."
            if not strengths:
                strengths.append("High semantic alignment with official grading rubric.")
        elif similarity >= 65.0:
            feedback = f"Good foundational understanding for Q{question_number}. Clear conceptual reasoning with minor omissions in analytical depth."
        else:
            feedback = f"Developing response for Q{question_number}. Review core model derivations and incorporate explicit technical formulas."

        return {
            "feedback": feedback,
            "strengths": strengths or ["Basic context identified"],
            "improvements": improvements or ["Deepen structural examples in subsequent responses"]
        }

    @staticmethod
    def generate_overall_summary(
        student_name: str,
        percentage: float,
        grade: str,
        evaluations: List[QuestionEvaluationResult]
    ) -> Dict[str, Any]:
        all_strengths = []
        all_improvements = []
        for e in evaluations:
            all_strengths.extend(e.strengths)
            all_improvements.extend(e.improvements)

        if percentage >= 80.0:
            blooms = "Synthesizing & Evaluating (Level 5-6)"
            summary = f"{student_name} performed with academic distinction ({grade}, {percentage}%), showcasing rigorous theoretical grasp and accurate derivations."
        elif percentage >= 60.0:
            blooms = "Applying & Analyzing (Level 3-4)"
            summary = f"{student_name} demonstrated solid grasp of core syllabus topics ({grade}, {percentage}%). Recommended revision on edge cases and formal equations."
        else:
            blooms = "Remembering & Understanding (Level 1-2)"
            summary = f"{student_name} achieved {grade} ({percentage}%). Targeted instructional interventions and rubric walkthroughs are advised."

        return {
            "summary": summary,
            "strengths": list(set(all_strengths))[:3],
            "improvements": list(set(all_improvements))[:3],
            "blooms_level": blooms
        }
