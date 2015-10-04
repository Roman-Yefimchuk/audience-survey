"use strict";

angular.module('application')

    .directive('linksEditor', [

        function () {
            return {
                scope: {
                    links: '=linksEditor'
                },
                templateUrl: '/public/views/directives/links-editor-view.html',
                controller: ['$scope', function ($scope) {

                    var linkPattern = /^\[url=([^\]]+)\]([^\[]+)\[\/url\]$/;

                    function addLink() {

                        var newLink = ($scope.newLink).trim();
                        if (newLink.length > 0) {

                            var links = $scope.links;
                            var linkPointers = $scope.linkPointers;

                            if (linkPattern.test(newLink)) {
                                newLink.replace(linkPattern, function (s, url, title) {
                                    (function (link) {
                                        links.push(link);
                                        linkPointers.push({
                                            link: link,
                                            editingLink: null
                                        });
                                    })({
                                        title: title,
                                        url: url
                                    });
                                });
                            } else {
                                (function (link) {
                                    links.push(link);
                                    linkPointers.push({
                                        link: link,
                                        editingLink: null
                                    });
                                })({
                                    title: newLink,
                                    url: newLink
                                });
                            }

                            $scope.newLink = '';
                        }
                    }

                    function editLink(linkPointer) {

                        var link = linkPointer.link;

                        if (link.title == link.url) {
                            linkPointer.editingLink = {
                                text: link.title
                            };
                        } else {
                            linkPointer.editingLink = {
                                text: '[url=@{url}]@{title}[/url]'.format(link)
                            };
                        }
                    }

                    function updateLink(linkPointer) {

                        (function (text) {
                            if (linkPattern.test(text)) {
                                text.replace(linkPattern, function (s, url, title) {
                                    linkPointer.link = {
                                        title: title,
                                        url: url
                                    };
                                });
                            } else {
                                linkPointer.link = {
                                    title: text,
                                    url: text
                                };
                            }
                        })(linkPointer.editingLink['text']);

                        linkPointer.editingLink = null;

                        var index = _.indexOf($scope.linkPointers, linkPointer);

                        $scope.links[index] = linkPointer.link;
                    }

                    function restoreLink(linkPointer) {
                        linkPointer.editingLink = null;
                    }

                    function removeLink(linkPointer) {

                        var index = _.indexOf($scope.linkPointers, linkPointer);

                        $scope.linkPointers = _.without($scope.linkPointers, linkPointer);
                        $scope.links = _.without($scope.links, $scope.links[index]);
                    }

                    $scope.newLink = '';
                    $scope.linkPointers = [];

                    $scope.addLink = addLink;
                    $scope.editLink = editLink;
                    $scope.updateLink = updateLink;
                    $scope.restoreLink = restoreLink;
                    $scope.removeLink = removeLink;

                    _.forEach($scope.links, function (link) {
                        var linkPointers = $scope.linkPointers;
                        linkPointers.push({
                            link: link,
                            editingLink: null
                        });
                    });
                }]
            };
        }
    ]);