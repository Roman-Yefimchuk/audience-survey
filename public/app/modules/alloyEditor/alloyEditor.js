"use strict";

angular.module('alloyEditor', [])

    .directive('alloyEditor', [
        '$timeout',

        function ($timeout) {
            return {
                restrict: 'A',
                scope: {
                    model: "=alloyEditor"
                },
                controller: ['$scope', function ($scope) {
                }],
                link: function ($scope, element) {
                    var editor,
                        model = $scope.model;

                    $scope.$on('$destroy', function () {
                        editor.destroy();
                    });
                    element[0].innerHTML = model.description;

                    editor = AlloyEditor.editable(element[0], {
                        enterMode: CKEDITOR.ENTER_BR,
                        shiftEnterMode: CKEDITOR.ENTER_P,
                        toolbars: {
                            add: {
                                buttons: ['image', 'table', 'hline']
                            },

                            styles: {
                                selections: [
                                    {
                                        name: 'text',
                                        buttons: [{
                                            name: 'styles',
                                            cfg: {
                                                styles: [
                                                    {
                                                        name: 'Head 1',
                                                        style: {element: 'h1'}
                                                    },
                                                    {
                                                        name: 'Head 2',
                                                        style: {element: 'h2'}
                                                    },
                                                    {
                                                        name: 'Big',
                                                        style: {element: 'big'}
                                                    },
                                                    {
                                                        name: 'Small',
                                                        style: {element: 'small'}
                                                    },
                                                    {
                                                        name: 'Code',
                                                        style: {element: 'code'}
                                                    }
                                                ]
                                            }
                                        },
                                            'bold', 'italic', 'underline', 'strike', 'link', 'ul', 'ol', 'code', 'quote', 'removeFormat'],
                                        test: AlloyEditor.SelectionTest.text
                                    },
                                    {
                                        name: 'link',
                                        buttons: ['linkEdit'],
                                        test: AlloyEditor.SelectionTest.link
                                    },
                                    {
                                        name: 'table',
                                        buttons: ['tableHeading', 'tableRow', 'tableColumn', 'tableCell', 'tableRemove'],
                                        test: AlloyEditor.SelectionTest.table
                                    }
                                ]
                            }
                        }
                    });
                    editor._editor.on('change', function (evt) {
                        model.description = evt.editor.getData();
                    });
                }
            };
        }
    ]);