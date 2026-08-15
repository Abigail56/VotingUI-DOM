"use strict";
const candidates = ['Lilian', 'Victor'];
candidates.push('Rita');
const poll = {
    'Lilian': 0,
    'Victor': 0,
};
const result = {};
const VOTES_KEY = "voting_system_votes";
const VOTED_EMAILS_KEY = "voting_system_voted_emails";
function loadVotes() {
    const stored = localStorage.getItem(VOTES_KEY);
    if (stored)
        return JSON.parse(stored);
    return { ...poll }; // clone, don't share the reference
}
function saveVotes(votes) {
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}
function loadVotedEmails() {
    const stored = localStorage.getItem(VOTED_EMAILS_KEY);
    return stored ? JSON.parse(stored) : [];
}
function saveVotedEmails(emails) {
    localStorage.setItem(VOTED_EMAILS_KEY, JSON.stringify(emails));
}
function isCandidate(value) {
    return candidates.includes(value);
}
function checkResult(candidate) {
    return result.poll?.[candidate];
}
const runtimeExports = typeof globalThis !== "undefined" && globalThis.exports;
if (runtimeExports) {
    runtimeExports.checkResult = checkResult;
    runtimeExports.showResults = showResults;
} else {
    globalThis.checkResult = checkResult;
    globalThis.showResults = showResults;
}
function updateCounters() {
    const votes = loadVotes();
    candidates.forEach(c => {
        const el = document.getElementById(`count-${c}`);
        if (el)
            el.textContent = String(votes[c]);
    });
}
function handleSubmit(event) {
    event.preventDefault();
    const nameInput = document.getElementById("voterName");
    const emailInput = document.getElementById("voterEmail");
    const candidateSelect = document.getElementById("candidateSelect");
    const message = document.getElementById("formMessage");
    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const candidateValue = candidateSelect.value;
    if (!name || !email || !candidateValue || !isCandidate(candidateValue)) {
        message.textContent = "Please fill in all fields and select a candidate.";
        message.className = "font-medium text-red-600";
        return;
    }
    const candidate = candidateValue;
    const votedEmails = loadVotedEmails();
    if (votedEmails.includes(email)) {
        message.textContent = "This email has already voted.";
        message.className = "font-medium text-red-600";
        return;
    }
    const votes = loadVotes();
    votes[candidate] = (votes[candidate] ?? 0) + 1;
    saveVotes(votes);
    votedEmails.push(email);
    saveVotedEmails(votedEmails);
    result.poll = { ...votes };
    result.total = Object.values(votes).reduce((sum, v) => sum + v, 0);
    result.winner = (votes.Lilian > votes.Victor) ? 'Lilian' : 'Victor';
    updateCounters();
    message.textContent = `Thank you, ${name}! Your vote for ${candidate} has been recorded.`;
    message.className = "font-medium text-green-600";
    document.getElementById("voteForm").reset();
}
const voteForm = document.getElementById("voteForm");
if (voteForm) {
    voteForm.addEventListener("submit", handleSubmit);
}
function showResults() {
    const votes = loadVotes();
    const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);
    const resultsList = document.getElementById("resultsList");
    resultsList.innerHTML = "";
    candidates.forEach(candidate => {
        const count = votes[candidate] ?? 0;
        const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
        const row = document.createElement("div");
        row.innerHTML = `
      <div class="flex justify-between mb-1">
        <span class="font-semibold">${candidate}</span>
        <span>${count} votes (${percent}%)</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div class="bg-blue-600 h-3 rounded-full" style="width: ${percent}%"></div>
      </div>
    `;
        resultsList.appendChild(row);
    });
    document.getElementById("resultsSection")?.classList.remove("hidden");
    document.getElementById("resultsSection")?.scrollIntoView({ behavior: "smooth" });
}
updateCounters();
//# sourceMappingURL=election.js.map