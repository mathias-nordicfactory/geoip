var mongoose = require('mongoose');
//network;geoname_id;registered_country_geoname_id;represented_country_geoname_id;is_anonymous_proxy;is_satellite_provider;postal_code;latitude;longitude
module.exports = mongoose.model('IP',{
	startRange: String,
	endRange: String,
    countryCode: String,
    country: String,
    city: String
});