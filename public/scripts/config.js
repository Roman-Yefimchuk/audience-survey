"use strict";

angular.module('application')

    .constant("NAME_PATTERN", /^(\w+[a-zA-Z0-9\s]*){3}$/)
    .constant("EMAIL_PATTERN", /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    .constant("PASSWORD_PATTERN", /^(.+){6}$/)
    .constant("DEBUG_MODE", true)
    .constant("socketUrl", "http://" + window.location['host']);

var toTree = function (items) {

    var nodes = {};

    _.forEach(items, function (item) {

        var parentName = '';

        _.forEach(item.split('/'), function (name) {

            var node = nodes[name];
            if (node) {
                if (!node.name) {
                    node.name = name;
                }
            } else {
                nodes[name] = node = {
                    name: name,
                    children: []
                }
            }

            var parentNode = nodes[parentName];
            if (parentNode) {
                var children = parentNode.children;

                if (!_.find(children, function (child) {
                    return child.name == name;
                })) {
                    children.push(node);
                }
            } else {
                nodes[parentName] = parentNode = {
                    children: [node]
                };
            }

            if (!node.parent) {
                node.parent = parentNode;
            }

            parentName = name;
        });
    });

    return {
        root: nodes[''],
        nodes: nodes
    };
};