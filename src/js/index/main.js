/* global define */

/** convention: reusable components don't start with ./
 */
define(['viz', './code'], function (viz, code) {

    viz.addSankey(false, true, 'chart', "/json/viz.json");
});