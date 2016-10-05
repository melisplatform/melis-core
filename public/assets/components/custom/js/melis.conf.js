var MELIS = {
    debug: true,
    active_key: 0,
    active_option: '',
    treeOptionsVal:[],
    bodyLoader: 'body-content-loader',
    idBodyContentLoader: 'id-body-content-loader',
    classNewPageInclude: {
        commun: 'page-loaded',
        iframe: 'include-content-iframe',
        xhr: 'include-content-xhr'
    },
    plugins: {
        tree: {
            id: "id-mod-menu-dynatree",
            debug: false,
            pathXhr: "/MelisCms/assets/json/melistree.json",
            idItem: "id-mod-menu-dynatree-item-",
            classActive: "dynatree-active"
        },
        tabs: {
            home: {
                key: "home"
            },
            levelA: {
                idWrapLevelA: "id-wrap-maintabs-tabs",
                idLevelA: "id-mod-maintabs-tabs",
                iconeDefault: "tag",
                idItem: "id-mod-maintabs-tabs-item-"
            },
            levelB: {
                idWrapLevelB: "id-wrap-maintabs-tabs-options",
                idLevelB: "id-mod-maintabs-tabs-options"
            }
        },
        pages: {
            idItem: "id-maintabs-page"
        }
    }
};









