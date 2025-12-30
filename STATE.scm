;; SPDX-License-Identifier: AGPL-3.0-or-later
;; STATE.scm - Current project state

(state
  (version . "1.0.0")
  (phase . "active")
  (updated . "2025-12-30T18:00:00Z")

  (project
    (name . "eclexia-playground")
    (tier . "satellite")
    (license . "AGPL-3.0-or-later")
    (language . "rescript"))

  (compliance
    (rsr . #t)
    (security-hardened . #t)
    (ci-cd . #t)
    (guix-primary . #t)
    (nix-fallback . #f))

  (current-position
    ((overall-completion . 20)
     (components
       ((rsr-structure . 100)
        (rescript-setup . 30)
        (economic-models . 0)
        (tpcf-impl . 0)))
     (working-features
       ("RSR-compliant structure"
        "CI/CD configuration"
        "Guix packaging"))))

  (milestones
    (v0.1.0
      (status . "planned")
      (features
        "Basic economic primitives"
        "Supply/demand models"
        "Policy DSL"))))
