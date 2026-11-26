// Listed by hand: a glob makes TypeORM require() raw .ts files, which only works under a TS loader.
// index.spec.ts fails when a migration file is missing here.
import { InitialSchema1778786520480 } from './1778786520480-InitialSchema';
import { AddCurrencyToBudgetAndExpense1778863962414 } from './1778863962414-add_currency_to_budget_and_expense';
import { MakeBudgetAmountNullable1787416141438 } from './1787416141438-make_budget_amount_nullable';
import { RenameBudgetToEnvelope1787416726397 } from './1787416726397-rename_budget_to_envelope';
import { CreateCategoryTable1787855803000 } from './1787855803000-create_category_table';
import { MakeCategoryUseridNullable1787857404000 } from './1787857404000-make_category_userid_nullable';
import { DedupeGlobalCategories1787857667000 } from './1787857667000-dedupe_global_categories';
import { EnvelopeCategoryFk1787950000000 } from './1787950000000-envelope_category_fk';
import { AddDecimalPrecisionToAmounts1788391702637 } from './1788391702637-add_decimal_precision_to_amounts';
import { CreatePaymentMethod1794870000000 } from './1794870000000-create_payment_method';
import { CapitalizeLowercasedNames1794880000000 } from './1794880000000-capitalize_lowercased_names';
import { CreateCategorySeed1794890000000 } from './1794890000000-create_category_seed';
import { AuditBlock1Indexes1794900000000 } from './1794900000000-audit_block_1_indexes';
import { DropRedundantUseridIndexes1794910000000 } from './1794910000000-drop_redundant_userid_indexes';
import { WidenEnvelopeSpentPrecision1794920000000 } from './1794920000000-widen_envelope_spent_precision';

export const migrations = [
  InitialSchema1778786520480,
  AddCurrencyToBudgetAndExpense1778863962414,
  MakeBudgetAmountNullable1787416141438,
  RenameBudgetToEnvelope1787416726397,
  CreateCategoryTable1787855803000,
  MakeCategoryUseridNullable1787857404000,
  DedupeGlobalCategories1787857667000,
  EnvelopeCategoryFk1787950000000,
  AddDecimalPrecisionToAmounts1788391702637,
  CreatePaymentMethod1794870000000,
  CapitalizeLowercasedNames1794880000000,
  CreateCategorySeed1794890000000,
  AuditBlock1Indexes1794900000000,
  DropRedundantUseridIndexes1794910000000,
  WidenEnvelopeSpentPrecision1794920000000,
];
