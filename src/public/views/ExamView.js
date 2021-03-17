import View from "./View.js";

export default class extends View {
  constructor(params) {
    super(params);
    console.log(params);
    this.examID = params.id;
    this.sorted = params.sorted;
    this.setTitle("Exams");
  }

  async getHtml() {
    const examData = await getExamData(this.examID, this.sorted);
    return (
      `<div class="title">
      <h1>Exam ${this.examID}</h1>
      <h2>Average: ${Math.round(examData.average * 100)}%</h2>
      </div>` + examData.table
    );
  }
}

const getExamData = async (id, sortOrder) => {
  const response = await fetch("/api/v1/exams/" + id, { method: "get" });
  const grades = await response.json();
  let scoreSet = new Set(grades.results.map((student) => student.score));
  let sorted = Array.from(scoreSet).sort((a, b) => b - a);
  grades.results.forEach((student) => {
    student.rank = sorted.indexOf(student.score) + 1;
  });
  let rows = []
  if (sortOrder === "asc") {
    rows = grades.results
    .sort((a, b) => a.rank - b.rank )
    .map((exam) => {
      const { studentId, score, rank } = exam;
      return `<tr><td>${studentId}</td><td>${
        Math.round(score * 100) + "%"
      }</td><td>${rank}</td></tr>`;
    })
    .join("");
  }
  else if (sortOrder === "desc"){
    rows = grades.results
    .sort((a, b) => b.rank - a.rank )
    .map((exam) => {
      const { studentId, score, rank } = exam;
      return `<tr><td>${studentId}</td><td>${
        Math.round(score * 100) + "%"
      }</td><td>${rank}</td></tr>`;
    })
    .join("");
  }
  else {
    rows = grades.results
    .map((exam) => {
      const { studentId, score, rank } = exam;
      return `<tr><td>${studentId}</td><td>${
        Math.round(score * 100) + "%"
      }</td><td>${rank}</td></tr>`;
    })
    .join("");
  }
  let buttonParam = sortOrder === "asc" ? "desc" : "asc";
  let tableHtml = `<div class="results">
    <table>
    <thead>
        <tr>
        <th>Student Name</th>
        <th>Grade</th>
        <th>Rank<a href="/exams/${id}?sort=${buttonParam}" data-link>Sort</a></th>
        </tr>
    </thead>
    <tbody id="grades">
     ${rows}
    </tbody>
    </table>
    </div>
    `;

  return {
    table: tableHtml,
    average: grades.average,
  };
};
