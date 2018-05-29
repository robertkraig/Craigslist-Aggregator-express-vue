let Utils = require('./Utils');
let xml2js = require('xml2js-es6-promise');
let sortObj = require('sort-object');
let dateformat = require('dateformat');

/**
 *
 * @param {Array} request_conf
 * @param {Array} fields
 * @param {Array} location_url_param_list
 * @returns {*|Array}
 * @private
 */
const _append_and_build_search_query = (request_conf, fields, location_url_param_list) => {
    location_url_param_list = location_url_param_list || [];
    let tmp_arr = {};
    fields = fields || [];
    fields.forEach((field)=>{
        if(request_conf[field['argName']])
        {
            tmp_arr[field['argName']] = request_conf[field['argName']];
        }
    });
    tmp_arr['format'] = 'rss';

    let build_new_args = new URLSearchParams(tmp_arr);
    let build_new_args_str = build_new_args.toString();
    location_url_param_list.forEach((value, key)=>{
        location_url_param_list[key]['url']+=build_new_args_str;
    });
    return location_url_param_list;
};

/**
 *
 * @param {String} xml
 * @param {Object} location
 * @private
 */
const _parse_xml = async (xml, location) =>
{
    let xml2Obj = await xml2js(xml);

    let items = xml2Obj['rdf:RDF']['item'] || [];
    return items.map((item)=>{
        return {
            location:location['partial'],
            date:item['dc:date'],
            source:item['dc:source'],
            title:item['dc:title']
        };
    });
};

/**
 *
 * @param {Array} search_items
 * @private
 */
const _process_data = async (search_items) => {
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

let _get_records = async (location) =>
{
    let content = await Utils.getFileCache(location['url']);
    let parsed_data = await _parse_xml(content, location);
    return _process_data(parsed_data);
};

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
        this.request_conf = args;
        this.include = include;
        this.locations = locations;
        this.fields = fields;
    }

    /**
     *
     * @returns {Promise<Array>}
     */
    async fetchData()
    {
        let test_rules = this.include.map((val)=>{
            return val.replace(/\./g,'\\.').replace(/\+/g,'(.+)');
        }).join('|');

        let locations = _append_and_build_search_query(this.request_conf, this.fields, this.locations);
        let testRegex = new RegExp(`(${test_rules})`);
        for(let idx in locations)
        {
            let location = locations[idx];
            if(testRegex.test(location['url']))
            {
                let list = await _get_records(location);
                this._record_list = this._record_list.concat(list);
            }
        }

        return this._record_list;
    }

}

module.exports = Scraper;