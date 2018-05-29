let Utils = require('./Utils');
let xml2js = require('xml2js-es6-promise');
let sortObj = require('sort-object');
let dateformat = require('dateformat');

class Scraper {


    /**
     *
     * @param {Array} args
     * @param {Array} include
     * @param {Array} locations
     * @param {Array} fields
     */
    constructor(args, include, locations, fields)
    {
        /**
         *
         * @type {Array}
         * @private
         */
        this._record_list = [];

        this.initialize(args, include, locations, fields);
    }

    /**
     *
     * @param {Array} args
     * @param {Array} include
     * @param {Array} locations
     * @param {Array} fields
     */
    async initialize(args, include, locations, fields)
    {
        let test_rules = include.map((val)=>{
            return val.replace(/\./g,'\\.').replace(/\+/g,'(.+)');
        }).join('|');

        locations = this._append_and_build_search_query(args, fields, locations);
        let testRegex = new RegExp(`(${test_rules})`);
        locations.forEach(async (place)=>{
            if(testRegex.test(place['url']))
            {
                let list = await this._get_records(place);
                this._record_list = this._record_list.concat(list);
            }
        })
    }

    /**
     *
     * @param {Array} args
     * @param {Array} fields
     * @param {Array} location_url_param_list
     * @returns {*|Array}
     * @private
     */
    _append_and_build_search_query(args, fields, location_url_param_list)
    {
        location_url_param_list = location_url_param_list || [];
        let tmp_arr = {};
        fields = fields || [];
        fields.forEach((field)=>{
            if(args[field['argName']])
            {
                tmp_arr[field['argName']] = args[field['argName']];
            }
        });
        tmp_arr['format'] = 'rss';

        let build_new_args = new URLSearchParams(tmp_arr);
        let build_new_args_str = build_new_args.toString();
        location_url_param_list.forEach((value, key)=>{
            location_url_param_list[key]['url']+=build_new_args_str;
        });
        return location_url_param_list;
    }

    async _get_records(place)
    {
        let content = await Utils.getFileCache(place['url']);
        let parsed_data = await this._parse_xml(content, place);
        return this._process_data(parsed_data);
    }

    /**
     *
     * @param {String} xml
     * @param {Object} place
     * @private
     */
    async _parse_xml(xml, place)
    {
        let xml2Obj = await xml2js(xml);

        let items = xml2Obj['rdf:RDF']['item'] || [];
        return items.map((item)=>{
            return {
                location:place['partial'],
                date:item['dc:date'],
                source:item['dc:source'],
                title:item['dc:title']
            };
        });
    }

    /**
     *
     * @param {Array} search_items
     * @private
     */
    _process_data(search_items)
    {
        let data = {};
        search_items.forEach((item)=>{
            let date = item['date'];
            let unique_group_hash = Date.parse(date);
            data[unique_group_hash] = item;
        });

        data = sortObj(data, {
            sort: function (a, b)
            {
                if(a === b)
                    return 0;

                return a > b ? 1 : -1;
            }
        });

        // console.log(data);

        let regroup_list = {};
        let data_keys = Object.keys(data);
        data_keys.forEach((timestamp)=>{
            let _data = data[timestamp];
            try
            {
                let date = new Date(parseInt(timestamp));
                let hash_group = dateformat(date, 'isoDate');
                regroup_list[hash_group] = {};
                regroup_list[hash_group]['timestamp'] = timestamp;
                regroup_list[hash_group]['date'] = dateformat(date,'longDate');
                regroup_list[hash_group]['records'] = {};
                regroup_list[hash_group]['records'][_data['location']] = [_data];
            }
            catch(error)
            {
                console.log(error, timestamp);
            }
        });

        return regroup_list;
    }

    getRecords()
    {
        return this._record_list;
    }
}

module.exports = Scraper;