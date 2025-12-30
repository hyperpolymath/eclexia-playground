;; SPDX-License-Identifier: AGPL-3.0-or-later
;; ECOSYSTEM.scm - Ecosystem positioning

(ecosystem
  (version . "1.0.0")
  (name . "eclexia-playground")
  (type . "language-playground")
  (purpose . "Economics as Code experimentation")

  (position-in-ecosystem
    ((parent . "language-playgrounds")
     (grandparent . "nextgen-languages")
     (category . "domain-specific-languages")))

  (related-projects
    ((tpcf
       ((relationship . "consumer")
        (description . "Trade policy framework using Eclexia")))
     (phronesis-playground
       ((relationship . "sibling-standard")
        (description . "Ethics specifications for economic models")))))

  (what-this-is
    ("Economics as Code sandbox"
     "Economic model prototyping"
     "Policy simulation"))

  (what-this-is-not
    ("Production economics platform"
     "Trading system"
     "Financial advice tool")))
