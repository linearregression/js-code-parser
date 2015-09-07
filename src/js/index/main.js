/* global define */

define(['./messages', 'viz', 'print'], function (messages, viz, print) {

    viz.addSankey(false, true, 'chart', "/json/viz.json");

    print(messages.getHello());
});