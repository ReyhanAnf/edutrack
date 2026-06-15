// This module MUST be imported before mathquill4keyboard.
// ESM imports are hoisted, so the window assignment here runs
// before any code in the importing module.
// @ts-ignore
import jQuery from 'jquery';
// @ts-ignore
window.jQuery = jQuery;
// @ts-ignore
window.$ = jQuery;
