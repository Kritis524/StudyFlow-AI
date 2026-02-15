document.querySelector("button").addEventListener("click", async () => {
  const syllabus = document.querySelector("textarea").value;

  const response = await fetch("/generate-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      syllabus: syllabus,
      days: 7,
      hours: 2
    })
  });

  const plan = await response.json();
  const resultDiv = document.getElementById("result");
resultDiv.innerHTML = "";

for (const day in plan) {
  const dayCard = document.createElement("div");
  dayCard.style.background = "#f3f4f6";
  dayCard.style.padding = "15px";
  dayCard.style.marginBottom = "10px";
  dayCard.style.borderRadius = "10px";

  let content = `<h4>${day}</h4><ul>`;
  plan[day].forEach(topic => {
    content += `<li>${topic}</li>`;
  });
  content += "</ul>";

  dayCard.innerHTML = content;
  resultDiv.appendChild(dayCard);
}

});
