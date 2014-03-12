$(document).ready(function () {

    $(function(){

        // Bind an event to window.onhashchange that, when the hash changes, gets the
        // hash and adds the class "selected" to any matching nav link.
        $(window).hashchange( function(){
            var hash = location.hash;

            // Set the page title based on the hash.
            document.title = 'Calculator comparativ tarife servicii de curierat ' +  hash.replace( /^#/, '' );


            if (hash=='') {
                $('#process').attr("disabled", false);
                $('#results').text('');
                result = '';
                if (!$('.hiding-net').is(":visible")) $('.hiding-net').slideToggle();
                setTimeout(function () {
                    $('#process').text('Calculează');
                }, 200);
            }

        });

        // Since the event is only triggered when the hash changes, we need to trigger
        // the event now, to handle the hash the page may have loaded with.
        $(window).hashchange();

    });


    function shuffle(o){ //v1.0
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

    var curiers=['sprint','fan','nemo','vip','dragonstar','posta-romana','alo','ecco','bookurier','global','otto','star','urgent','chronos','cargus']
    var curiers_random = shuffle(curiers);
    var curiers_random_string='| ';
    curiers_random.map(function(item){
        curiers_random_string=curiers_random_string + item + ' | ';
    });

    $('.listacurieri').html(curiers_random_string);


    if (typeof console == "object") {
        console.log("%cHey! How are you doing? We're glad you are curious about this site.", "color: #ED1E79; font-size: 18px; font-family: 'Helvetica-Neue', Helvetica, Arial, sans-serif;");
        console.log("This was developed in under 6 hours in a hurry, including backend, so excuse some shortcuts and variable naming :)");
    }
    $('.flddimensiuni').slideUp(0);
    $('.fldgreutate').slideUp(0);
//    $("#disclaimer").toggle();


    $("input[name=colet]:radio").change(function () {
        if (this.value == '1') {
            $('.flddimensiuni').slideDown('fast');
            $('.fldgreutate').slideDown('fast');
        } else {
            $('.flddimensiuni').slideUp('fast');
            $('.fldgreutate').slideUp('fast');
        }
    });


    $("#disclaimer-link").click(function (e) {
        e.preventDefault();

        if ($(document).width() >= 768) {
            var discBottom = $(document).height()-$('#footer').offset().top;
            $('#disclaimer').css({bottom: discBottom})
        }

        $("#disclaimer").slideToggle(200);
    });


    $(".close-sign").click(function (e) {
        e.preventDefault();
        $("#disclaimer").slideToggle(200);
    });


    $('#results').on('click', '.curier_name', function (e) {

        if (!$(this).next(".curier_hide_detail").is(":visible")) {
            $(this).next(".curier_hide_detail").slideDown('fast');
            $(this).children().removeClass('arrow-down').addClass('arrow-up');
        } else {
            $(this).next(".curier_hide_detail").slideUp('fast');
            $(this).children().addClass('arrow-down').removeClass('arrow-up');
        }


    });

    $('#sendinfo').on('submit', function (e) {
        //check spam
        if ($('.lamisto').val() == '') {
            location.hash="#listing";
            $('#process').attr("disabled", true);
            if ($('.hiding-net').is(":visible")) {
                var result = '';
                var curiers = '';

                $('.bubblingG').toggleClass('hidden');

                $.ajax({
                    type: 'post',
                    url: 'sendinfo.php',
                    data: $(this).serialize(),
                    success: function (data) {
                        result = JSON.parse(data).result;
                        curiers = curiers + '<div class="curier top ten columns">';
                        curiers = curiers + '<div class="curier_expl"><span>* localități fără taxă suplimentară</span></div>';
                        curiers = curiers + '<div class="curier_expl"><span>Click pe <b>total</b> pentru detalii</span></div></div>';
                        result.map(function (item, index) {
                            curiers = curiers + '<div class="curier ten columns">';
                            curiers = curiers + '<div class="curier_place"><sup>#</sup>' + (index + 1) + '</div>';
                            curiers = curiers + '<div class="curier_name">' + item.transportator + ' <span class="arrow-down">Total: ' + nformat(item.valoare, 2, '.', ',') + ' lei</span></div>';
                            curiers = curiers + '<div class="curier_hide_detail">';
                            curiers = curiers + '<div class="curier_valtransport">transport: <span>' + nformat(item.valoareTransport, 2, '.', ',') + '</span></div>';
                            curiers = curiers + '<div class="curier_valAsigurare">asigurare: <span>' + nformat(item.valoareAsigurare, 2, '.', ',') + '</span></div>';
                            curiers = curiers + '<div class="curier_valRamburs">ramburs: <span>' + nformat(item.valoareRamburs, 2, '.', ',') + '</span></div>';
                            curiers = curiers + '<div class="curier_valReturDocumente">retur documente: <span>' + nformat(item.valoareReturDocumente, 2, '.', ',') + '</span></div>';
                            curiers = curiers + '<div class="curier_valIndexCombustibil">index combustibil: <span>' + nformat(item.valoareIndexCombustibil, 2, '.', ',') + '</span></div>';
                            curiers = curiers + '<div class="curier_valoareTVA">tva: <span>' + nformat(item.valoareTva, 2, '.', ',') + '</span></div>';
                            curiers = curiers + '</div>';
                            curiers = curiers + '<div class="curier_url">Website: <span><a href="' + item.Url + '" rel="nofollow" target="_blank">' + item.Url + '</a></span></div>';
                            curiers = curiers + '<div class="curier_url">Comenzi: <span><a href="' + item.UrlComanda + '" rel="nofollow" target="_blank">' + item.UrlComanda + '</a></span></div>';
                            curiers = curiers + '<div class="curier_url">Serviciu: <span>' + item.InfoNumeServiciuCurierat + '</span></div>';
                            curiers = curiers + '<div class="curier_telefon">Telefon: <span>' + item.Telefon + '</span></div>';
                            curiers = curiers + '<div class="curier_localități">Localități: <span>' + item.InfoNumarLocalitatiRetea + '*</span></div>';
                            curiers = curiers + '<div class="curier_localități">Greutate max: <span>' + item.InfoKgMaxColet + '</span></div>';
                            curiers = curiers + '<div class="curier_localități">Dimensiuni max: <span>' + item.InfoCmMaxColet + '</span></div>';
                            curiers = curiers + '</div>';
                        });
                        curiers = curiers + '<a id="process2" type="button" href="#" class="ten columns"> Calculează din nou!</button>';

                        $('.bubblingG').toggleClass('hidden');
                        $('.hiding-net').slideToggle();
                        setTimeout(function () {
                            $('#process').text('Calculează din nou!');
                        }, 200);
                        $('#results').html(curiers);
                        $('.curier_hide_detail').slideUp(0);
                        $("html, body").animate({ scrollTop: 0 }, "fast");

                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        result = 'Uuuups! S-a întâmplat ceva nemaivăzut! Adică avem o eroare pe undeva si trebuie să ai puțintică răbdare până se remediază. Pleeeease!'
                        $('.bubblingG').toggleClass('hidden');
                        $('#results').html(result);

                    },
                    complete: function () {
                        $('#process').attr("disabled", false);

                    }
                });
            } else {
                $('#process').attr("disabled", false);
                $('#results').text('');
                result = '';
                $('.hiding-net').slideToggle();

                setTimeout(function () {
                    $('#process').text('Calculează');
                }, 200);
                location.hash="";
            }
        }
        e.preventDefault();
    });
});


function nformat(number, decimals, dec_point, thousands_sep) {
    // http://kevin.vanzonneveld.net
    // +   original by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +     bugfix by: Michael White (http://getsprink.com)
    // +     bugfix by: Benjamin Lupton
    // +     bugfix by: Allan Jensen (http://www.winternet.no)
    // +    revised by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
    // +     bugfix by: Howard Yeend
    // +    revised by: Luke Smith (http://lucassmith.name)
    // +     bugfix by: Diogo Resende
    // +     bugfix by: Rival
    // +      input by: Kheang Hok Chin (http://www.distantia.ca/)
    // +   improved by: davook
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +      input by: Jay Klehr
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +      input by: Amir Habibi (http://www.residence-mixte.com/)
    // +     bugfix by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Theriault
    // *     example 1: number_format(1234.56);
    // *     returns 1: '1,235'
    // *     example 2: number_format(1234.56, 2, ',', ' ');
    // *     returns 2: '1 234,56'
    // *     example 3: number_format(1234.5678, 2, '.', '');
    // *     returns 3: '1234.57'
    // *     example 4: number_format(67, 2, ',', '.');
    // *     returns 4: '67,00'
    // *     example 5: number_format(1000);
    // *     returns 5: '1,000'
    // *     example 6: number_format(67.311, 2);
    // *     returns 6: '67.31'
    // *     example 7: number_format(1000.55, 1);
    // *     returns 7: '1,000.6'
    // *     example 8: number_format(67000, 5, ',', '.');
    // *     returns 8: '67.000,00000'
    // *     example 9: number_format(0.9, 0);
    // *     returns 9: '1'
    // *    example 10: number_format('1.20', 2);
    // *    returns 10: '1.20'
    // *    example 11: number_format('1.20', 4);
    // *    returns 11: '1.2000'
    // *    example 12: number_format('1.2000', 3);
    // *    returns 12: '1.200'
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}
