import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Submission } from "@/types/Submission";
import { Upload, Trash2, FileText, AlertTriangle, Loader } from "lucide-react";

interface SubmitAssignmentProps {
  classroomId: string;
  assignmentId: string;
  submittedById: string;
  dueDate: string;
}

const SubmitAssignment: React.FC<SubmitAssignmentProps> = ({
  classroomId,
  assignmentId,
  submittedById,
  dueDate,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [scores, setScores] = useState<{
    [key: string]: { score: number; grade: string; feedback: string };
  }>({});
  const [loadingScores, setLoadingScores] = useState<{
    [key: string]: boolean;
  }>({});

  const isLate = new Date(dueDate) < new Date();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/classrooms/assignments/submissions?assignmentId=${assignmentId}&submittedById=${submittedById}`,
          { withCredentials: true }
        );
        setSubmissions(response.data);
      } catch (error) {
        console.error("Failed to fetch submissions", error);
      }
    };

    fetchSubmissions();
  }, [assignmentId, submittedById]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload a PDF file.");
      return;
    }

    const submissionData = new FormData();
    submissionData.append("classroomId", classroomId);
    submissionData.append("submittedById", submittedById);
    submissionData.append("assignmentId", assignmentId);
    submissionData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/classrooms/assignments/submissions/add",
        submissionData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        toast.success("Assignment submitted successfully!");
        setFile(null);
        const submissionsResponse = await axios.get(
          `http://localhost:8080/api/classrooms/assignments/submissions?assignmentId=${assignmentId}&submittedById=${submittedById}`,
          { withCredentials: true }
        );
        setSubmissions(submissionsResponse.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit assignment.");
    }
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/classrooms/assignments/submissions/${submissionId}`,
        { withCredentials: true }
      );
      toast.success("Submission deleted successfully.");
      const response = await axios.get(
        `http://localhost:8080/api/classrooms/assignments/submissions?assignmentId=${assignmentId}&submittedById=${submittedById}`,
        { withCredentials: true }
      );
      setSubmissions(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete submission.");
    }
  };

  const handleEvaluateSubmission = async (submissionId: string) => {
    setLoadingScores((prev) => ({ ...prev, [submissionId]: true }));

    try {
      const response = await axios.get(
        `http://localhost:8080/api/classrooms/assignments/submissions/${submissionId}/evaluate`,
        { withCredentials: true }
      );

      if (response.status === 200) {
        const { score, grade, feedback } = response.data;
        setScores((prevScores) => ({
          ...prevScores,
          [submissionId]: { score, grade, feedback },
        }));
        toast.success(`Evaluation successful! Grade: ${grade}`);
      }
    } catch (error) {
      console.error("Error during evaluation", error);
      toast.error("Failed to fetch score.");
    } finally {
      setLoadingScores((prev) => ({ ...prev, [submissionId]: false }));
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Submit Your Work
        </h3>

        {isLate && (
          <div className="flex items-center space-x-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <p className="text-sm text-yellow-700">
              This submission will be marked as late
            </p>
          </div>
        )}

        <div
          className={`relative group border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out
                        ${
                          dragging
                            ? "border-blue-400 bg-blue-50"
                            : "border-gray-300 hover:border-blue-300 hover:bg-gray-50"
                        }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const droppedFile = e.dataTransfer.files?.[0];
            if (droppedFile?.type === "application/pdf") {
              setFile(droppedFile);
            } else {
              toast.error("Only PDF files are allowed.");
            }
          }}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="fileUpload"
          />
          <label
            htmlFor="fileUpload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="w-8 h-8 text-blue-500 mb-4" />
            <span className="text-sm font-medium text-gray-700">
              {file
                ? file.name
                : "Drag & drop your PDF here or click to browse"}
            </span>
            <span className="text-xs text-gray-500 mt-2">
              Only PDF files are accepted
            </span>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 
                        ${
                          isLate
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
        >
          {isLate ? "Submit Late Assignment" : "Submit Assignment"}
        </button>
      </div>

      {submissions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-800">
            Previous Submissions
          </h4>
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="flex flex-col p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <a
                      href={submission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Submission {submissions.indexOf(submission) + 1}
                    </a>
                  </div>

                  {scores[submission.id] && (
                    <div className="flex items-center bg-green-50 py-1 px-3 rounded-full">
                      <span className="text-sm font-medium text-green-700">
                        Score: {scores[submission.id].score}, Grade:{" "}
                        {scores[submission.id].grade}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 mt-3">
                  <button
                    onClick={() => handleEvaluateSubmission(submission.id)}
                    disabled={loadingScores[submission.id]}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors duration-200 flex items-center justify-center"
                  >
                    {loadingScores[submission.id] ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      "Get Your Score"
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteSubmission(submission.id)}
                    className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitAssignment;
