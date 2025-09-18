const { httpGet } = require('./mock-http-interface');
const ARNIE_QUOTE_KEY = 'Arnie Quote';
const FAILURE_KEY = 'FAILURE';
const SUCCESS_STATUS = 200;

/* This can be replaced with concrete logging service or any other library and logs can be sent to elastic search or logs visualization tool
* For simplicity using constant logger object with methods, This records the stack trace
*/
const logger = {
    info: (message, data = {}) => console.log(`[INFO] ${message}`, data),
    error: (message, error = {}) => console.error(`[ERROR] ${message}`, error),
    debug: (message, data = {}) => console.debug(`[DEBUG] ${message}`, data),
};

/**
 * Fetches an Arnie quote from a single URL
 * @param {string} url - URL to fetch from
 * @returns {Promise<Object>} { 'Arnie Quote': string } or { 'FAILURE': string }
 * NOTE: We can use retry mechanism in case of failure in real world api usage for better resiliency
 */
const fetchArnieQuote = async (url) => {
    logger.debug('Processing URL',  url );
    try {
        const response = await httpGet(url);
        const bodyData = JSON.parse(response.body);

        return response.status === SUCCESS_STATUS
            ? { [ARNIE_QUOTE_KEY]: bodyData.message }
            : { [FAILURE_KEY]: bodyData.message };
    } catch (error) {
        logger.error('Error processing URL', { url, error: error.message });
        return { [FAILURE_KEY]: error.message };
    }
};

 /**
 * Fetches Arnie quotes from multiple URLs concurrently
 * @param {string[]} urls - Array of URLs to process
 * @returns {Promise<Object[]>} Array of quote/failure objects in input order
 */
const getArnieQuotes = async (urls) => {
    logger.info('Getting arnie quotes', { urlCount: urls.length, urls });
    return Promise.all(urls.map(fetchArnieQuote));
};

module.exports = { getArnieQuotes };
