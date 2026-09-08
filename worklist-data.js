/* Reusable SmarterPrebill worklist foundation.
   Future topics (Search, Filtering, Sorting, Saved/default views) should
   extend this state and case data rather than rewriting the product shell. */
(function (global) {
  "use strict";

  const CURRENT_USER = "You";

  const WORKLIST_IDS = ["myCases", "pending", "querySent", "allCases"];

  const WORKLISTS = {
    pending: {
      id: "pending",
      label: "Pending",
      count: 35,
      assignedTo: "Anyone",
      assignedToIsFilter: true,
      casesInView: 35,
      empty: false
    },
    myCases: {
      id: "myCases",
      label: "My Cases",
      count: 0,
      assignedTo: "Me",
      assignedToIsFilter: false,
      casesInView: 0,
      empty: true,
      emptyMessage: "You're all caught up!"
    },
    querySent: {
      id: "querySent",
      label: "Query Sent",
      count: 5,
      assignedTo: "Anyone",
      assignedToIsFilter: true,
      casesInView: 5,
      empty: false
    },
    allCases: {
      id: "allCases",
      label: "All Cases",
      count: 51,
      assignedTo: "Anyone",
      assignedToIsFilter: true,
      casesInView: 51,
      empty: false
    }
  };

  const CASES_BY_WORKLIST = {
    pending: [
      {
        id: "pending-00000004",
        patientName: "Tommy Manavendra",
        accountId: "00000004",
        mrn: "00000004",
        visitId: "00000004",
        discharged: "2022-02-01",
        location: "Demo Facility",
        charges: "-",
        status: "Documentation Updated",
        statusClass: "status-teal",
        diagnosis: "Acute kidney failure, unspecified (N179)",
        tags: [
          { label: "DRG", type: "drg" },
          { label: "POA", type: "poa" },
          { label: "ROM", type: "rom" }
        ],
        showVisitLink: true,
        reviewer: "unassigned",
        assignedTeam: "Coding",
        activity: "Documentation updated Sep 7, 2026 by SmarterDx"
      },
      {
        id: "pending-00000017",
        patientName: "Page Claudio",
        accountId: "00000017",
        mrn: "00000017",
        visitId: "00000017",
        discharged: "2022-02-01",
        location: "Demo Facility",
        charges: "-",
        status: "New",
        statusClass: "status-teal",
        diagnosis: "AKI clinically not supported (N179)",
        tags: [],
        showVisitLink: true,
        reviewer: "unassigned",
        assignedTeam: "CDI",
        activity: "Last activity Jun 24, 2023 by SmarterDx"
      },
      {
        id: "pending-00000020",
        patientName: "Ami No",
        accountId: "00000020",
        mrn: "00000020",
        visitId: "00000020",
        discharged: "2022-02-01",
        location: "Demo Facility",
        charges: "-",
        status: "Team Reassignment",
        statusClass: "status-teal",
        diagnosis: "Type 2 diabetes mellitus with other skin complications (E11628)",
        tags: [
          { label: "DRG", type: "drg" },
          { label: "POA", type: "poa" },
          { label: "New Principal Diagnosis", type: "npd" }
        ],
        showVisitLink: false,
        reviewer: "unassigned",
        assignedTeam: "CDI",
        activity: "Last activity Jun 26, 2025 by SmarterDx"
      }
    ],
    myCases: [],
    querySent: [
      {
        id: "query-00000009",
        patientName: "Jack Antonella",
        accountId: "00000009",
        mrn: "00000009",
        visitId: "00000009",
        discharged: "2022-02-01",
        location: "Demo Facility",
        charges: "-",
        status: "Query Sent",
        statusClass: "status-query",
        statusDate: "Wed Jul 29 2026",
        diagnosis: "ABO isoimmunization of newborn (P551)",
        tags: [
          { label: "DRG", type: "drg" },
          { label: "POA", type: "poa" }
        ],
        showVisitLink: false,
        reviewer: "demitra.frank@smarterdx.com",
        assignedTeam: "CDI",
        activity: "Last activity Sep 13, 2023 by SmarterDx"
      },
      {
        id: "query-00000011",
        patientName: "Brandy Kristen",
        accountId: "00000011",
        mrn: "00000011",
        visitId: "00000011",
        discharged: "2022-02-01",
        location: "Demo Facility",
        charges: "-",
        status: "Query Sent",
        statusClass: "status-query",
        statusDate: "Wed Feb 18 2026",
        diagnosis: "Other neonatal hypoglycemia (P704)",
        tags: [
          { label: "DRG", type: "drg" },
          { label: "POA", type: "poa" }
        ],
        showVisitLink: true,
        reviewer: "demitra.frank@smarterdx.com",
        assignedTeam: "CDI",
        activity: "Last activity Feb 14, 2024 by SmarterDx"
      },
      {
        id: "query-00000001",
        patientName: "Clarence Kuldip",
        accountId: "00000001",
        mrn: "00000001",
        visitId: "00000001",
        discharged: "2022-02-01",
        location: "Demo Facility",
        charges: "-",
        status: "Query Sent",
        statusClass: "status-query",
        statusDate: "Wed Jul 01 2026",
        diagnosis: "Secondary malignant neoplasm of brain (C7931)",
        tags: [
          { label: "DRG", type: "drg" },
          { label: "POA", type: "poa" },
          { label: "New Principal Diagnosis", type: "npd" }
        ],
        showVisitLink: false,
        reviewer: "Scott Wilson",
        assignedTeam: "CDI",
        activity: "Last activity Nov 20, 2023 by SmarterDx"
      }
    ],
    allCases: [
      {
        id: "all-00000032",
        patientName: "Robert Hastings",
        accountId: "23456789",
        mrn: "2222222",
        visitId: "00000032",
        discharged: "2026-09-13",
        location: "Demo Facility",
        charges: "-",
        status: "New",
        statusClass: "status-teal",
        diagnosis: "Bloodstream infection due to central venous catheter, initial encounter (T80211A)",
        tags: [
          { label: "Clinical Validation", type: "clinical" },
          { label: "PSI 7", type: "psi" },
          { label: "HAC 7", type: "psi" }
        ],
        showVisitLink: false,
        reviewer: "Ryan Alvarez",
        assignedTeam: "Coding",
        activity: "Last activity Sep 18, 2026"
      },
      {
        id: "all-00000036",
        patientName: "Brianna Collins",
        accountId: "HAR-00000036",
        mrn: "MRN-00000036",
        visitId: "00000036",
        discharged: "2026-05-02",
        location: "Demo Facility",
        charges: "-",
        status: "New",
        statusClass: "status-teal",
        diagnosis: "Acidosis, unspecified (E8720)",
        tags: [
          { label: "POA", type: "poa" },
          { label: "Mortality - Fluid & Electrolyte Disorders", type: "mortality" }
        ],
        showVisitLink: false,
        reviewer: "Abby Nwangwa",
        assignedTeam: "Coding",
        activity: "Last activity May 6, 2025 by Alex Banks"
      },
      {
        id: "all-00000031",
        patientName: "Eleanor Price",
        accountId: "987654321",
        mrn: "11111111",
        visitId: "00000031",
        discharged: "2026-03-23",
        location: "Demo Facility",
        charges: "-",
        status: "New",
        statusClass: "status-teal",
        diagnosis: "Other pulmonary embolism without acute cor pulmonale (I2699)",
        tags: [
          { label: "Clinical Validation", type: "clinical" },
          { label: "PSI 12", type: "psi" }
        ],
        showVisitLink: false,
        reviewer: "Alex Banks",
        assignedTeam: "CDI",
        activity: "Last activity Mar 24, 2026"
      }
    ]
  };

  function createWorklistState(activeId) {
    return {
      activeWorklist: activeId || "pending",
      searchQuery: "",
      filters: {
        assignedTo: WORKLISTS[activeId || "pending"].assignedTo,
        status: null,
        impact: null,
        sort: "Discharge Date"
      },
      defaultView: null
    };
  }

  function getWorklist(id) {
    return WORKLISTS[id];
  }

  function getVisibleCases(worklistState) {
    const id = worklistState.activeWorklist;
    return CASES_BY_WORKLIST[id] ? CASES_BY_WORKLIST[id].slice() : [];
  }

  function setActiveWorklist(worklistState, id) {
    if (!WORKLISTS[id]) {
      return worklistState;
    }
    worklistState.activeWorklist = id;
    worklistState.filters.assignedTo = WORKLISTS[id].assignedTo;
    return worklistState;
  }

  global.SPBWorklist = {
    CURRENT_USER: CURRENT_USER,
    WORKLIST_IDS: WORKLIST_IDS,
    WORKLISTS: WORKLISTS,
    CASES_BY_WORKLIST: CASES_BY_WORKLIST,
    createWorklistState: createWorklistState,
    getWorklist: getWorklist,
    getVisibleCases: getVisibleCases,
    setActiveWorklist: setActiveWorklist
  };
})(window);
