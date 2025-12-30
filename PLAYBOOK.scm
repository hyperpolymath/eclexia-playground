;; SPDX-License-Identifier: AGPL-3.0-or-later
;; PLAYBOOK.scm - Operational runbook

(define playbook
  `((version . "1.0.0")
    (project . "eclexia-playground")
    (procedures
      ((build
         (("setup" . "just setup")
          ("build" . "just build")
          ("test" . "just test")))
       (dev
         (("shell" . "guix shell -D -f guix.scm")
          ("watch" . "just dev")))
       (economics
         (("model" . "just run-model <name>")
          ("simulate" . "just simulate <scenario>")))))
    (alerts ())
    (contacts ())))
