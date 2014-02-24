$(document).ready(function () {
    $("input[name=ceanume]:radio").change(function () {
        $('.flddimensiuni').toggleClass('hidden');
        $('.fldgreutate').toggleClass('hidden');
    });

});
