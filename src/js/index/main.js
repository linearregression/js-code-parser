/* global define */

define(['./messages', 'viz', 'print', './code'], function (messages, viz, print, code) {

    viz.addSankey(false, true, 'chart', "/json/viz.json");

    print(messages.getHello());
});