var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {


    var fs = require('fs'),
        xml2js = require('xml2js');

    var parser = new xml2js.Parser();

    var GoProXmlPath = __dirname + '/../public/xml/GoPro/redirect-urls.xml';
    var GoProApacXmlPath = __dirname + '/../public/xml/GoProAPAC/redirect-urls.xml';
    var GoProEMEAXmlPath = __dirname + '/../public/xml/GoProEMEA/redirect-urls.xml';
    var GoProIntlXmlPath = __dirname + '/../public/xml/GoProInternational/redirect-urls.xml';
    var GoProMarketingXmlPath = __dirname + '/../public/xml/GoProMarketing/redirect-urls.xml';

    var renderResult = [];



    new Promise((resolve, reject) => {

        var paths = [  GoProXmlPath, GoProEMEAXmlPath, GoProApacXmlPath, GoProIntlXmlPath, GoProMarketingXmlPath ];

        paths.forEach( (xmlPath, index) => {

             fs.readFile(xmlPath, function(err, data) {

                 if(err) {
                     throw err;
                 }

                 parser.parseString(data, function (err, result) {

                     let r = result['redirect-urls']['redirect-url'];

                     r = r.filter( item => {
                         let isAccessoryType = item['destination-id'] == "mounts-accessories" && item.$['source-type'] == "product";
                         let isCameraProduct = item['destination-id'] == "cameras" && item['$']['source-type'] == 'product';
                         return isAccessoryType || isCameraProduct;
                     })
                         .map( item => {
                             return `${item.$['source-id']}`
                         })
                     ;

                    renderResult.push(r);

                    // When we are done with the last file then we resolve this promise.
                    if(index === paths.length - 1) {
                        resolve(renderResult);
                    }
                 });
             });
         });

     }).then( resolve => {
         
        let uniqueValues = [];
        let productNames = getAllNames();

        productNames
            .then( values => {
                // console.debug(values);

                [].concat.apply([], resolve).forEach( item => {
                    if(! uniqueValues.includes(item)) {
                        uniqueValues.push(item);
                    }
                });

                return uniqueValues.map( sku => {



                });
             })
            .then(function(results) {
                // console.debug(results);
                res.json(
                    results
                );
            });
     });

    function getAllNames() {
        // Now we need the products.

        // Products path
        let productsDetailsXmlPath = __dirname + '/../public/xml/products/gopro-products-all.xml';

        return new Promise((resolve, reject) => {

            fs.readFile(productsDetailsXmlPath, function (err, data) {

                if (err) {
                    throw err;
                }

                parser.parseString(data, function (err, result) {
                    resolve(result["catalog"]["product"]);
                });

            });
        });


        // return new Promise( (resolve, reject) => {
        //     fs.readFile(productsDetailsXmlPath, function (err, data) {
        //
        //         if (err) {
        //             throw err;
        //         }
        //
        //         return parser.parseString(data, function (err, result) {
        //
        //             let r = result['catalog']['product'];
        //
        //             resolve(r);
        //         });
        //     });
    }
});

module.exports = router;
