/**
 * Conventional Commits, enforced on the message rather than trusted to
 * discipline.
 *
 * This is the one gate that guards something the others cannot reach:
 * a malformed message is in the history the moment it lands, and taking
 * it back out means rewriting history. Every other check here fails a
 * commit you can simply redo.
 *
 * Stock config-conventional, no overrides. The repo already matched it
 * before this was added - 30 of 30 commits, longest subject 88 chars
 * against the 100 allowed - so there is nothing to relax.
 */
// Named rather than exported anonymously, so eslint's
// import/no-anonymous-default-export stays quiet. A standing warning is
// how people learn to stop reading warnings.
const config = { extends: ["@commitlint/config-conventional"] };

export default config;
