;; SPDX-License-Identifier: AGPL-3.0-or-later
;; META.scm - Project metadata and architecture decisions

(define project-meta
  `((version . "1.0.0")
    (name . "eclexia-playground")
    (architecture-decisions
      ((adr-001
         ((status . "accepted")
          (date . "2025-12-30")
          (context . "Need experimentation sandbox for Economics as Code")
          (decision . "Use RSR-compliant ReScript/Deno/Rust stack")
          (consequences . "Type-safe exploration of economic models")))))
    (development-practices
      ((code-style . "rescript-standard")
       (security . "openssf-scorecard")
       (testing . "property-based")
       (versioning . "semver")
       (documentation . "asciidoc")
       (branching . "trunk-based")))
    (design-rationale
      ((why-economics . "Economics as Code paradigm")
       (why-rescript . "Type-safe functional programming")
       (why-deno . "Modern runtime for experimentation")))))
