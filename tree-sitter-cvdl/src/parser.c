#include <tree_sitter/parser.h>

#if defined(__GNUC__) || defined(__clang__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wmissing-field-initializers"
#endif

#define LANGUAGE_VERSION 13
#define STATE_COUNT 54
#define LARGE_STATE_COUNT 2
#define SYMBOL_COUNT 35
#define ALIAS_COUNT 0
#define TOKEN_COUNT 16
#define EXTERNAL_TOKEN_COUNT 0
#define FIELD_COUNT 0
#define MAX_ALIAS_SEQUENCE_LENGTH 7
#define PRODUCTION_ID_COUNT 1

enum {
  sym_identifier = 1,
  sym_phone = 2,
  sym_text = 3,
  sym_sp = 4,
  sym_tt = 5,
  sym_ob = 6,
  sym_cb = 7,
  sym_col = 8,
  sym_q = 9,
  sym_c = 10,
  sym_lp = 11,
  sym_rp = 12,
  sym_lb = 13,
  sym_rb = 14,
  sym_metadata = 15,
  sym_source_file = 16,
  sym_key_value_pair = 17,
  sym_comma_trailing_key_value_pair = 18,
  sym_info = 19,
  sym_content = 20,
  sym_section = 21,
  sym_section_header = 22,
  sym_section_content = 23,
  sym_text_section = 24,
  sym_kv_section = 25,
  sym_mkv_section = 26,
  sym_comma_trailing_kv_section = 27,
  sym_list_section = 28,
  sym_comma_trailing_text = 29,
  sym_enclosed_text = 30,
  aux_sym_content_repeat1 = 31,
  aux_sym_kv_section_repeat1 = 32,
  aux_sym_mkv_section_repeat1 = 33,
  aux_sym_list_section_repeat1 = 34,
};

static const char * const ts_symbol_names[] = {
  [ts_builtin_sym_end] = "end",
  [sym_identifier] = "identifier",
  [sym_phone] = "phone",
  [sym_text] = "text",
  [sym_sp] = "sp",
  [sym_tt] = "tt",
  [sym_ob] = "ob",
  [sym_cb] = "cb",
  [sym_col] = "col",
  [sym_q] = "q",
  [sym_c] = "c",
  [sym_lp] = "lp",
  [sym_rp] = "rp",
  [sym_lb] = "lb",
  [sym_rb] = "rb",
  [sym_metadata] = "metadata",
  [sym_source_file] = "source_file",
  [sym_key_value_pair] = "key_value_pair",
  [sym_comma_trailing_key_value_pair] = "comma_trailing_key_value_pair",
  [sym_info] = "info",
  [sym_content] = "content",
  [sym_section] = "section",
  [sym_section_header] = "section_header",
  [sym_section_content] = "section_content",
  [sym_text_section] = "text_section",
  [sym_kv_section] = "kv_section",
  [sym_mkv_section] = "mkv_section",
  [sym_comma_trailing_kv_section] = "comma_trailing_kv_section",
  [sym_list_section] = "list_section",
  [sym_comma_trailing_text] = "comma_trailing_text",
  [sym_enclosed_text] = "enclosed_text",
  [aux_sym_content_repeat1] = "content_repeat1",
  [aux_sym_kv_section_repeat1] = "kv_section_repeat1",
  [aux_sym_mkv_section_repeat1] = "mkv_section_repeat1",
  [aux_sym_list_section_repeat1] = "list_section_repeat1",
};

static const TSSymbol ts_symbol_map[] = {
  [ts_builtin_sym_end] = ts_builtin_sym_end,
  [sym_identifier] = sym_identifier,
  [sym_phone] = sym_phone,
  [sym_text] = sym_text,
  [sym_sp] = sym_sp,
  [sym_tt] = sym_tt,
  [sym_ob] = sym_ob,
  [sym_cb] = sym_cb,
  [sym_col] = sym_col,
  [sym_q] = sym_q,
  [sym_c] = sym_c,
  [sym_lp] = sym_lp,
  [sym_rp] = sym_rp,
  [sym_lb] = sym_lb,
  [sym_rb] = sym_rb,
  [sym_metadata] = sym_metadata,
  [sym_source_file] = sym_source_file,
  [sym_key_value_pair] = sym_key_value_pair,
  [sym_comma_trailing_key_value_pair] = sym_comma_trailing_key_value_pair,
  [sym_info] = sym_info,
  [sym_content] = sym_content,
  [sym_section] = sym_section,
  [sym_section_header] = sym_section_header,
  [sym_section_content] = sym_section_content,
  [sym_text_section] = sym_text_section,
  [sym_kv_section] = sym_kv_section,
  [sym_mkv_section] = sym_mkv_section,
  [sym_comma_trailing_kv_section] = sym_comma_trailing_kv_section,
  [sym_list_section] = sym_list_section,
  [sym_comma_trailing_text] = sym_comma_trailing_text,
  [sym_enclosed_text] = sym_enclosed_text,
  [aux_sym_content_repeat1] = aux_sym_content_repeat1,
  [aux_sym_kv_section_repeat1] = aux_sym_kv_section_repeat1,
  [aux_sym_mkv_section_repeat1] = aux_sym_mkv_section_repeat1,
  [aux_sym_list_section_repeat1] = aux_sym_list_section_repeat1,
};

static const TSSymbolMetadata ts_symbol_metadata[] = {
  [ts_builtin_sym_end] = {
    .visible = false,
    .named = true,
  },
  [sym_identifier] = {
    .visible = true,
    .named = true,
  },
  [sym_phone] = {
    .visible = true,
    .named = true,
  },
  [sym_text] = {
    .visible = true,
    .named = true,
  },
  [sym_sp] = {
    .visible = true,
    .named = true,
  },
  [sym_tt] = {
    .visible = true,
    .named = true,
  },
  [sym_ob] = {
    .visible = true,
    .named = true,
  },
  [sym_cb] = {
    .visible = true,
    .named = true,
  },
  [sym_col] = {
    .visible = true,
    .named = true,
  },
  [sym_q] = {
    .visible = true,
    .named = true,
  },
  [sym_c] = {
    .visible = true,
    .named = true,
  },
  [sym_lp] = {
    .visible = true,
    .named = true,
  },
  [sym_rp] = {
    .visible = true,
    .named = true,
  },
  [sym_lb] = {
    .visible = true,
    .named = true,
  },
  [sym_rb] = {
    .visible = true,
    .named = true,
  },
  [sym_metadata] = {
    .visible = true,
    .named = true,
  },
  [sym_source_file] = {
    .visible = true,
    .named = true,
  },
  [sym_key_value_pair] = {
    .visible = true,
    .named = true,
  },
  [sym_comma_trailing_key_value_pair] = {
    .visible = true,
    .named = true,
  },
  [sym_info] = {
    .visible = true,
    .named = true,
  },
  [sym_content] = {
    .visible = true,
    .named = true,
  },
  [sym_section] = {
    .visible = true,
    .named = true,
  },
  [sym_section_header] = {
    .visible = true,
    .named = true,
  },
  [sym_section_content] = {
    .visible = true,
    .named = true,
  },
  [sym_text_section] = {
    .visible = true,
    .named = true,
  },
  [sym_kv_section] = {
    .visible = true,
    .named = true,
  },
  [sym_mkv_section] = {
    .visible = true,
    .named = true,
  },
  [sym_comma_trailing_kv_section] = {
    .visible = true,
    .named = true,
  },
  [sym_list_section] = {
    .visible = true,
    .named = true,
  },
  [sym_comma_trailing_text] = {
    .visible = true,
    .named = true,
  },
  [sym_enclosed_text] = {
    .visible = true,
    .named = true,
  },
  [aux_sym_content_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_kv_section_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_mkv_section_repeat1] = {
    .visible = false,
    .named = false,
  },
  [aux_sym_list_section_repeat1] = {
    .visible = false,
    .named = false,
  },
};

static const TSSymbol ts_alias_sequences[PRODUCTION_ID_COUNT][MAX_ALIAS_SEQUENCE_LENGTH] = {
  [0] = {0},
};

static const uint16_t ts_non_terminal_alias_map[] = {
  0,
};

static bool ts_lex(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (eof) ADVANCE(12);
      if (lookahead == '"') ADVANCE(30);
      if (lookahead == '#') ADVANCE(26);
      if (lookahead == '(') ADVANCE(32);
      if (lookahead == ')') ADVANCE(33);
      if (lookahead == ',') ADVANCE(31);
      if (lookahead == '.') ADVANCE(23);
      if (lookahead == ':') ADVANCE(29);
      if (lookahead == '[') ADVANCE(27);
      if (lookahead == ']') ADVANCE(28);
      if (lookahead == 'm') ADVANCE(17);
      if (lookahead == '{') ADVANCE(34);
      if (lookahead == '}') ADVANCE(35);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') SKIP(0)
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(20);
      if (lookahead == '-' ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 1:
      if (lookahead == '#') ADVANCE(26);
      if (lookahead == ',') ADVANCE(31);
      if (lookahead == ']') ADVANCE(28);
      if (lookahead == 'm') ADVANCE(7);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') SKIP(1)
      END_STATE();
    case 2:
      if (lookahead == '.') ADVANCE(23);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') SKIP(2)
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(20);
      if (lookahead == '-' ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 3:
      if (lookahead == 'a') ADVANCE(6);
      END_STATE();
    case 4:
      if (lookahead == 'a') ADVANCE(36);
      END_STATE();
    case 5:
      if (lookahead == 'a') ADVANCE(9);
      END_STATE();
    case 6:
      if (lookahead == 'd') ADVANCE(5);
      END_STATE();
    case 7:
      if (lookahead == 'e') ADVANCE(8);
      END_STATE();
    case 8:
      if (lookahead == 't') ADVANCE(3);
      END_STATE();
    case 9:
      if (lookahead == 't') ADVANCE(4);
      END_STATE();
    case 10:
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') SKIP(10)
      if (lookahead == '-' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(22);
      END_STATE();
    case 11:
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') SKIP(11)
      if (lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(23);
      END_STATE();
    case 12:
      ACCEPT_TOKEN(ts_builtin_sym_end);
      END_STATE();
    case 13:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == '.') ADVANCE(23);
      if (lookahead == 'a') ADVANCE(16);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') ADVANCE(24);
      if (lookahead == '-' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('b' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 14:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == '.') ADVANCE(23);
      if (lookahead == 'a') ADVANCE(37);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') ADVANCE(24);
      if (lookahead == '-' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('b' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 15:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == '.') ADVANCE(23);
      if (lookahead == 'a') ADVANCE(19);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') ADVANCE(24);
      if (lookahead == '-' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('b' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 16:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == '.') ADVANCE(23);
      if (lookahead == 'd') ADVANCE(15);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') ADVANCE(24);
      if (lookahead == '-' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 17:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == '.') ADVANCE(23);
      if (lookahead == 'e') ADVANCE(18);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') ADVANCE(24);
      if (lookahead == '-' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 18:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == '.') ADVANCE(23);
      if (lookahead == 't') ADVANCE(13);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') ADVANCE(24);
      if (lookahead == '-' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 19:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == '.') ADVANCE(23);
      if (lookahead == 't') ADVANCE(14);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') ADVANCE(24);
      if (lookahead == '-' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 20:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == '.') ADVANCE(23);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') ADVANCE(24);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(20);
      if (lookahead == '-' ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 21:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == '.') ADVANCE(23);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') ADVANCE(24);
      if (lookahead == '-' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    case 22:
      ACCEPT_TOKEN(sym_identifier);
      if (lookahead == '-' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(22);
      END_STATE();
    case 23:
      ACCEPT_TOKEN(sym_text);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') ADVANCE(24);
      if (lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(23);
      END_STATE();
    case 24:
      ACCEPT_TOKEN(sym_text);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ' ||
          lookahead == '-' ||
          lookahead == '.' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(24);
      END_STATE();
    case 25:
      ACCEPT_TOKEN(sym_sp);
      if (lookahead == ' ') ADVANCE(25);
      END_STATE();
    case 26:
      ACCEPT_TOKEN(sym_tt);
      END_STATE();
    case 27:
      ACCEPT_TOKEN(sym_ob);
      END_STATE();
    case 28:
      ACCEPT_TOKEN(sym_cb);
      END_STATE();
    case 29:
      ACCEPT_TOKEN(sym_col);
      END_STATE();
    case 30:
      ACCEPT_TOKEN(sym_q);
      END_STATE();
    case 31:
      ACCEPT_TOKEN(sym_c);
      END_STATE();
    case 32:
      ACCEPT_TOKEN(sym_lp);
      END_STATE();
    case 33:
      ACCEPT_TOKEN(sym_rp);
      END_STATE();
    case 34:
      ACCEPT_TOKEN(sym_lb);
      END_STATE();
    case 35:
      ACCEPT_TOKEN(sym_rb);
      END_STATE();
    case 36:
      ACCEPT_TOKEN(sym_metadata);
      END_STATE();
    case 37:
      ACCEPT_TOKEN(sym_metadata);
      if (lookahead == '.') ADVANCE(23);
      if (lookahead == '\t' ||
          lookahead == '\n' ||
          lookahead == '\r' ||
          lookahead == ' ') ADVANCE(24);
      if (lookahead == '-' ||
          ('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(21);
      END_STATE();
    default:
      return false;
  }
}

static const TSLexMode ts_lex_modes[STATE_COUNT] = {
  [0] = {.lex_state = 0},
  [1] = {.lex_state = 0},
  [2] = {.lex_state = 0},
  [3] = {.lex_state = 1},
  [4] = {.lex_state = 1},
  [5] = {.lex_state = 0},
  [6] = {.lex_state = 0},
  [7] = {.lex_state = 0},
  [8] = {.lex_state = 1},
  [9] = {.lex_state = 0},
  [10] = {.lex_state = 0},
  [11] = {.lex_state = 1},
  [12] = {.lex_state = 2},
  [13] = {.lex_state = 0},
  [14] = {.lex_state = 0},
  [15] = {.lex_state = 0},
  [16] = {.lex_state = 0},
  [17] = {.lex_state = 0},
  [18] = {.lex_state = 1},
  [19] = {.lex_state = 1},
  [20] = {.lex_state = 0},
  [21] = {.lex_state = 0},
  [22] = {.lex_state = 1},
  [23] = {.lex_state = 1},
  [24] = {.lex_state = 0},
  [25] = {.lex_state = 1},
  [26] = {.lex_state = 10},
  [27] = {.lex_state = 1},
  [28] = {.lex_state = 0},
  [29] = {.lex_state = 1},
  [30] = {.lex_state = 0},
  [31] = {.lex_state = 10},
  [32] = {.lex_state = 0},
  [33] = {.lex_state = 0},
  [34] = {.lex_state = 1},
  [35] = {.lex_state = 0},
  [36] = {.lex_state = 10},
  [37] = {.lex_state = 10},
  [38] = {.lex_state = 11},
  [39] = {.lex_state = 25},
  [40] = {.lex_state = 11},
  [41] = {.lex_state = 0},
  [42] = {.lex_state = 25},
  [43] = {.lex_state = 0},
  [44] = {.lex_state = 0},
  [45] = {.lex_state = 25},
  [46] = {.lex_state = 11},
  [47] = {.lex_state = 11},
  [48] = {.lex_state = 1},
  [49] = {.lex_state = 0},
  [50] = {.lex_state = 25},
  [51] = {.lex_state = 0},
  [52] = {.lex_state = 0},
  [53] = {.lex_state = 0},
};

static const uint16_t ts_parse_table[LARGE_STATE_COUNT][SYMBOL_COUNT] = {
  [0] = {
    [ts_builtin_sym_end] = ACTIONS(1),
    [sym_identifier] = ACTIONS(1),
    [sym_phone] = ACTIONS(1),
    [sym_text] = ACTIONS(1),
    [sym_tt] = ACTIONS(1),
    [sym_ob] = ACTIONS(1),
    [sym_cb] = ACTIONS(1),
    [sym_col] = ACTIONS(1),
    [sym_q] = ACTIONS(1),
    [sym_c] = ACTIONS(1),
    [sym_lp] = ACTIONS(1),
    [sym_rp] = ACTIONS(1),
    [sym_lb] = ACTIONS(1),
    [sym_rb] = ACTIONS(1),
    [sym_metadata] = ACTIONS(1),
  },
  [1] = {
    [sym_source_file] = STATE(51),
    [sym_content] = STATE(48),
    [sym_section] = STATE(3),
    [sym_section_header] = STATE(2),
    [aux_sym_content_repeat1] = STATE(3),
    [sym_tt] = ACTIONS(3),
  },
};

static const uint16_t ts_small_parse_table[] = {
  [0] = 7,
    ACTIONS(5), 1,
      sym_ob,
    ACTIONS(7), 1,
      sym_q,
    ACTIONS(9), 1,
      sym_lp,
    ACTIONS(11), 1,
      sym_lb,
    STATE(19), 1,
      sym_section_content,
    STATE(27), 1,
      sym_enclosed_text,
    STATE(18), 4,
      sym_text_section,
      sym_kv_section,
      sym_mkv_section,
      sym_list_section,
  [25] = 4,
    ACTIONS(3), 1,
      sym_tt,
    ACTIONS(13), 1,
      sym_metadata,
    STATE(2), 1,
      sym_section_header,
    STATE(4), 2,
      sym_section,
      aux_sym_content_repeat1,
  [39] = 4,
    ACTIONS(15), 1,
      sym_tt,
    ACTIONS(18), 1,
      sym_metadata,
    STATE(2), 1,
      sym_section_header,
    STATE(4), 2,
      sym_section,
      aux_sym_content_repeat1,
  [53] = 3,
    ACTIONS(20), 1,
      sym_cb,
    ACTIONS(22), 1,
      sym_c,
    STATE(16), 2,
      sym_comma_trailing_text,
      aux_sym_list_section_repeat1,
  [64] = 3,
    ACTIONS(24), 1,
      sym_cb,
    ACTIONS(26), 1,
      sym_c,
    STATE(6), 2,
      sym_comma_trailing_kv_section,
      aux_sym_mkv_section_repeat1,
  [75] = 3,
    ACTIONS(29), 1,
      sym_cb,
    ACTIONS(31), 1,
      sym_c,
    STATE(7), 2,
      sym_comma_trailing_key_value_pair,
      aux_sym_kv_section_repeat1,
  [86] = 1,
    ACTIONS(34), 4,
      sym_tt,
      sym_cb,
      sym_c,
      sym_metadata,
  [93] = 3,
    ACTIONS(36), 1,
      sym_cb,
    ACTIONS(38), 1,
      sym_c,
    STATE(6), 2,
      sym_comma_trailing_kv_section,
      aux_sym_mkv_section_repeat1,
  [104] = 3,
    ACTIONS(40), 1,
      sym_cb,
    ACTIONS(42), 1,
      sym_c,
    STATE(7), 2,
      sym_comma_trailing_key_value_pair,
      aux_sym_kv_section_repeat1,
  [115] = 1,
    ACTIONS(44), 4,
      sym_tt,
      sym_cb,
      sym_c,
      sym_metadata,
  [122] = 2,
    STATE(28), 1,
      sym_info,
    ACTIONS(46), 3,
      sym_identifier,
      sym_phone,
      sym_text,
  [131] = 3,
    ACTIONS(38), 1,
      sym_c,
    ACTIONS(48), 1,
      sym_cb,
    STATE(9), 2,
      sym_comma_trailing_kv_section,
      aux_sym_mkv_section_repeat1,
  [142] = 3,
    ACTIONS(42), 1,
      sym_c,
    ACTIONS(50), 1,
      sym_cb,
    STATE(10), 2,
      sym_comma_trailing_key_value_pair,
      aux_sym_kv_section_repeat1,
  [153] = 3,
    ACTIONS(52), 1,
      sym_cb,
    ACTIONS(54), 1,
      sym_c,
    STATE(15), 2,
      sym_comma_trailing_text,
      aux_sym_list_section_repeat1,
  [164] = 3,
    ACTIONS(22), 1,
      sym_c,
    ACTIONS(57), 1,
      sym_cb,
    STATE(15), 2,
      sym_comma_trailing_text,
      aux_sym_list_section_repeat1,
  [175] = 1,
    ACTIONS(59), 4,
      sym_ob,
      sym_q,
      sym_lp,
      sym_lb,
  [182] = 1,
    ACTIONS(61), 2,
      sym_tt,
      sym_metadata,
  [187] = 1,
    ACTIONS(63), 2,
      sym_tt,
      sym_metadata,
  [192] = 1,
    ACTIONS(65), 2,
      sym_cb,
      sym_c,
  [197] = 1,
    ACTIONS(67), 2,
      sym_cb,
      sym_c,
  [202] = 1,
    ACTIONS(69), 2,
      sym_tt,
      sym_metadata,
  [207] = 1,
    ACTIONS(71), 2,
      sym_tt,
      sym_metadata,
  [212] = 2,
    ACTIONS(9), 1,
      sym_lp,
    STATE(20), 1,
      sym_kv_section,
  [219] = 1,
    ACTIONS(73), 2,
      sym_tt,
      sym_metadata,
  [224] = 2,
    ACTIONS(75), 1,
      sym_identifier,
    STATE(21), 1,
      sym_key_value_pair,
  [231] = 1,
    ACTIONS(77), 2,
      sym_tt,
      sym_metadata,
  [236] = 1,
    ACTIONS(79), 2,
      sym_cb,
      sym_c,
  [241] = 1,
    ACTIONS(81), 2,
      sym_tt,
      sym_metadata,
  [246] = 1,
    ACTIONS(83), 2,
      sym_cb,
      sym_c,
  [251] = 2,
    ACTIONS(75), 1,
      sym_identifier,
    STATE(14), 1,
      sym_key_value_pair,
  [258] = 2,
    ACTIONS(9), 1,
      sym_lp,
    STATE(13), 1,
      sym_kv_section,
  [265] = 1,
    ACTIONS(85), 2,
      sym_cb,
      sym_c,
  [270] = 1,
    ACTIONS(87), 2,
      sym_tt,
      sym_metadata,
  [275] = 1,
    ACTIONS(89), 1,
      sym_ob,
  [279] = 1,
    ACTIONS(91), 1,
      sym_identifier,
  [283] = 1,
    ACTIONS(93), 1,
      sym_identifier,
  [287] = 1,
    ACTIONS(95), 1,
      sym_text,
  [291] = 1,
    ACTIONS(97), 1,
      sym_sp,
  [295] = 1,
    ACTIONS(99), 1,
      sym_text,
  [299] = 1,
    ACTIONS(101), 1,
      sym_q,
  [303] = 1,
    ACTIONS(103), 1,
      sym_sp,
  [307] = 1,
    ACTIONS(105), 1,
      ts_builtin_sym_end,
  [311] = 1,
    ACTIONS(107), 1,
      sym_col,
  [315] = 1,
    ACTIONS(109), 1,
      sym_sp,
  [319] = 1,
    ACTIONS(111), 1,
      sym_text,
  [323] = 1,
    ACTIONS(113), 1,
      sym_text,
  [327] = 1,
    ACTIONS(115), 1,
      sym_metadata,
  [331] = 1,
    ACTIONS(117), 1,
      sym_ob,
  [335] = 1,
    ACTIONS(119), 1,
      sym_sp,
  [339] = 1,
    ACTIONS(121), 1,
      ts_builtin_sym_end,
  [343] = 1,
    ACTIONS(123), 1,
      sym_rb,
  [347] = 1,
    ACTIONS(125), 1,
      sym_rp,
};

static const uint32_t ts_small_parse_table_map[] = {
  [SMALL_STATE(2)] = 0,
  [SMALL_STATE(3)] = 25,
  [SMALL_STATE(4)] = 39,
  [SMALL_STATE(5)] = 53,
  [SMALL_STATE(6)] = 64,
  [SMALL_STATE(7)] = 75,
  [SMALL_STATE(8)] = 86,
  [SMALL_STATE(9)] = 93,
  [SMALL_STATE(10)] = 104,
  [SMALL_STATE(11)] = 115,
  [SMALL_STATE(12)] = 122,
  [SMALL_STATE(13)] = 131,
  [SMALL_STATE(14)] = 142,
  [SMALL_STATE(15)] = 153,
  [SMALL_STATE(16)] = 164,
  [SMALL_STATE(17)] = 175,
  [SMALL_STATE(18)] = 182,
  [SMALL_STATE(19)] = 187,
  [SMALL_STATE(20)] = 192,
  [SMALL_STATE(21)] = 197,
  [SMALL_STATE(22)] = 202,
  [SMALL_STATE(23)] = 207,
  [SMALL_STATE(24)] = 212,
  [SMALL_STATE(25)] = 219,
  [SMALL_STATE(26)] = 224,
  [SMALL_STATE(27)] = 231,
  [SMALL_STATE(28)] = 236,
  [SMALL_STATE(29)] = 241,
  [SMALL_STATE(30)] = 246,
  [SMALL_STATE(31)] = 251,
  [SMALL_STATE(32)] = 258,
  [SMALL_STATE(33)] = 265,
  [SMALL_STATE(34)] = 270,
  [SMALL_STATE(35)] = 275,
  [SMALL_STATE(36)] = 279,
  [SMALL_STATE(37)] = 283,
  [SMALL_STATE(38)] = 287,
  [SMALL_STATE(39)] = 291,
  [SMALL_STATE(40)] = 295,
  [SMALL_STATE(41)] = 299,
  [SMALL_STATE(42)] = 303,
  [SMALL_STATE(43)] = 307,
  [SMALL_STATE(44)] = 311,
  [SMALL_STATE(45)] = 315,
  [SMALL_STATE(46)] = 319,
  [SMALL_STATE(47)] = 323,
  [SMALL_STATE(48)] = 327,
  [SMALL_STATE(49)] = 331,
  [SMALL_STATE(50)] = 335,
  [SMALL_STATE(51)] = 339,
  [SMALL_STATE(52)] = 343,
  [SMALL_STATE(53)] = 347,
};

static const TSParseActionEntry ts_parse_actions[] = {
  [0] = {.entry = {.count = 0, .reusable = false}},
  [1] = {.entry = {.count = 1, .reusable = false}}, RECOVER(),
  [3] = {.entry = {.count = 1, .reusable = true}}, SHIFT(45),
  [5] = {.entry = {.count = 1, .reusable = true}}, SHIFT(40),
  [7] = {.entry = {.count = 1, .reusable = true}}, SHIFT(38),
  [9] = {.entry = {.count = 1, .reusable = true}}, SHIFT(37),
  [11] = {.entry = {.count = 1, .reusable = true}}, SHIFT(36),
  [13] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_content, 1),
  [15] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_content_repeat1, 2), SHIFT_REPEAT(45),
  [18] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_content_repeat1, 2),
  [20] = {.entry = {.count = 1, .reusable = true}}, SHIFT(23),
  [22] = {.entry = {.count = 1, .reusable = true}}, SHIFT(50),
  [24] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_mkv_section_repeat1, 2),
  [26] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_mkv_section_repeat1, 2), SHIFT_REPEAT(42),
  [29] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_kv_section_repeat1, 2),
  [31] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_kv_section_repeat1, 2), SHIFT_REPEAT(39),
  [34] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_kv_section, 7),
  [36] = {.entry = {.count = 1, .reusable = true}}, SHIFT(22),
  [38] = {.entry = {.count = 1, .reusable = true}}, SHIFT(42),
  [40] = {.entry = {.count = 1, .reusable = true}}, SHIFT(8),
  [42] = {.entry = {.count = 1, .reusable = true}}, SHIFT(39),
  [44] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_kv_section, 6),
  [46] = {.entry = {.count = 1, .reusable = false}}, SHIFT(30),
  [48] = {.entry = {.count = 1, .reusable = true}}, SHIFT(34),
  [50] = {.entry = {.count = 1, .reusable = true}}, SHIFT(11),
  [52] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_list_section_repeat1, 2),
  [54] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_list_section_repeat1, 2), SHIFT_REPEAT(50),
  [57] = {.entry = {.count = 1, .reusable = true}}, SHIFT(29),
  [59] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_section_header, 3),
  [61] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_section_content, 1),
  [63] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_section, 2),
  [65] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_comma_trailing_kv_section, 3),
  [67] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_comma_trailing_key_value_pair, 3),
  [69] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_mkv_section, 7),
  [71] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_list_section, 3),
  [73] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_enclosed_text, 3),
  [75] = {.entry = {.count = 1, .reusable = true}}, SHIFT(44),
  [77] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_text_section, 1),
  [79] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_key_value_pair, 3),
  [81] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_list_section, 4),
  [83] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_info, 1),
  [85] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_comma_trailing_text, 3),
  [87] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_mkv_section, 6),
  [89] = {.entry = {.count = 1, .reusable = true}}, SHIFT(32),
  [91] = {.entry = {.count = 1, .reusable = true}}, SHIFT(52),
  [93] = {.entry = {.count = 1, .reusable = true}}, SHIFT(53),
  [95] = {.entry = {.count = 1, .reusable = true}}, SHIFT(41),
  [97] = {.entry = {.count = 1, .reusable = true}}, SHIFT(26),
  [99] = {.entry = {.count = 1, .reusable = true}}, SHIFT(5),
  [101] = {.entry = {.count = 1, .reusable = true}}, SHIFT(25),
  [103] = {.entry = {.count = 1, .reusable = true}}, SHIFT(24),
  [105] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 2),
  [107] = {.entry = {.count = 1, .reusable = true}}, SHIFT(12),
  [109] = {.entry = {.count = 1, .reusable = true}}, SHIFT(47),
  [111] = {.entry = {.count = 1, .reusable = true}}, SHIFT(33),
  [113] = {.entry = {.count = 1, .reusable = true}}, SHIFT(17),
  [115] = {.entry = {.count = 1, .reusable = true}}, SHIFT(43),
  [117] = {.entry = {.count = 1, .reusable = true}}, SHIFT(31),
  [119] = {.entry = {.count = 1, .reusable = true}}, SHIFT(46),
  [121] = {.entry = {.count = 1, .reusable = true}},  ACCEPT_INPUT(),
  [123] = {.entry = {.count = 1, .reusable = true}}, SHIFT(35),
  [125] = {.entry = {.count = 1, .reusable = true}}, SHIFT(49),
};

#ifdef __cplusplus
extern "C" {
#endif
#ifdef _WIN32
#define extern __declspec(dllexport)
#endif

extern const TSLanguage *tree_sitter_CVDL(void) {
  static const TSLanguage language = {
    .version = LANGUAGE_VERSION,
    .symbol_count = SYMBOL_COUNT,
    .alias_count = ALIAS_COUNT,
    .token_count = TOKEN_COUNT,
    .external_token_count = EXTERNAL_TOKEN_COUNT,
    .state_count = STATE_COUNT,
    .large_state_count = LARGE_STATE_COUNT,
    .production_id_count = PRODUCTION_ID_COUNT,
    .field_count = FIELD_COUNT,
    .max_alias_sequence_length = MAX_ALIAS_SEQUENCE_LENGTH,
    .parse_table = &ts_parse_table[0][0],
    .small_parse_table = ts_small_parse_table,
    .small_parse_table_map = ts_small_parse_table_map,
    .parse_actions = ts_parse_actions,
    .symbol_names = ts_symbol_names,
    .symbol_metadata = ts_symbol_metadata,
    .public_symbol_map = ts_symbol_map,
    .alias_map = ts_non_terminal_alias_map,
    .alias_sequences = &ts_alias_sequences[0][0],
    .lex_modes = ts_lex_modes,
    .lex_fn = ts_lex,
  };
  return &language;
}
#ifdef __cplusplus
}
#endif
