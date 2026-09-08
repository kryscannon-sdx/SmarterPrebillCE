(function () {
  "use strict";

  const worklistApi = window.SPBWorklist;
  const HIGHLIGHT_DELAY = 4500;

  const TRAINING_COPY = {
    intro:
      "The directions for each step will appear in the instructions panel on the left as you move through the SmarterPrebill simulation.",
    pendingTitle: "Pending is your starting point",
    pending: [
      "The Pending worklist shows open cases that are ready for your team to work, including cases that haven’t yet been assigned to a specific reviewer.",
      "Think of it as your team’s case inbox."
    ],
    pendingNext: "Next, select My Cases.",
    myCasesTitle: "My Cases",
    myCases: [
      "This view shows open cases that are specifically assigned to you.",
      "It’s empty right now because nothing has been assigned yet. You’ll get a chance to practice assigning a case later in the course."
    ],
    myCasesNext: "Next, select Query Sent.",
    queryTitle: "Query Sent",
    query: [
      "This view shows cases where a query has been sent to the physician.",
      "You may see cases that are waiting for a response, as well as cases where a response has been received and the review still needs to be finalized."
    ],
    queryNext: "Next, select All Cases.",
    allTitle: "All Cases",
    all: [
      "This is the broadest view. It includes cases across teams and statuses, including cases that have already been finalized.",
      "If you need to look back at an older case to see what happened, who worked it, or when it was completed, All Cases is a good place to start."
    ],
    checkTitle: "One last step",
    check: ["You’re back on Pending, your usual starting point."],
    checkNext:
      "To complete the activity, select the worklist you would use to find a case that has already been finalized.",
    recoverTitle: "Not quite",
    recoverPending: "For this step, select My Cases.",
    recoverMyCases: "For this step, select Query Sent.",
    recoverAllCases: "For this step, select All Cases.",
    recoverCheck:
      "Try the worklist that keeps cases available across statuses, including cases that have already been finalized.",
    completeTitle: "Nice work!",
    complete:
      "You’ve explored the four SmarterPrebill worklists and know where to look as cases move through the review process."
  };

  const PROGRESS_STEPS = ["Pending", "My Cases", "Query Sent", "All Cases"];

  const STATES = {
    ORIENTING: "orienting",
    PENDING: "pending",
    MY_CASES: "myCases",
    QUERY_SENT: "querySent",
    ALL_CASES: "allCases",
    QUICK_CHECK: "quickCheck",
    COMPLETE: "complete"
  };

  const EXPECTED = {
    pending: "myCases",
    myCases: "querySent",
    querySent: "allCases",
    quickCheck: "allCases"
  };

  const state = {
    phase: STATES.ORIENTING,
    overlay: "orient",
    targetVisible: false,
    tabCuePulse: false,
    worklist: worklistApi.createWorklistState("pending")
  };

  const els = {
    intro: document.getElementById("activity-intro"),
    taskBox: document.getElementById("task-box"),
    taskBadge: document.getElementById("task-step-badge"),
    taskHeading: document.getElementById("task-heading"),
    taskText: document.getElementById("task-text"),
    actions: document.getElementById("guidance-actions"),
    progress: document.getElementById("progress-list"),
    tabs: document.getElementById("worklist-tabs"),
    filterBar: document.getElementById("filter-bar"),
    worklist: document.getElementById("worklist"),
    userName: document.getElementById("product-user-name"),
    live: document.getElementById("sr-live"),
    simulator: document.getElementById("simulator-panel"),
    productApp: document.getElementById("product-app"),
    overlay: document.getElementById("training-overlay"),
    overlayCard: document.getElementById("training-confirm-card"),
    overlayTitle: document.getElementById("overlay-title"),
    overlayBody: document.getElementById("overlay-body"),
    overlayAction: document.getElementById("overlay-action"),
    orientOverlay: document.getElementById("orient-overlay"),
    orientAction: document.getElementById("orient-action")
  };

  let cueTimer = null;
  let pulseTimer = null;

  function announce(text) {
    els.live.textContent = "";
    window.setTimeout(function () {
      els.live.textContent = text;
    }, 50);
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function clearTimers() {
    if (cueTimer) {
      window.clearTimeout(cueTimer);
      cueTimer = null;
    }
    if (pulseTimer) {
      window.clearTimeout(pulseTimer);
      pulseTimer = null;
    }
  }

  function currentProgressIndex() {
    if (state.phase === STATES.ORIENTING || state.phase === STATES.PENDING) {
      return 0;
    }
    if (state.phase === STATES.MY_CASES) {
      return 1;
    }
    if (state.phase === STATES.QUERY_SENT) {
      return 2;
    }
    return 3;
  }

  function tourComplete() {
    return (
      state.phase === STATES.QUICK_CHECK ||
      state.phase === STATES.COMPLETE
    );
  }

  function highlightAllChoices() {
    return state.phase === STATES.QUICK_CHECK && state.targetVisible;
  }

  function targetWorklistId() {
    if (!state.targetVisible || highlightAllChoices()) {
      return null;
    }
    if (state.phase === STATES.PENDING) {
      return "myCases";
    }
    if (state.phase === STATES.MY_CASES) {
      return "querySent";
    }
    if (state.phase === STATES.QUERY_SENT) {
      return "allCases";
    }
    return null;
  }

  function appendParagraphs(container, lines, lastClassName) {
    lines.forEach(function (line, index) {
      const p = document.createElement("p");
      if (lastClassName && index === lines.length - 1) {
        p.className = lastClassName;
      }
      p.textContent = line;
      container.appendChild(p);
    });
  }

  function renderGuidance() {
    els.intro.textContent = TRAINING_COPY.intro;
    els.actions.innerHTML = "";
    els.taskText.textContent = "";
    els.taskBox.classList.toggle("is-check", state.phase === STATES.QUICK_CHECK);
    els.taskBox.classList.toggle("is-complete", state.phase === STATES.COMPLETE);

    if (state.phase === STATES.ORIENTING || state.phase === STATES.PENDING) {
      els.taskBadge.textContent = "1";
      els.taskHeading.textContent = TRAINING_COPY.pendingTitle;
      appendParagraphs(els.taskText, TRAINING_COPY.pending);
      appendParagraphs(els.taskText, [TRAINING_COPY.pendingNext], "task-next");
    } else if (state.phase === STATES.MY_CASES) {
      els.taskBadge.textContent = "2";
      els.taskHeading.textContent = TRAINING_COPY.myCasesTitle;
      appendParagraphs(els.taskText, TRAINING_COPY.myCases);
      appendParagraphs(els.taskText, [TRAINING_COPY.myCasesNext], "task-next");
    } else if (state.phase === STATES.QUERY_SENT) {
      els.taskBadge.textContent = "3";
      els.taskHeading.textContent = TRAINING_COPY.queryTitle;
      appendParagraphs(els.taskText, TRAINING_COPY.query);
      appendParagraphs(els.taskText, [TRAINING_COPY.queryNext], "task-next");
    } else if (state.phase === STATES.QUICK_CHECK) {
      els.taskBadge.textContent = "!";
      els.taskHeading.textContent = TRAINING_COPY.checkTitle;
      appendParagraphs(els.taskText, TRAINING_COPY.check);
      appendParagraphs(els.taskText, [TRAINING_COPY.checkNext], "task-next");
    } else {
      els.taskBadge.textContent = state.phase === STATES.COMPLETE ? "✓" : "4";
      els.taskHeading.textContent = TRAINING_COPY.allTitle;
      appendParagraphs(els.taskText, TRAINING_COPY.all);
    }

    if (state.phase === STATES.ALL_CASES) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "guidance-btn";
      button.textContent = "Continue";
      button.addEventListener("click", beginQuickCheck);
      els.actions.appendChild(button);
    }

    renderProgress();
  }

  function renderProgress() {
    const current = currentProgressIndex();
    const complete = tourComplete();
    els.progress.innerHTML = "";

    PROGRESS_STEPS.forEach(function (label, index) {
      const item = document.createElement("li");
      item.className = "progress-item";
      if (complete || index < current) {
        item.classList.add("is-complete");
      } else if (index === current) {
        item.classList.add("is-current");
        item.setAttribute("aria-current", "step");
      }

      const dot = document.createElement("span");
      dot.className = "progress-dot";
      dot.setAttribute("aria-hidden", "true");

      const text = document.createElement("span");
      text.textContent = index + 1 + ". " + label;

      item.appendChild(dot);
      item.appendChild(text);
      els.progress.appendChild(item);
    });
  }

  function patientIcon() {
    return (
      '<svg class="patient-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
      '<circle cx="12" cy="8" r="3.2" fill="currentColor"/>' +
      '<path d="M5.5 19c.8-4 4-6 6.5-6s5.7 2 6.5 6" fill="currentColor"/>' +
      "</svg>"
    );
  }

  function metaBlock(caseData) {
    return (
      '<div class="patient-meta">' +
      "<div>Account ID: " + caseData.accountId + "</div>" +
      "<div>MRN: " + caseData.mrn + "</div>" +
      "<div>Visit ID: " + caseData.visitId + "</div>" +
      "<div>Discharged: " + caseData.discharged + "</div>" +
      "<div>Location: " + caseData.location + "</div>" +
      "<div>Total Charges: " + caseData.charges + "</div>" +
      "</div>"
    );
  }

  function renderTabs() {
    const targetId = targetWorklistId();
    const highlightAll = highlightAllChoices();
    els.tabs.textContent = "";

    worklistApi.WORKLIST_IDS.forEach(function (id) {
      const meta = worklistApi.getWorklist(id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "worklist-tab";
      button.id = "tab-" + id;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", id === state.worklist.activeWorklist ? "true" : "false");
      button.dataset.worklist = id;
      button.textContent = meta.label + " (" + meta.count + ")";

      if (id === state.worklist.activeWorklist) {
        button.classList.add("is-active");
      }
      if (highlightAll || targetId === id) {
        button.classList.add("is-training-target");
        if (state.tabCuePulse) {
          button.classList.add("is-pulsing");
        }
      }

      button.addEventListener("click", function () {
        onWorklistSelect(id);
      });

      els.tabs.appendChild(button);
    });
  }

  function renderFilterBar() {
    const meta = worklistApi.getWorklist(state.worklist.activeWorklist);
    const assigned = meta.assignedToIsFilter
      ? 'Assigned to <strong>' + meta.assignedTo + '</strong><span class="chevron"></span>'
      : "Assigned to " + meta.assignedTo;

    els.filterBar.innerHTML =
      '<div class="filter-left">' +
      '<span class="filter-assigned">' + assigned + "</span>" +
      '<span class="filter-count">' + meta.casesInView + " Cases in View</span>" +
      "</div>" +
      '<div class="filter-right">' +
      '<span class="star-icon" aria-hidden="true">☆</span>' +
      '<span class="filter-chip">Status <span class="chevron"></span></span>' +
      '<span class="filter-chip">Impact <span class="chevron"></span></span>' +
      '<span class="filter-chip"><span class="filter-sort-icon" aria-hidden="true"></span> Discharge Date <span class="chevron"></span></span>' +
      '<span class="set-default">' +
      '<span class="set-default-label">Set Default</span>' +
      '<span class="set-default-caret" aria-hidden="true"></span>' +
      "</span>" +
      "</div>";
  }

  function renderEmptyState(message) {
    els.worklist.innerHTML =
      '<div class="empty-state">' +
      '<div class="empty-check" aria-hidden="true">' +
      '<svg viewBox="0 0 80 80" focusable="false">' +
      '<circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" stroke-width="5"/>' +
      '<path d="M26 42 L35 51 L55 29" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
      "</svg>" +
      "</div>" +
      '<p class="empty-message">' + message + "</p>" +
      "</div>";
  }

  function renderCard(caseData) {
    const card = document.createElement("article");
    card.className = "case-card";
    card.dataset.caseId = caseData.id;

    const left = document.createElement("div");
    left.innerHTML =
      '<p class="patient-name">' + patientIcon() + caseData.patientName + "</p>" + metaBlock(caseData);

    const tags = caseData.tags
      .map(function (tag) {
        return '<span class="tag tag-' + tag.type + '">' + tag.label + "</span>";
      })
      .join("");

    const statusDate = caseData.statusDate
      ? '<span class="status-date">' + caseData.statusDate + "</span>"
      : "";
    const visitLink = caseData.showVisitLink
      ? '<span class="product-link"><span class="info-icon">i</span>Show all cases for this patient visit</span>'
      : "";

    const middle = document.createElement("div");
    middle.innerHTML =
      '<div class="status-row">' +
      '<span class="status-badge ' + caseData.statusClass + '">' + caseData.status + "</span>" +
      statusDate +
      "</div>" +
      '<p class="diagnosis">' + caseData.diagnosis + "</p>" +
      (tags ? '<div class="clinical-tags">' + tags + "</div>" : "") +
      visitLink;

    const unassigned = caseData.reviewer === "unassigned";
    const right = document.createElement("div");
    right.innerHTML =
      '<div class="assignment-row">' +
      '<div class="reviewer-field">' +
      '<span class="reviewer-label">Reviewer</span>' +
      '<div class="static-reviewer' + (unassigned ? " is-unassigned" : "") + '">' +
      '<span class="reviewer-value">' + caseData.reviewer + "</span>" +
      '<span class="chevron"></span>' +
      "</div>" +
      "</div>" +
      '<button type="button" class="review-btn" tabindex="-1" aria-disabled="true">Review</button>' +
      "</div>" +
      '<div class="assignment-meta">' +
      "<div>Assigned to " + caseData.assignedTeam + "</div>" +
      '<div>' + caseData.activity + ' • <span class="product-link">All Activity</span></div>' +
      "</div>";

    card.appendChild(left);
    card.appendChild(middle);
    card.appendChild(right);
    return card;
  }

  function renderWorklist() {
    const meta = worklistApi.getWorklist(state.worklist.activeWorklist);
    renderTabs();
    renderFilterBar();

    if (meta.empty) {
      renderEmptyState(meta.emptyMessage);
      return;
    }

    const cases = worklistApi.getVisibleCases(state.worklist);
    els.worklist.innerHTML = "";
    cases.forEach(function (caseData) {
      els.worklist.appendChild(renderCard(caseData));
    });
  }

  function revealTargetHighlight() {
    state.targetVisible = true;
    if (!prefersReducedMotion()) {
      state.tabCuePulse = true;
    }
    renderTabs();
    if (state.tabCuePulse) {
      pulseTimer = window.setTimeout(function () {
        state.tabCuePulse = false;
        document.querySelectorAll(".worklist-tab.is-training-target").forEach(function (target) {
          target.classList.remove("is-pulsing");
        });
      }, 800);
    }
  }

  function focusTargetTab() {
    const targetId = targetWorklistId();
    if (!targetId) {
      return;
    }
    const button = document.getElementById("tab-" + targetId);
    if (button) {
      button.focus();
    }
  }

  function scheduleTabCue() {
    clearTimers();
    state.targetVisible = false;
    state.tabCuePulse = false;
    renderTabs();
    cueTimer = window.setTimeout(function () {
      revealTargetHighlight();
    }, HIGHLIGHT_DELAY);
  }

  function fillOverlayBody(lines) {
    els.overlayBody.textContent = "";
    lines.forEach(function (line) {
      const p = document.createElement("p");
      p.textContent = line;
      els.overlayBody.appendChild(p);
    });
  }

  function showTrainingOverlay(kind) {
    state.overlay = kind;
    els.overlayCard.classList.remove("is-success", "is-recover", "is-explain");
    els.overlayAction.classList.remove("is-success", "is-recover", "is-explain");
    els.overlayTitle.textContent = "";

    if (kind === "complete") {
      els.overlayCard.classList.add("is-success");
      els.overlayAction.classList.add("is-success");
      const icon = document.createElement("span");
      icon.className = "success-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "✓";
      els.overlayTitle.appendChild(icon);
      els.overlayTitle.appendChild(document.createTextNode(TRAINING_COPY.completeTitle));
      fillOverlayBody([TRAINING_COPY.complete]);
      els.overlayAction.textContent = "Start Over";
    } else {
      els.overlayCard.classList.add("is-recover");
      els.overlayAction.classList.add("is-recover");
      els.overlayTitle.textContent = TRAINING_COPY.recoverTitle;
      if (kind === "recoverCheck") {
        fillOverlayBody([TRAINING_COPY.recoverCheck]);
      } else if (kind === "recoverPending") {
        fillOverlayBody([TRAINING_COPY.recoverPending]);
      } else if (kind === "recoverAllCases") {
        fillOverlayBody([TRAINING_COPY.recoverAllCases]);
      } else {
        fillOverlayBody([TRAINING_COPY.recoverMyCases]);
      }
      els.overlayAction.textContent = "Try Again";
    }

    els.overlay.hidden = false;
    els.productApp.setAttribute("aria-hidden", "true");
    els.overlayAction.focus();
  }

  function hideTrainingOverlay() {
    state.overlay = null;
    els.overlay.hidden = true;
    els.overlayTitle.textContent = "";
    els.overlayBody.textContent = "";
    els.productApp.removeAttribute("aria-hidden");
  }

  function onWorklistSelect(id) {
    if (
      state.overlay ||
      state.phase === STATES.ORIENTING ||
      state.phase === STATES.ALL_CASES ||
      state.phase === STATES.COMPLETE
    ) {
      return;
    }

    if (state.phase === STATES.PENDING) {
      if (id === EXPECTED.pending) {
        goToMyCases();
        return;
      }
      showTrainingOverlay("recoverPending");
      announce(TRAINING_COPY.recoverTitle + " " + TRAINING_COPY.recoverPending);
      return;
    }

    if (state.phase === STATES.MY_CASES) {
      if (id === EXPECTED.myCases) {
        goToQuerySent();
        return;
      }
      showTrainingOverlay("recoverMyCases");
      announce(TRAINING_COPY.recoverTitle + " " + TRAINING_COPY.recoverMyCases);
      return;
    }

    if (state.phase === STATES.QUERY_SENT) {
      if (id === EXPECTED.querySent) {
        goToAllCases();
        return;
      }
      showTrainingOverlay("recoverAllCases");
      announce(TRAINING_COPY.recoverTitle + " " + TRAINING_COPY.recoverAllCases);
      return;
    }

    if (state.phase === STATES.QUICK_CHECK) {
      if (id === EXPECTED.quickCheck) {
        completeActivity();
        return;
      }
      showTrainingOverlay("recoverCheck");
      announce(TRAINING_COPY.recoverTitle + " " + TRAINING_COPY.recoverCheck);
    }
  }

  function goToMyCases() {
    clearTimers();
    state.phase = STATES.MY_CASES;
    state.targetVisible = false;
    worklistApi.setActiveWorklist(state.worklist, "myCases");
    renderAll();
    announce(TRAINING_COPY.myCasesTitle + ". " + TRAINING_COPY.myCasesNext);
    scheduleTabCue();
  }

  function goToQuerySent() {
    clearTimers();
    state.phase = STATES.QUERY_SENT;
    state.targetVisible = false;
    worklistApi.setActiveWorklist(state.worklist, "querySent");
    renderAll();
    announce(TRAINING_COPY.queryTitle + ". " + TRAINING_COPY.queryNext);
    scheduleTabCue();
  }

  function goToAllCases() {
    clearTimers();
    state.phase = STATES.ALL_CASES;
    state.targetVisible = false;
    worklistApi.setActiveWorklist(state.worklist, "allCases");
    renderAll();
    announce(TRAINING_COPY.allTitle + ". " + TRAINING_COPY.all.join(" "));
    const continueBtn = els.actions.querySelector("button");
    if (continueBtn) {
      continueBtn.focus();
    }
  }

  function beginQuickCheck() {
    if (state.phase !== STATES.ALL_CASES && state.phase !== STATES.QUICK_CHECK) {
      return;
    }
    hideTrainingOverlay();
    clearTimers();
    state.phase = STATES.QUICK_CHECK;
    state.targetVisible = true;
    worklistApi.setActiveWorklist(state.worklist, "pending");
    els.simulator.classList.remove("is-deemphasized");
    if (!prefersReducedMotion()) {
      state.tabCuePulse = true;
    }
    renderAll();
    if (state.tabCuePulse) {
      pulseTimer = window.setTimeout(function () {
        state.tabCuePulse = false;
        document.querySelectorAll(".worklist-tab.is-training-target").forEach(function (target) {
          target.classList.remove("is-pulsing");
        });
      }, 800);
    }
    announce(TRAINING_COPY.checkTitle + " " + TRAINING_COPY.check.join(" ") + " " + TRAINING_COPY.checkNext);
    const firstTab = document.getElementById("tab-myCases");
    if (firstTab) {
      firstTab.focus();
    }
  }

  function completeActivity() {
    if (state.phase !== STATES.QUICK_CHECK) {
      return;
    }
    clearTimers();
    state.phase = STATES.COMPLETE;
    state.targetVisible = false;
    worklistApi.setActiveWorklist(state.worklist, "allCases");
    els.simulator.classList.add("is-deemphasized");
    renderAll();
    showTrainingOverlay("complete");
    announce(TRAINING_COPY.completeTitle + " " + TRAINING_COPY.complete);
  }

  function dismissRecovery() {
    hideTrainingOverlay();
    if (state.phase === STATES.QUICK_CHECK) {
      beginQuickCheck();
      return;
    }

    state.targetVisible = true;
    renderWorklist();
    focusTargetTab();
  }

  function showOrientOverlay() {
    state.overlay = "orient";
    state.phase = STATES.ORIENTING;
    els.orientOverlay.hidden = false;
    document.querySelector(".training-app").setAttribute("aria-hidden", "true");
    els.orientAction.focus();
  }

  function hideOrientOverlay() {
    els.orientOverlay.hidden = true;
    document.querySelector(".training-app").removeAttribute("aria-hidden");
    if (state.overlay === "orient") {
      state.overlay = null;
    }
  }

  function startActivity() {
    hideOrientOverlay();
    state.phase = STATES.PENDING;
    state.targetVisible = false;
    worklistApi.setActiveWorklist(state.worklist, "pending");
    renderAll();
    announce(TRAINING_COPY.pendingTitle + " " + TRAINING_COPY.pendingNext);
    scheduleTabCue();
  }

  function resetActivity() {
    clearTimers();
    hideTrainingOverlay();
    els.simulator.classList.remove("is-deemphasized");
    state.phase = STATES.ORIENTING;
    state.targetVisible = false;
    state.tabCuePulse = false;
    state.worklist = worklistApi.createWorklistState("pending");
    els.live.textContent = "";
    renderAll();
    showOrientOverlay();
    announce("Activity reset. Start with your worklist.");
  }

  function renderAll() {
    els.userName.textContent = worklistApi.CURRENT_USER;
    renderGuidance();
    renderWorklist();
  }

  els.overlay.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      event.preventDefault();
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      els.overlayAction.focus();
    }
  });

  els.overlayAction.addEventListener("click", function () {
    if (state.overlay === "complete") {
      resetActivity();
      return;
    }
    if (
      state.overlay === "recoverPending" ||
      state.overlay === "recoverMyCases" ||
      state.overlay === "recoverAllCases" ||
      state.overlay === "recoverCheck"
    ) {
      dismissRecovery();
    }
  });

  els.orientOverlay.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      event.preventDefault();
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      els.orientAction.focus();
    }
  });

  els.orientAction.addEventListener("click", startActivity);

  renderAll();
  showOrientOverlay();
})();
