import View from "./View.js";

export default class extends View {
  constructor(params) {
    super(params);
    this.setTitle("Exams");
  }

  async getHtml() {
    runPolling();
    return `
      <div class="title"><h1>All Exams</h1></div>
      <div class="results">
        <table>
          <thead>
            <tr>
              <th>Exam ID</th>
              <th>Avg Exam Grade</th>
              <th>Students</th>
            </tr>
          </thead>
          <tbody id="exams">
            <!-- dynamically populated -->
          </tbody>
        </table>
      </div>
      `;
  }
}

const createRow = (exam) => {
  const { id, studentCount, average } = exam;
  let row = document.createElement("tr");

  let idCell = document.createElement("td");
  idCell.innerHTML = `<a href="/exams/${id}" data-link>${id}</a>`;

  let avg = document.createElement("td");
  avg.append(Math.round(average * 100) + "%");

  let student = document.createElement("td");
  student.append(studentCount);

  row.append(idCell);
  row.append(avg);
  row.append(student);
  return row;
};

function* pollApi(endpoint) {
  while (true) {
    yield fetch("/api/v1/" + endpoint, { method: "get" }).then((req) => {
      let resp = req.json();
      return resp;
    });
  }
}

function runPolling(generator) {
  if (!generator) {
    generator = pollApi("exams");
  }
  var prom = generator.next();
  prom.value.then(function (obj) {
    if (!obj.exams) {
      runPolling(generator);
    } else {
      document.getElementById("exams").innerHTML = null;
      obj.exams.forEach((el) => {
        let row = createRow(el);
        document.getElementById("exams").appendChild(row);
      });
      setTimeout(() => runPolling(generator), 1000);
    }
  });
}
