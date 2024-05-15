
Require Import String List.

Inductive Orientation := Horizontal | Vertical.

Inductive Template :=
| Literal: string -> Template
| Stack: list Template -> Template
| Row: list Template -> Template
| Reference: string -> Template
| Hole: Orientation -> Template
| Plural: Template -> Template -> Template
| Fill: list Template -> Template -> Template
| Empty: Template.

Axiom fill : Template -> Template -> Template.

Inductive hasHole : Template -> Prop :=
| hasHole_stack: forall ts, AllHasHole ts -> hasHole (Stack ts)
| hasHole_row: forall ts, AllHasHole ts -> hasHole (Row ts)
| hasHole_hole: forall o, hasHole (Hole o)
with AllHasHole : list Template -> Prop :=
| AllHasHole_nil: AllHasHole nil
| AllHasHole_cons: forall t ts, hasHole t -> AllHasHole ts -> AllHasHole (t :: ts)
.


Inductive Refinement: Template -> Template -> Prop :=
| refine_id: forall t, Refinement t t
| refine_transitive: forall t1 t2 t3, Refinement t1 t2 -> Refinement t2 t3 -> Refinement t1 t3
| refine_missing_var : forall s, Refinement (Reference s) Empty
| refine_variable_subst: forall v s, Refinement (Reference v) (Literal s)
| refine_unfilled_hole : forall o, Refinement (Hole o) Empty
| refine_vertical_template_fill: forall t, Refinement (Hole Vertical) (Stack (t :: (Hole Vertical) :: nil))
| refine_horizontal_template_fill: forall t, Refinement (Hole Horizontal) (Row (t :: (Hole Horizontal) :: nil))
| refine_plural_source: forall t1 t2 t3, Refinement t1 t3 -> Refinement (Plural t1 t2) (Plural t3 t2)
| refine_plural_destination: forall t1 t2 t3, Refinement t2 t3 -> Refinement (Plural t1 t2) (Plural t1 t3)
| refine_plural_fill: forall t1 t2 ts, AllRefines ts t1 -> Refinement (Plural t1 t2) (Fill ts t2)
| refine_stack_fill: forall t1 t2 ts ts', hasHole t1 -> Refinement (Stack (ts ++ (t1 :: nil) ++ ts')) (Stack (ts ++ (fill t1 t2 :: nil) ++ ts'))
| refine_row_fill: forall t1 t2, hasHole t1 -> Refinement (Row (t1 :: nil)) (Row (fill t1 t2 :: nil)) 
with AllRefines : list Template -> Template -> Prop :=
| refine_nil : forall t, AllRefines nil t
| refine_cons : forall t1 ts t2, AllRefines ts t2 -> Refinement t1 t2 -> AllRefines (t1 :: ts) t2
.