function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return undefined;
}
var getCmp = function (query) {
    return Ext.ComponentQuery.query(query)[0];
};
var getCmps = function (query) {
    return Ext.ComponentQuery.query(query);
};
var theme, locale, others;

Ext.define('ET.ThemeSwitcher', function () {

    theme = getCookie('chuta_theme') || 'crisp';
    setCookie('chuta_theme', theme, 99);

    locale = getCookie('chuta_locale') || 'vi';
    setCookie('chuta_locale', locale, 99);

    if (!Ext.themeName && !!theme) {
        var m = theme.match(/^([\w-]+)-(?:he)$/);
        Ext.themeName = m ? m[1] : theme;
    }

    return {
        extend: 'Ext.Container',
        xtype: 'themeSwitcher',
        id: 'theme-switcher-btn',
        margin: '0 10 0 0',
        layout: 'hbox',
        initComponent: function () {
            function setQueryParam(name, value) {
                if (name == 'others') {
                    location.replace("/signout");
                } else {
                    location.replace("/");
                }
            }

            function makeItem(value, text, paramName) {
                var checked = value === (paramName == "theme" ? theme : (paramName == "locale" ? locale : others));
                return {
                    text: text,
                    group: paramName + 'group',
                    checked: checked,
                    handler: function () {
                        if (!checked) {
                            setCookie('chuta_' + paramName, value, 99);
                            setQueryParam(paramName, value);
                        }
                    }
                };
            }

            var menu = new Ext.menu.Menu({
                items: [
                    makeItem('classic', 'Classic', 'theme'),
                    makeItem('crisp', 'Crisp', 'theme'),
                    makeItem('gray', 'Gray', 'theme'),
                    makeItem('neptune', 'Neptune', 'theme'),
                    makeItem('triton', 'Triton', 'theme'),
                    '-',
                    makeItem('vi', 'Vietnam', 'locale'),
                    makeItem('en', 'English', 'locale'),
                    '-',
                    makeItem('signout', 'Sign Out', 'others'),
                ]
            });
            this.items = [{
                xtype: 'component',
                id: 'theme-switcher',
                cls: 'ks-theme-switcher',
                margin: '0 5 0 0',
                listeners: {
                    scope: this,
                    click: function (e) {
                        menu.showBy(this);
                    },
                    element: 'el'
                }
            }];

            this.callParent();
        }
    };
});
Ext.define('ET.Files', {
    extend: 'Ext.data.TreeStore',
    root: {
        text: 'Ext JS',
        expanded: true,
        children: [
            {
                text: 'Site Management',
                iconCls: 'fa fa-cog',
                expanded: true,
                children: [
                    //{leaf: true, text: 'Site CRUD', iconCls: 'fa fa-paw', path: 'crudsite'},
                    {leaf: true, text: 'Site Finding', iconCls: 'fa fa-search', path: 'findsite'},
                    {leaf: true, text: 'Site Check Deploy', iconCls: 'fa fa-check-circle', path:'checkdate'}
                ]
            }, {
                text: 'WL Management',
                iconCls: 'fa fa-users',
                expanded: true,
                children: [
                    //{leaf: true, text: 'Client', iconCls: 'fa fa-street-view', path: 'client'},
                    //{leaf: true, text: 'Sub Client', iconCls: 'fa fa-user', path: 'sub-client'}
                ]
            }/*, {
                text: 'Deploying', iconCls: 'fa fa-list-alt',
                children: [
                    {leaf: true, text: 'Automatic Deploy', iconCls: 'fa fa-credit-card'},
                    {leaf: true, text: 'Handle Deploy', iconCls: 'fa fa-file-text'}
                ]
            },
            {leaf: true, text: 'Options Tool', iconCls: 'fa fa-cog'}
            */
        ]
    }
});

Ext.define('ET.home',
    function () {
        var lastFilterValue;
        return {
            extend: 'Ext.container.Container',
            layout: 'border',
            listeners: {
                add: function (c, i) {
                    if (i.xtype == 'bordersplitter') {
                        if (theme == 'neptune' || theme == 'crisp') {
                            i.width = 8;
                        } else if (theme == 'triton') {
                            i.width = 10;
                        }
                    }
                }
            },
            items: [{
                title:'Header',
                header:false,
                region: 'north',
                height: 52,
                bodyCls: 'app-header-grad-' + theme,
                html: '<div class="app-logo" >',
                border: false,
                horizontalAlign: 'right',
                layout: {
                    type: 'hbox',
                    pack: 'end',
                    align: 'middle'
                },
                items: [{
                    xtype: 'label',
                    flex: 1,
                    html: '<span style="text-align:center;font-family:yellowtail;color:white;"><h2>ET\'s Support Page</h2></span>'
                }, {
                    xtype: 'themeSwitcher'
                }]
            }, {
                region: 'west',
                collapsible: true,
                collapsed:true,
                bodyStyle: 'border:0px',
                split: true,

                title: Ext.dom.Query.select('#username')[0].innerHTML,
                width: 200,
                layout: 'fit',
                dockedItems: [{
                    xtype: 'textfield',
                    dock: 'top',
                    emptyText: 'Tìm Kiếm',
                    enableKeyEvents: true,
                    triggers: {
                        clear: {
                            cls: 'x-form-clear-trigger',
                            handler: 'onClearTriggerClick',
                            hidden: true,
                            scope: 'this'
                        },
                        search: {
                            cls: 'x-form-search-trigger',
                            weight: 1,
                            handler: 'onSearchTriggerClick',
                            scope: 'this'
                        }
                    },
                    onClearTriggerClick: function () {
                        this.setValue();
                    },

                    onSearchTriggerClick: function () {
                        //alert('search');
                    },
                    listeners: {
                        change: function (field, value) {
                            var me = this;
                            var tree = getCmp('#trpNav');
                            if (value) {
                                //me.preFilterSelection = me.getViewModel().get('selectedView');
                                tree.rendererRegExp = new RegExp('(' + value + ')', "gi");
                                field.getTrigger('clear').show();
                                //me.filterStore(value);
                                //search now
                                var searchString = value.toLowerCase();
                                var store = tree.store;
                                var filterFn = function (node) {
                                    var children = node.childNodes,
                                        len = children && children.length,
                                        visible = v.test(node.get('text')),
                                        i;
                                    // If the current node does NOT match the search condition
                                    // specified by the user...
                                    if (!visible) {
                                        // Check to see if any of the child nodes of this node
                                        // match the search condition.  If they do then we will
                                        // mark the current node as visible as well.
                                        for (i = 0; i < len; i++) {
                                            if (children[i].isLeaf()) {
                                                visible = children[i].get('visible');
                                            }
                                            else {
                                                visible = filterFn(children[i]);
                                            }
                                            if (visible) {
                                                break;
                                            }
                                        }
                                    }
                                    else { // Current node matches the search condition...
                                        // Force all of its child nodes to be visible as well so
                                        // that the user is able to select an example to display.
                                        for (i = 0; i < len; i++) {
                                            children[i].set('visible', true);
                                        }
                                    }
                                    return visible;
                                };
                                var v;
                                if (searchString.length < 1) {
                                    store.clearFilter();
                                } else {
                                    v = new RegExp(searchString, 'i');
                                    store.getFilters().replaceAll({
                                        filterFn: filterFn
                                    });
                                }
                            } else {
                                tree.rendererRegExp = null;
                                tree.store.clearFilter();
                                field.getTrigger('clear').hide();

                                // Ensure selection is still selected.
                                // It may have been evicted by the filter
                                //if (me.preFilterSelection) {
                                //    tree.ensureVisible(me.preFilterSelection, {
                                //        select: true
                                //    });
                                //}
                            }
                        }
                    }
                }],
                items: [{
                    xtype: 'treepanel',
                    itemId: 'trpNav',
                    bodyStyle: 'border-top:0px',
                    rootVisible: false,
                    animate: true,
                    hideHeaders: true,
                    columns: [{
                        xtype: 'treecolumn',
                        flex: 1,
                        dataIndex: 'text',
                        renderer: function (value) {
                            //highlight filtered text
                            var rendererRegExp = getCmp('#trpNav').rendererRegExp;
                            return rendererRegExp ? value.replace(rendererRegExp, '<span style="color:red;font-weight:bold">$1</span>') : value;
                        }
                    }],
                    // Sharing the store synchronizes the views:
                    store: Ext.create('ET.Files', {}),
                    listeners: {
                        itemdblclick: function (t, rec, item, ind) {
                            if (rec.get('leaf')) {
                                var tab = getCmp('#tpMain').add({
                                    xtype: "component",
                                    title: rec.get('text'),
                                    iconCls: rec.get('iconCls'),
                                    autoEl: {
                                        tag: "iframe",
                                        src: rec.get('path')
                                    }
                                });
                                getCmp('#tpMain').setActiveTab(tab);
                            }
                        }
                    }
                }]
                // could use a TreePanel or AccordionLayout for navigational items
            }, {
                region: 'east',
                title: 'Tiện Ích Chung',
                collapsible: true,
                collapsed:true,
                split: true,
                items: [{
                    xtype: 'datepicker'

                }]
            }, {
                region: 'center',
                title:'Views',
                header:false,
                itemId: 'tpMain',
                xtype: 'tabpanel', // TabPanel itself has no title
                activeTab: 0,      // First tab active by default
                plugins: ['tabreorderer'],
                defaults: {
                    scrollable: true,
                    closable: true,
                    frame: false,
                    border: false,
                    loadMask: true,
                    bodyPadding: 10,
                    loadOnRender: true
                },
                //items: [{
                //    title: 'Dashboard',
                //    bodyStyle: 'background-image:url(images/square.gif)',
                //    padding: 10,
                //    items: [{
                //        xtype: 'panel',
                //        collapsible: true,
                //        closable: true,
                //        draggable: true,
                //        frame: true,
                //        shrinkWrap: true,
                //        title: 'Tình Hình Kinh Doanh',
                //        items: [{
                //            xtype: 'cartesian',
                //            width: 500,
                //            height: 300,
                //            store: {
                //                fields: ['name', 'g1', 'g2'],
                //                data: [
                //                    {"name": "Jan", "g1": 18.34, "g2": 30.23},
                //                    {"name": "Feb", "g1": 2.67, "g2": 14.87},
                //                    {"name": "Mar", "g1": 1.90, "g2": 5.72},
                //                    {"name": "Apr", "g1": 21.37, "g2": 29.31},
                //                    {"name": "May", "g1": 2.67, "g2": 8.53},
                //                    {"name": "Jun", "g1": 18.22, "g2": 20.33},
                //                    {"name": "Jul", "g1": 28.51, "g2": 12.43},
                //                    {"name": "Aug", "g1": 34.43, "g2": 4.40},
                //                    {"name": "Sep", "g1": 21.65, "g2": 13.87},
                //                    {"name": "Oct", "g1": 22.98, "g2": 35.44},
                //                    {"name": "Nov", "g1": 32.96, "g2": 38.70},
                //                    {"name": "Dec", "g1": 48, "g2": 51.90}
                //                ]
                //            },
                //
                //            interactions: {
                //                type: 'panzoom'
                //            },
                //            legend: {
                //                docked: 'bottom'
                //            },
                //
                //            axes: [{
                //                type: 'numeric',
                //                position: 'left',
                //                grid: true
                //            }, {
                //                type: 'category',
                //                position: 'bottom',
                //                visibleRange: [0, 0.5]
                //            }],
                //
                //            series: [{
                //                type: 'bar3d',
                //                xField: 'name',
                //                yField: ['g1', 'g2'],
                //                title: ['Lợi Nhuận', 'Doanh Số'],
                //                style: {
                //                    stroke: '#666666',
                //                    fillOpacity: 0.8
                //                }
                //            }]
                //        }]
                //
                //    }]
                //}]
            }]
        }
    }()
);

Ext.application({
    name: 'ET',
    autoCreateViewport: 'ET.home',
    launch: function () {
        var tab = getCmp('#tpMain').add({
            xtype: "component",
            title: 'Site Find Check',
            iconCls:'fa fa-check-circle',
            autoEl: {
                tag: "iframe",
                src: 'checkdate'
            }
        });
        getCmp('#tpMain').setActiveTab(tab);
    }
});
