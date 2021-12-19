module.exports = grammar({
  name: 'CVDL',

  rules: {
    source_file: $ => seq(
        $.content,
        $.metadata
    ),
      key_value_pair: $ => seq($.identifier, $.col, $.info),
      comma_trailing_key_value_pair: $ => seq($.c, $.sp, $.key_value_pair),
        identifier: $ => /[a-zA-Z-\d]+/,
        info: $ => choice(
            $.identifier,
            $.phone,
            $.text
            // Todo: Add mail and website
        ),
        phone: $ => /\d+/,
      content: $ => repeat1($.section),
        section: $ => seq(
            $.section_header,
            $.section_content
        ),
          section_header: $ => seq($.tt, $.sp, $.text),
          section_content: $ => choice(
            $.text_section,
            $.list_section,
            // $.skill_section,
            $.kv_section,
            $.mkv_section
          ),
            text_section: $ => $.enclosed_text,
            kv_section: $ => seq(
                $.lp, $.identifier, $.rp,
                $.ob,
                $.key_value_pair,
                repeat($.comma_trailing_key_value_pair),
                $.cb
            ),
            mkv_section: $ => seq(
                $.lb, $.identifier, $.rb,
                $.ob,
                $.kv_section,
                repeat($.comma_trailing_kv_section),
                $.cb
            ),
              comma_trailing_kv_section: $ => seq($.c, $.sp, $.kv_section),
            list_section: $ => seq(
              $.ob, $.text,
              repeat($.comma_trailing_text),
              $.cb
            ),
              comma_trailing_text: $ => seq($.c, $.sp, $.text),
              enclosed_text: $ => seq($.q, $.text, $.q),
              text: $ => /[a-zA-Z-\d.]+[\sa-zA-Z-\d.]*/,
              sp: $ => /[ ]*/,
              tt: $ => '#',
              ob: $ => '[',
              cb: $ => ']',
              col: $ => ':',
              q: $ => '\"',
              c: $ => ',',
              lp: $ => '(',
              rp: $ => ')',
              lb: $ => '{',
              rb: $ => '}',
      metadata: $ => 'metadata'
  }
});
