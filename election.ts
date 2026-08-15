type PTypes = string | number | number[] | boolean

type TCandidate = 'Lilian' | 'Victor' | 'Rita';

const candidates: TCandidate[] = ['Lilian', 'Victor', 'Rita'];
const candidate = candidates[0];

candidates.push('Rita');

const voters = [
  'Stephanie',
  'Rita',
  'James',
  'Peter',
  'Victor',
  'Anthony',
  'Charles',
  'Augustine',
  'Lillian',
  'Gabriel',
  'Christopher',
  'Kosisochukwu',
  'Bonaventure',
  'Abigail',
  'David',
  'Amarachi',
  'Loveth',
  'Chidimma',
  'Ifeanyi',
  'Majesty',
] as const;

type TVoters = typeof voters[number];
let voteCount: number = 0;

type TPoll = Record<TCandidate, number>;

const poll: TPoll = {
  'Lilian': 0,
  'Victor': 0,
  'Rita': 0,
};


interface Result {
  total: number;
  winner: TCandidate;
  poll: TPoll;
}

const result: Partial<Result> = {};

const MAX_VOTERS = 20;

const VOTES_KEY = "voting_system_votes";
const VOTED_EMAILS_KEY = "voting_system_voted_emails";

function loadVotes(): TPoll {
  const stored = localStorage.getItem(VOTES_KEY);
  if (stored) return JSON.parse(stored) as TPoll;
  return { ...poll }; // clone, don't share the reference
}

function saveVotes(votes: TPoll): void {
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

function loadVotedEmails(): string[] {
  const stored = localStorage.getItem(VOTED_EMAILS_KEY);
  return stored ? (JSON.parse(stored) as string[]) : [];
}

function saveVotedEmails(emails: string[]): void {
  localStorage.setItem(VOTED_EMAILS_KEY, JSON.stringify(emails));
}


function isCandidate(value: string): value is TCandidate {
  return (candidates as string[]).includes(value);
}



function getResult(): Partial<Result> {
  return result;
}

function getWinner(): TCandidate | undefined {
  return result.winner;
}

function checkResult(candidate: TCandidate): number | undefined {
  return result.poll?.[candidate];
}

function isVotingClosed(): boolean {
  return loadVotedEmails().length >= MAX_VOTERS;
}

function disableVoting(message: string): void {
  const messageEl = document.getElementById("formMessage") as HTMLParagraphElement;
  messageEl.textContent = message;
  messageEl.className = "font-medium text-red-600";

  const nameInput = document.getElementById("voterName") as HTMLInputElement;
  const emailInput = document.getElementById("voterEmail") as HTMLInputElement;
  const candidateSelect = document.getElementById("candidateSelect") as HTMLSelectElement;
  const submitBtn = document.querySelector('#voteForm button[type="submit"]') as HTMLButtonElement;

  nameInput.disabled = true;
  emailInput.disabled = true;
  candidateSelect.disabled = true;
  submitBtn.disabled = true;
  submitBtn.classList.add("opacity-50", "cursor-not-allowed");
  submitBtn.textContent = "Voting Closed";
}

function updateCounters(): void {
  const votes = loadVotes();
  candidates.forEach(c => {
    const el = document.getElementById(`count-${c}`);
    if (el) el.textContent = String(votes[c]);
  });
}

function handleSubmit(event: Event): void {
  event.preventDefault();

  if (isVotingClosed()) {
    disableVoting(`Voting is closed. The maximum of ${MAX_VOTERS} voters has been reached.`);
    return;
  }

  const nameInput = document.getElementById("voterName") as HTMLInputElement;
  const emailInput = document.getElementById("voterEmail") as HTMLInputElement;
  const candidateSelect = document.getElementById("candidateSelect") as HTMLSelectElement;
  const message = document.getElementById("formMessage") as HTMLParagraphElement;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const candidateValue = candidateSelect.value;

  if (!name || !email || !candidateValue || !isCandidate(candidateValue)) {
    message.textContent = "Please fill in all fields and select a candidate.";
    message.className = "font-medium text-red-600";
    return;
  }

  const candidate: TCandidate = candidateValue;

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

  (document.getElementById("voteForm") as HTMLFormElement).reset();

  // record + display the results right away after each vote
  showResults();

  // lock voting once the 20-voter cap is hit
  if (votedEmails.length >= MAX_VOTERS) {
    disableVoting(`Voting is now closed — the maximum of ${MAX_VOTERS} voters has been reached.`);
  }
}

function showResults(): void {
  const votes = loadVotes();
  const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);
  const resultsList = document.getElementById("resultsList") as HTMLDivElement;
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

// on page load: if the cap was already reached in a previous session, lock the form immediately
if (isVotingClosed()) {
  disableVoting(`Voting is closed — the maximum of ${MAX_VOTERS} voters has already voted.`);
  showResults();
}
