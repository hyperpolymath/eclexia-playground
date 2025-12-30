;; SPDX-License-Identifier: AGPL-3.0-or-later
;; AGENTIC.scm - AI agent interaction patterns

(define agentic-config
  `((version . "1.0.0")
    (project . "eclexia-playground")
    (claude-code
      ((model . "claude-opus-4-5-20251101")
       (tools . ("read" "edit" "bash" "grep" "glob"))
       (permissions . "read-all")))
    (patterns
      ((code-review . "thorough")
       (refactoring . "conservative")
       (testing . "comprehensive")
       (economics . "model-validation")))
    (constraints
      ((languages . ("rescript" "rust" "scheme"))
       (banned . ("typescript" "go" "python" "makefile"))))
    (project-specific
      ((economic-models . "require-validation")
       (policy-impact . "analyze-consequences")))))
