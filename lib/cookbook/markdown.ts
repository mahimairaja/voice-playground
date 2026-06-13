import rehypeSanitize from 'rehype-sanitize';

/**
 * Rehype plugins for rendering a cookbook writeup body. react-markdown runs
 * with no rehype-raw, so raw HTML in a writeup is never parsed into the tree,
 * and rehype-sanitize strips anything outside the safe element set. Writeup
 * bodies come from a public cookbook with external contributors, so this is
 * load-bearing, not cosmetic. Shared by the Writeup component and its test so
 * the security config cannot drift.
 */
export const WRITEUP_REHYPE_PLUGINS = [rehypeSanitize];
