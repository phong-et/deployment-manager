// more expanded featues
function getQueryParam(name, queryString) {
    var match = RegExp(name + '=([^&]*)').exec(queryString || location.search);
    return match && decodeURIComponent(match[1]);
}

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

    theme = getCookie('chuta_theme') || 'neptune';
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
                    //makeItem('classic', 'Classic', 'theme'),
                    //makeItem('crisp', 'Crisp', 'theme'),
                    //makeItem('gray', 'Gray', 'theme'),
                    makeItem('neptune', 'Neptune', 'theme'),
                    //makeItem('triton', 'Triton', 'theme'),
                    //'-',
                    //makeItem('vi', 'Vietnam', 'locale'),
                    //makeItem('en', 'English', 'locale'),
                    //'-',
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
                    {leaf: true, text: 'Site FCD - BO', iconCls: 'fa fa-check-circle', path:'checkdate'}
                ]
            }
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
            }, /*{
                region: 'east',
                title: 'Tiện Ích Chung',
                collapsible: true,
                collapsed:true,
                split: true,
                items: [{
                    xtype: 'datepicker'

                }]
            },*/ {
                region: 'center',
                title:'Views',
                header:false,
                itemId: 'tpMain',
                xtype: 'tabpanel', // TabPanel itself has no title
                activeTab: 0,      // First tab active by default
                plugins: ['tabreorderer'],
                scrollable:false,
                defaults: {
                    scrollable: false,
                    closable: true,
                    frame: false,
                    border: false,
                    loadMask: true,
                    bodyPadding: 10,
                    loadOnRender: true
                }
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
            title: 'Site Find Check Deploy - BO',
            iconCls:'fa fa-check-circle',
            autoEl: {
                tag: "iframe",
                src: 'checkdate?subClientNames=' + getQueryParam('subClientNames')
            }
        });
        getCmp('#tpMain').setActiveTab(tab);
    }
});
