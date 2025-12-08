;; STATE.scm - Eclexia Playground Project State
;; Format: Guile Scheme (homoiconic, human-readable)
;; Reference: https://github.com/hyperpolymath/state.scm

;;; ============================================================
;;; METADATA
;;; ============================================================

(define-module (eclexia state)
  #:export (state))

(define metadata
  '((format-version . "1.0.0")
    (created . "2025-12-08T00:00:00Z")
    (updated . "2025-12-08T00:00:00Z")
    (project-name . "eclexia-playground")
    (project-version . "0.1.0")))

;;; ============================================================
;;; CURRENT POSITION
;;; ============================================================

(define current-position
  '((summary . "Core language implementation complete, runtime debugging needed")

    (completed-components
      (lexer
        (status . "complete")
        (output . "12,148 lines compiled JS")
        (features . ("tokenization" "keywords" "currency-units" "time-units" "operators" "comments")))

      (parser
        (status . "partial")
        (output . "10,074 lines compiled JS")
        (features . ("recursive-descent" "expressions" "statements"))
        (missing . ("full-agent-declarations" "market-declarations" "policy-declarations")))

      (runtime
        (status . "partial")
        (output . "26,095 lines compiled JS")
        (features . ("environments" "expressions" "statements" "scoping"))
        (issue . "_param undefined error in compiled Lexer"))

      (api
        (status . "complete")
        (output . "1,546 lines compiled JS")
        (features . ("compile" "run" "error-handling")))

      (stdlib
        (status . "disabled")
        (reason . "array access pattern issues in ReScript 11")
        (file . "Stdlib.res.skip")))

    (infrastructure
      (rsr-compliance . "silver")
      (build-system . "just + npm (rescript)")
      (runtime-target . "deno")
      (ci-cd . "gitlab-ci + github-actions")
      (documentation . "comprehensive"))

    (metrics
      (total-compiled-js . "~50,000 lines")
      (rescript-modules . 6)
      (example-programs . 4)
      (just-recipes . "50+"))))

;;; ============================================================
;;; ROUTE TO MVP v1
;;; ============================================================

(define mvp-v1-route
  '((target-version . "1.0.0")
    (current-version . "0.1.0")
    (completion-estimate . "35%")

    (phase-1-foundation
      (status . "in-progress")
      (completion . "80%")
      (tasks
        (("Fix _param undefined runtime error" . "critical")
         ("Re-enable Stdlib.res with ReScript 11 fixes" . "high")
         ("Test execution on Deno runtime" . "high")
         ("Complete basic expression evaluation" . "medium"))))

    (phase-2-economics-core
      (status . "pending")
      (completion . "0%")
      (tasks
        (("Implement agent declaration and execution" . "critical")
         ("Implement good/commodity tracking" . "critical")
         ("Implement market simulation basics" . "high")
         ("Implement policy modeling" . "high")
         ("Add currency arithmetic operations" . "medium")
         ("Add time-series data support" . "medium"))))

    (phase-3-stdlib
      (status . "pending")
      (completion . "0%")
      (tasks
        (("Complete economics function library" . "high")
         ("presentValue, futureValue, npv, irr" . "high")
         ("Utility theory functions" . "medium")
         ("Statistical functions" . "medium")
         ("Array/string operations" . "low"))))

    (phase-4-tooling
      (status . "pending")
      (completion . "0%")
      (tasks
        (("WASM compilation target" . "high")
         ("Language Server Protocol (LSP)" . "medium")
         ("Debugger with time-travel" . "low")
         ("Interactive playground" . "medium"))))

    (phase-5-release
      (status . "pending")
      (completion . "0%")
      (tasks
        (("Comprehensive test suite" . "critical")
         ("API documentation" . "high")
         ("Language reference" . "high")
         ("Tutorials and examples" . "medium")
         ("Performance benchmarks" . "medium"))))))

;;; ============================================================
;;; KNOWN ISSUES
;;; ============================================================

(define known-issues
  '((critical
      (("RUNTIME-001"
        (title . "_param undefined error in compiled Lexer")
        (description . "Compiled Lexer.js throws undefined _param error at runtime")
        (file . "src/Lexer.js")
        (cause . "ReScript 11 API compatibility issue during compilation")
        (impact . "Blocks all program execution")
        (status . "open"))))

    (high
      (("STDLIB-001"
        (title . "Stdlib.res disabled due to array access patterns")
        (description . "Array indexing patterns incompatible with ReScript 11")
        (file . "src/Stdlib.res.skip")
        (impact . "No standard library functions available")
        (status . "workaround-applied"))

       ("PARSER-001"
        (title . "Incomplete AST node implementations")
        (description . "Agent, Market, Policy declarations return placeholder AST")
        (impact . "Cannot parse domain-specific constructs")
        (status . "open"))))

    (medium
      (("TEST-001"
        (title . "No automated test suite")
        (description . "Unit and integration tests not yet implemented")
        (impact . "Cannot verify correctness automatically")
        (status . "open"))

       ("DOC-001"
        (title . "No language reference documentation")
        (description . "Formal language specification not written")
        (impact . "Users cannot learn language semantics")
        (status . "open"))))))

;;; ============================================================
;;; QUESTIONS FOR MAINTAINER
;;; ============================================================

(define questions-for-maintainer
  '((architecture
      ("Should we prioritize WASM target or LSP first for 0.2.0?")
      ("Is the ReScript + Deno architecture preferred, or should we consider alternatives?")
      ("Should compiled .js files remain in git, or use build-on-demand?"))

    (economics-domain
      ("Which economic modeling paradigm to prioritize: agent-based, equilibrium, or both?")
      ("Should currency operations enforce same-currency arithmetic, or allow conversion?")
      ("What level of precision for financial calculations (float64 vs BigDecimal)?"))

    (tooling
      ("Preferred test framework: Deno's built-in, or external (e.g., Jest)?")
      ("Should we support Node.js as secondary runtime, or Deno-only?")
      ("Interest in web-based playground/IDE integration?"))

    (governance
      ("Timeline expectations for 1.0 release?")
      ("Priority order for Gold-level RSR requirements?")
      ("Plans for growing contributor base?")))

;;; ============================================================
;;; LONG-TERM ROADMAP
;;; ============================================================

(define long-term-roadmap
  '((version-0-2-0
      (codename . "Foundations")
      (focus . "Runtime stability and basic economics")
      (deliverables
        ("Working lexer/parser/runtime pipeline")
        ("Basic agent and market declarations")
        ("Currency and quantity arithmetic")
        ("Unit test coverage >80%")
        ("WASM compilation (experimental)")))

    (version-0-3-0
      (codename . "Tooling")
      (focus . "Developer experience")
      (deliverables
        ("Language Server Protocol implementation")
        ("VS Code extension")
        ("Interactive REPL improvements")
        ("Error messages with suggestions")
        ("Performance profiling")))

    (version-0-4-0
      (codename . "Economics")
      (focus . "Domain-specific features")
      (deliverables
        ("Complete economics stdlib")
        ("Agent-based modeling primitives")
        ("Market equilibrium calculations")
        ("Policy simulation framework")
        ("Time-series data structures")))

    (version-0-5-0
      (codename . "Scale")
      (focus . "Performance and deployment")
      (deliverables
        ("Optimized WASM runtime")
        ("Parallel simulation execution")
        ("Cloud deployment support")
        ("Jupyter notebook integration")
        ("Visualization exports")))

    (version-1-0-0
      (codename . "Release")
      (focus . "Production readiness")
      (deliverables
        ("Stable API commitment")
        ("Comprehensive documentation")
        ("Tutorial series")
        ("Production usage examples")
        ("LTS support policy")
        ("RSR Gold compliance")))))

;;; ============================================================
;;; PROJECT CATALOG
;;; ============================================================

(define project-catalog
  '((eclexia-core
      (status . "in-progress")
      (completion . 35)
      (category . "language")
      (phase . "foundation")
      (dependencies . ())
      (next-action . "Fix _param runtime error in Lexer.js"))

    (eclexia-stdlib
      (status . "blocked")
      (completion . 20)
      (category . "library")
      (phase . "foundation")
      (dependencies . ("eclexia-core"))
      (blocker . "ReScript 11 array access patterns")
      (next-action . "Migrate to Belt/Js.Array2 APIs"))

    (eclexia-wasm
      (status . "pending")
      (completion . 0)
      (category . "tooling")
      (phase . "scale")
      (dependencies . ("eclexia-core" "eclexia-stdlib"))
      (next-action . "Research AssemblyScript integration"))

    (eclexia-lsp
      (status . "pending")
      (completion . 0)
      (category . "tooling")
      (phase . "tooling")
      (dependencies . ("eclexia-core"))
      (next-action . "Evaluate LSP libraries for Deno"))

    (eclexia-playground
      (status . "pending")
      (completion . 0)
      (category . "web")
      (phase . "tooling")
      (dependencies . ("eclexia-core" "eclexia-wasm"))
      (next-action . "Design web playground architecture"))

    (rsr-gold
      (status . "pending")
      (completion . 0)
      (category . "governance")
      (phase . "release")
      (dependencies . ("eclexia-core"))
      (next-action . "Set up dependency scanning"))))

;;; ============================================================
;;; CRITICAL NEXT ACTIONS
;;; ============================================================

(define critical-next-actions
  '(("Fix _param undefined runtime error"
     (priority . 1)
     (category . "bug")
     (project . "eclexia-core")
     (description . "Debug and fix the _param error in compiled Lexer.js to unblock execution"))

    ("Re-enable Stdlib.res"
     (priority . 2)
     (category . "refactor")
     (project . "eclexia-stdlib")
     (description . "Convert array operations to ReScript 11 compatible APIs"))

    ("Test full execution pipeline"
     (priority . 3)
     (category . "test")
     (project . "eclexia-core")
     (description . "Run example .ecx files through full lexer->parser->runtime pipeline"))

    ("Write unit tests for Lexer"
     (priority . 4)
     (category . "test")
     (project . "eclexia-core")
     (description . "Create test suite covering tokenization edge cases"))

    ("Implement agent declarations"
     (priority . 5)
     (category . "feature")
     (project . "eclexia-core")
     (description . "Complete parser and runtime support for agent {} blocks"))))

;;; ============================================================
;;; SESSION CONTEXT
;;; ============================================================

(define session-context
  '((conversation-id . "013yuhoSV4w8NNB2hfrmj3sx")
    (branch . "claude/create-state-scm-013yuhoSV4w8NNB2hfrmj3sx")
    (task . "Create STATE.scm checkpoint file")
    (started . "2025-12-08")
    (previous-sessions
      (("claude/rsr-silver-compliance-01Pg9Ae9PCBDWs2B1RXEnN9J"
        (focus . "RSR Silver compliance achievement")
        (outcome . "Implemented core language, achieved RSR Silver"))))))

;;; ============================================================
;;; EXPORT STATE
;;; ============================================================

(define state
  `((metadata . ,metadata)
    (current-position . ,current-position)
    (mvp-v1-route . ,mvp-v1-route)
    (known-issues . ,known-issues)
    (questions . ,questions-for-maintainer)
    (roadmap . ,long-term-roadmap)
    (projects . ,project-catalog)
    (next-actions . ,critical-next-actions)
    (session . ,session-context)))

;; End of STATE.scm
