define(function (require) {

    return {
        // returns javascript date
//        unixTimeToDate: function(millis) {
//            return new Date(millis);
//        }
        hashCode: function(str) {
            var hash = 0, i, chr, len;
            if (str.length === 0) return hash;
            for (i = 0, len = str.length; i < len; i++) {
                 chr   = str.charCodeAt(i);
                 hash  = ((hash << 5) - hash) + chr;
                 hash |= 0; // Convert to 32bit integer
            }
            return hash;
        },
        /* Is the current element currently visible to users*/
        isElementInViewport: function(el) {

            //special bonus for those using jQuery
            if (typeof jQuery === "function" && el instanceof jQuery) {
                el = el[0];
            }

            var rect = el.getBoundingClientRect();

            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
                rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
            );
        }
    };
});